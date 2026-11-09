import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, ALL_ROLES, STAFF } from "@/lib/guard";
import { HttpError, json, parse, plain, readJson } from "@/lib/http";
import { categorySchema } from "@/lib/schemas";
import { makeSlug } from "@/lib/slug";
import { categoryPayload } from "@/lib/categories-admin";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => {
  await connectDB();
  const items = await Category.find().sort({ order: 1, name: 1 }).lean();
  return json({ items: plain(items) });
}, { roles: ALL_ROLES });

export const POST = adminRoute(async (req) => {
  await connectDB();
  const data = parse(categorySchema, await readJson(req));
  const slug = makeSlug(data.slug || data.name);
  if (!slug) throw new HttpError(400, "Invalid slug.");
  if (await Category.exists({ slug })) throw new HttpError(409, "That slug is already used.");
  const cat = await Category.create({ ...categoryPayload(data), slug });
  revalidateSite();
  return json({ id: String(cat._id) }, 201);
}, { roles: STAFF });
