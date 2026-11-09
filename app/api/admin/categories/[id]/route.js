import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, STAFF } from "@/lib/guard";
import { HttpError, assertId, json, parse, readJson } from "@/lib/http";
import { categorySchema } from "@/lib/schemas";
import { makeSlug } from "@/lib/slug";
import Category from "@/models/Category";
import { recordMove } from "@/lib/redirects";
import Post from "@/models/Post";
import { categoryPayload } from "@/lib/categories-admin";

export const dynamic = "force-dynamic";

export const PUT = adminRoute(async (req, { params }) => {
  await connectDB();
  assertId(params.id);
  const cat = await Category.findById(params.id);
  if (!cat) throw new HttpError(404, "Not found.");
  const data = parse(categorySchema, await readJson(req));
  const slug = makeSlug(data.slug || data.name);
  if (!slug) throw new HttpError(400, "Invalid slug.");
  if (await Category.exists({ slug, _id: { $ne: cat._id } })) throw new HttpError(409, "That slug is already used.");
  if (data.parentCategory && String(data.parentCategory) === String(cat._id)) {
    throw new HttpError(400, "A category cannot be its own parent.");
  }
  const oldSlug = cat.slug;
  cat.set({ ...categoryPayload(data), slug });
  await cat.save();
  if (oldSlug !== slug) await recordMove(`/category/${oldSlug}`, `/category/${slug}`);
  revalidateSite();
  return json({ ok: true });
}, { roles: STAFF });

export const DELETE = adminRoute(async (req, { params }) => {
  await connectDB();
  assertId(params.id);
  await Post.updateMany({ categories: params.id }, { $pull: { categories: params.id } });
  await Category.updateMany({ parentCategory: params.id }, { $set: { parentCategory: null } });
  await Category.deleteOne({ _id: params.id });
  revalidateSite();
  return json({ ok: true });
}, { roles: STAFF });
