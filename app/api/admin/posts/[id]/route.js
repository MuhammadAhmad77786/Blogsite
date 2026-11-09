import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, ALL_ROLES } from "@/lib/guard";
import { HttpError, assertId, json, parse, plain, readJson } from "@/lib/http";
import { postSchema } from "@/lib/schemas";
import { buildPostPayload, syncTags } from "@/lib/posts-admin";
import { recordMove } from "@/lib/redirects";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

async function loadOwned(id, user) {
  assertId(id);
  const post = await Post.findById(id);
  if (!post) throw new HttpError(404, "Not found.");
  if (user.role === "author" && String(post.author) !== user.id) throw new HttpError(403, "Forbidden");
  return post;
}

export const GET = adminRoute(async (req, { user, params }) => {
  await connectDB();
  const post = await loadOwned(params.id, user);
  return json({ post: plain(post.toObject()) });
}, { roles: ALL_ROLES });

export const PUT = adminRoute(async (req, { user, params }) => {
  await connectDB();
  const post = await loadOwned(params.id, user);
  const data = parse(postSchema, await readJson(req));
  const payload = await buildPostPayload(data, user, { existing: post });
  const oldSlug = post.slug;
  post.set(payload);
  await post.save();
  await syncTags(payload.tags);
  if (oldSlug !== payload.slug && post.status !== "draft") await recordMove(`/${oldSlug}`, `/${payload.slug}`);
  revalidateSite();
  return json({ id: String(post._id), slug: post.slug });
}, { roles: ALL_ROLES });

export const DELETE = adminRoute(async (req, { user, params }) => {
  await connectDB();
  const post = await loadOwned(params.id, user);
  await post.deleteOne();
  revalidateSite();
  return json({ ok: true });
}, { roles: ALL_ROLES });
