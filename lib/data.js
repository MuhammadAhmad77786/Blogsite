import { cache } from "react";
import mongoose from "mongoose";
import { connectDB } from "./db";
import { plain, escapeRegex } from "./http";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Comment from "@/models/Comment";
import SiteSettings from "@/models/SiteSettings";
import "@/models/User";
import { DEFAULT_FOOTER_BLURB, DEFAULT_SEO_DESCRIPTION, DEFAULT_SEO_TITLE, DEFAULT_SITE_TITLE, DEFAULT_TAGLINE } from "./brand";

export const PAGE_SIZE = 10;

/** Runs a data query; on failure (e.g. DB not reachable) returns the fallback instead of crashing the page. */
async function safe(fn, fallback) {
  try {
    await connectDB();
    return await fn();
  } catch {
    return fallback;
  }
}

const liveFilter = () => ({
  status: { $in: ["published", "scheduled"] },
  publishedAt: { $lte: new Date() },
});

const DEFAULT_SETTINGS = {
  siteTitle: DEFAULT_SITE_TITLE,
  tagline: DEFAULT_TAGLINE,
  logo: { url: "" },
  favicon: { url: "" },
  heroImage: { url: "" },
  bannerImage: { url: "" },
  heroSlides: [],
  ads: { network: "none", placements: {}, adsTxt: "" },
  defaultOgImage: { url: "" },
  contactEmail: "",
  socialLinks: {},
  footerBlurb: DEFAULT_FOOTER_BLURB,
  seoDefaults: {
    title: DEFAULT_SEO_TITLE,
    metaDescription: DEFAULT_SEO_DESCRIPTION,
  },
  analytics: {},
  commentsEnabled: true,
};

export const getSettings = cache(async () =>
  safe(async () => {
    const s = await SiteSettings.findOne({ singleton: "main" }).lean();
    return s ? { ...DEFAULT_SETTINGS, ...plain(s) } : DEFAULT_SETTINGS;
  }, DEFAULT_SETTINGS)
);

export const getCategories = cache(async () =>
  safe(async () => plain(await Category.find().sort({ order: 1, name: 1 }).lean()), [])
);

export async function getNavCategories() {
  return (await getCategories()).filter((c) => c.showInNavbar);
}
export async function getFooterCategories() {
  return (await getCategories()).filter((c) => c.showInFooter);
}

export async function getCategoryBySlug(slug) {
  return safe(async () => {
    const c = await Category.findOne({ slug: String(slug).toLowerCase() }).lean();
    return c ? plain(c) : null;
  }, null);
}

const CARD_FIELDS = "title slug excerpt featuredImage categories author publishedAt tags";

export async function getPosts({ page = 1, category = null, q = "", limit = PAGE_SIZE } = {}) {
  return safe(
    async () => {
      const filter = liveFilter();
      if (category && mongoose.isValidObjectId(String(category))) filter.categories = category;
      const term = String(q || "").trim().slice(0, 100);
      if (term) {
        const rx = { $regex: escapeRegex(term), $options: "i" };
        filter.$and = [{ $or: [{ title: rx }, { excerpt: rx }, { tags: rx }] }];
      }
      const p = Math.max(1, parseInt(page, 10) || 1);
      const [items, total] = await Promise.all([
        Post.find(filter)
          .sort({ publishedAt: -1 })
          .skip((p - 1) * limit)
          .limit(limit)
          .select(CARD_FIELDS)
          .populate("author", "name")
          .populate("categories", "name slug")
          .lean(),
        Post.countDocuments(filter),
      ]);
      return { items: plain(items), total, page: p, pages: Math.max(1, Math.ceil(total / limit)) };
    },
    { items: [], total: 0, page: 1, pages: 1 }
  );
}

/** Most-viewed live posts (falls back to newest when nothing has views yet). */
export async function getPopularPosts(limit = 3, excludeIds = []) {
  return safe(async () => {
    const filter = { ...liveFilter() };
    const ex = excludeIds.filter((i) => mongoose.isValidObjectId(String(i)));
    if (ex.length) filter._id = { $nin: ex };
    const items = await Post.find(filter)
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .select(CARD_FIELDS)
      .populate("author", "name")
      .populate("categories", "name slug")
      .lean();
    return plain(items);
  }, []);
}

export async function getPostBySlug(slug) {
  return safe(async () => {
    const post = await Post.findOne({ slug: String(slug).toLowerCase(), ...liveFilter() })
      .populate("author", "name bio avatar socialLinks")
      .populate("categories", "name slug adNetwork")
      .lean();
    return post ? plain(post) : null;
  }, null);
}

export async function getRelatedPosts(post, limit = 3) {
  return safe(async () => {
    const ids = (post.categories || []).map((c) => c._id);
    const items = await Post.find({ ...liveFilter(), _id: { $ne: post._id }, ...(ids.length ? { categories: { $in: ids } } : {}) })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select(CARD_FIELDS)
      .populate("author", "name")
      .populate("categories", "name slug")
      .lean();
    return plain(items);
  }, []);
}

export async function getApprovedComments(postId) {
  return safe(
    async () =>
      plain(
        await Comment.find({ post: postId, status: "approved" })
          .sort({ createdAt: 1 })
          .limit(200)
          .select("name body createdAt")
          .lean()
      ),
    []
  );
}

export async function getCommentCounts(postIds) {
  if (!postIds.length) return {};
  return safe(async () => {
    const rows = await Comment.aggregate([
      { $match: { post: { $in: postIds.map((i) => new mongoose.Types.ObjectId(i)) }, status: "approved" } },
      { $group: { _id: "$post", n: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((r) => [String(r._id), r.n]));
  }, {});
}

export async function getSitemapData() {
  return safe(
    async () => {
      const [posts, cats] = await Promise.all([
        Post.find({ ...liveFilter(), "seo.noindex": { $ne: true } }).select("slug updatedAt").lean(),
        Category.find().select("slug updatedAt").lean(),
      ]);
      return { posts: plain(posts), cats: plain(cats) };
    },
    { posts: [], cats: [] }
  );
}

export async function incrementViews(id) {
  await safe(() => Post.updateOne({ _id: id }, { $inc: { views: 1 } }), null);
}
