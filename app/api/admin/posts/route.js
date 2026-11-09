import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, ALL_ROLES } from "@/lib/guard";
import { escapeRegex, json, parse, plain, readJson } from "@/lib/http";
import { postSchema } from "@/lib/schemas";
import { buildPostPayload, syncTags } from "@/lib/posts-admin";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

const STATUSES = ["draft", "published", "scheduled"];

export const GET = adminRoute(async (req, { user }) => {
  await connectDB();
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = 20;
  const q = String(sp.get("q") || "").trim().slice(0, 100);
  const status = String(sp.get("status") || "");
  const category = String(sp.get("category") || "");

  const filter = {};
  if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };
  if (STATUSES.includes(status)) filter.status = status;
  if (/^[a-f\d]{24}$/i.test(category)) filter.categories = category;
  if (user.role === "author") filter.author = user.id;

  const [items, total] = await Promise.all([
    Post.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("title slug status publishedAt updatedAt author categories featuredImage")
      .populate("author", "name")
      .populate("categories", "name")
      .lean(),
    Post.countDocuments(filter),
  ]);
  return json({ items: plain(items), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}, { roles: ALL_ROLES });

export const POST = adminRoute(async (req, { user }) => {
  await connectDB();
  const data = parse(postSchema, await readJson(req));
  const payload = await buildPostPayload(data, user);
  const post = await Post.create(payload);
  await syncTags(payload.tags);
  revalidateSite();
  return json({ id: String(post._id), slug: post.slug }, 201);
}, { roles: ALL_ROLES });
