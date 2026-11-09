import Post from "@/models/Post";
import Tag from "@/models/Tag";
import Category from "@/models/Category";
import User from "@/models/User";
import { HttpError } from "./http";
import { makeSlug, uniqueSlug, isReserved } from "./slug";
import { sanitizeRich, stripTags } from "./sanitize";

/** Validates + normalizes a parsed post body into a safe document payload. */
export async function buildPostPayload(data, user, { existing = null } = {}) {
  const isStaff = user.role === "admin" || user.role === "editor";

  // slug
  let slug;
  if (data.slug) {
    slug = makeSlug(data.slug);
    if (!slug) throw new HttpError(400, "Invalid slug.");
    if (isReserved(slug)) throw new HttpError(400, "That slug is reserved. Choose another.");
    const clash = await Post.exists({ slug, ...(existing ? { _id: { $ne: existing._id } } : {}) });
    if (clash) throw new HttpError(409, "Another post already uses that slug.");
  } else {
    slug = await uniqueSlug(Post, makeSlug(stripTags(data.title)), existing?._id || null);
  }

  // author
  let author = existing?.author || user.id;
  if (data.author && isStaff) {
    const a = await User.exists({ _id: data.author, active: true });
    if (!a) throw new HttpError(400, "Unknown author.");
    author = data.author;
  }

  // categories must exist
  let categories = [];
  if (data.categories.length) {
    const found = await Category.find({ _id: { $in: data.categories } }).select("_id").lean();
    categories = found.map((c) => c._id);
  }

  // tags
  const tags = [...new Set(data.tags.map((t) => stripTags(t)).filter(Boolean))].slice(0, 20);

  // status / date
  // Scheduling is not available yet: posts publish immediately with today's date.
  if (data.status === "scheduled") throw new HttpError(400, "Scheduling is not available yet.");
  const now = new Date();
  let publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  if (data.status === "published") {
    const firstPublish = !existing || existing.status !== "published";
    // First time live: today's date. Later edits keep the original date (never in the future).
    if (firstPublish || !publishedAt || publishedAt > now) {
      publishedAt = firstPublish ? now : existing?.publishedAt && existing.publishedAt <= now ? existing.publishedAt : now;
    }
  }

  const clean = (img) => ({
    url: img.url,
    publicId: stripTags(img.publicId),
    alt: stripTags(img.alt),
  });

  const payload = {
    title: stripTags(data.title),
    slug,
    excerpt: stripTags(data.excerpt),
    content: sanitizeRich(data.content),
    featuredImage: clean(data.featuredImage),
    gallery: data.gallery.map(clean),
    categories,
    tags,
    author,
    status: data.status,
    adNetwork: data.adNetwork,
    publishedAt,
    seo: {
      title: stripTags(data.seo.title),
      metaDescription: stripTags(data.seo.metaDescription),
      focusKeyword: stripTags(data.seo.focusKeyword),
      canonicalUrl: data.seo.canonicalUrl,
      ogImage: data.seo.ogImage,
      noindex: data.seo.noindex,
    },
  };
  return payload;
}

export async function syncTags(tags) {
  for (const name of tags) {
    const slug = makeSlug(name);
    if (!slug) continue;
    await Tag.updateOne({ slug }, { $setOnInsert: { name, slug } }, { upsert: true });
  }
}
