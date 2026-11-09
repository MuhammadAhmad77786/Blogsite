import { connectDB } from "./db";
import { siteUrl } from "./env";
import Post from "@/models/Post";
import Category from "@/models/Category";
import SiteSettings from "@/models/SiteSettings";

export const PER_PAGE = Number(process.env.SITEMAP_PER_PAGE) || 1000;
export const TYPES = ["post", "category", "page"];

// Optional per-page tuning. Any page not listed here still goes into the sitemap with the defaults below.
const PAGE_HINTS = {
  "/": { freq: "daily", priority: "1.0", feed: true },
  "/blog": { freq: "daily", priority: "0.8", feed: true },
  "/about": { freq: "monthly", priority: "0.5" },
  "/contact": { freq: "yearly", priority: "0.5" },
  "/editorial-policy": { freq: "yearly", priority: "0.4" },
  "/privacy": { freq: "yearly", priority: "0.3" },
  "/terms": { freq: "yearly", priority: "0.3" },
  "/disclaimer": { freq: "yearly", priority: "0.3" },
  "/cookie-policy": { freq: "yearly", priority: "0.3" },
  "/copyright": { freq: "yearly", priority: "0.3" },
};
const PAGE_DEFAULT = { freq: "monthly", priority: "0.5" };

/** Static pages found under app/(site) at build time (see next.config.mjs), with a safe fallback. */
function staticPages() {
  let list = [];
  try {
    list = JSON.parse(process.env.SITE_STATIC_PAGES || "[]");
  } catch {
    list = [];
  }
  if (!list.length) list = Object.keys(PAGE_HINTS);
  return list.map((p) => ({ path: p, ...PAGE_DEFAULT, ...PAGE_HINTS[p] }));
}

/** Last time Admin → Settings changed (site name, contact email, etc. appear on the static pages). */
async function settingsUpdatedAt() {
  const s = await SiteSettings.findOne({ singleton: "main" }).select("updatedAt").lean();
  return s?.updatedAt || null;
}

export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const iso = (d) => (d ? new Date(d).toISOString() : undefined);

/** Posts that are live, indexable, and whose canonical (if set) is themselves. */
function postFilter(base) {
  return {
    status: { $in: ["published", "scheduled"] },
    publishedAt: { $lte: new Date() },
    "seo.noindex": { $ne: true },
    $expr: {
      $or: [
        { $eq: [{ $ifNull: ["$seo.canonicalUrl", ""] }, ""] },
        { $eq: ["$seo.canonicalUrl", { $concat: [base, "/", "$slug"] }] },
      ],
    },
  };
}

function imagesOf(post) {
  const out = [];
  const seen = new Set();
  const add = (url, alt, title) => {
    if (!url || !/^https:\/\//i.test(url) || seen.has(url) || out.length >= 20) return;
    seen.add(url);
    out.push({ url, alt: alt || "", title: title || "" });
  };
  add(post.featuredImage?.url, post.featuredImage?.alt || post.title, post.title);
  const re = /<img\b[^>]*>/gi;
  let m;
  while ((m = re.exec(post.content || ""))) {
    const src = /\bsrc="([^"]+)"/i.exec(m[0]);
    const alt = /\balt="([^"]*)"/i.exec(m[0]);
    if (src) add(src[1].replace(/&amp;/g, "&"), alt ? alt[1] : "", post.title);
  }
  return out;
}

async function liveCategories() {
  const rows = await Post.aggregate([
    { $match: postFilter(siteUrl()) },
    { $unwind: "$categories" },
    { $group: { _id: "$categories", last: { $max: "$updatedAt" } } },
  ]);
  if (!rows.length) return [];
  const cats = await Category.find({ _id: { $in: rows.map((r) => r._id) } }).select("slug updatedAt").lean();
  const last = new Map(rows.map((r) => [String(r._id), r.last]));
  return cats
    .map((c) => ({ slug: c.slug, lastmod: new Date(Math.max(+new Date(c.updatedAt), +new Date(last.get(String(c._id)) || 0))) }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

async function latestPostDate() {
  const p = await Post.findOne(postFilter(siteUrl())).sort({ updatedAt: -1 }).select("updatedAt").lean();
  return p?.updatedAt || null;
}

export async function sitemapIndex() {
  await connectDB();
  const base = siteUrl();
  const [postCount, cats, latest, settingsAt] = await Promise.all([
    Post.countDocuments(postFilter(base)),
    liveCategories(),
    latestPostDate(),
    settingsUpdatedAt(),
  ]);
  const entries = [];
  const pages = Math.ceil(postCount / PER_PAGE);
  for (let i = 1; i <= pages; i += 1) {
    entries.push({ loc: `${base}/post-sitemap${i === 1 ? "" : i}.xml`, lastmod: iso(latest) });
  }
  if (cats.length) {
    const lm = cats.reduce((a, c) => (c.lastmod > a ? c.lastmod : a), cats[0].lastmod);
    entries.push({ loc: `${base}/category-sitemap.xml`, lastmod: iso(lm) });
  }
  const pagesLm = [latest, settingsAt].filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0];
  entries.push({ loc: `${base}/page-sitemap.xml`, lastmod: iso(pagesLm) });
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.map((e) => `  <sitemap><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</sitemap>`).join("\n") +
    `\n</sitemapindex>\n`
  );
}

/** Returns XML string, or null when the page does not exist. */
export async function sitemapUrlset(type, page = 1) {
  if (!TYPES.includes(type)) return null;
  await connectDB();
  const base = siteUrl();
  let urls = [];

  if (type === "post") {
    const posts = await Post.find(postFilter(base))
      .sort({ publishedAt: -1 })
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .select("slug title updatedAt featuredImage content")
      .lean();
    if (!posts.length && page > 1) return null;
    urls = posts.map((p) => ({ loc: `${base}/${p.slug}`, lastmod: iso(p.updatedAt), freq: "monthly", priority: "0.8", images: imagesOf(p) }));
  } else if (type === "category") {
    if (page > 1) return null;
    urls = (await liveCategories()).map((c) => ({ loc: `${base}/category/${c.slug}`, lastmod: iso(c.lastmod), freq: "weekly", priority: "0.6", images: [] }));
  } else {
    if (page > 1) return null;
    const [latest, settingsAt] = await Promise.all([latestPostDate(), settingsUpdatedAt()]);
    const newest = (...ds) => ds.filter(Boolean).reduce((a, d) => (!a || new Date(d) > new Date(a) ? d : a), null);
    urls = staticPages().map((p) => ({
      loc: `${base}${p.path === "/" ? "/" : p.path}`,
      // Feed pages change when posts change; the others change when the site settings shown on them change.
      lastmod: iso(p.feed ? newest(latest, settingsAt) : settingsAt),
      freq: p.freq,
      priority: p.priority,
      images: [],
    }));
  }

  const body = urls
    .map((u) => {
      const imgs = u.images
        .map(
          (i) =>
            `<image:image><image:loc>${esc(i.url)}</image:loc>${i.title ? `<image:title>${esc(i.title)}</image:title>` : ""}${i.alt ? `<image:caption>${esc(i.alt)}</image:caption>` : ""}</image:image>`
        )
        .join("");
      return `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}<changefreq>${u.freq}</changefreq><priority>${u.priority}</priority>${imgs}</url>`;
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`
  );
}
