import { connectDB } from "@/lib/db";
import { adminRoute, ALL_ROLES, STAFF } from "@/lib/guard";
import { HttpError, json, parse, plain, readJson } from "@/lib/http";
import { tagSchema } from "@/lib/schemas";
import { makeSlug } from "@/lib/slug";
import { stripTags } from "@/lib/sanitize";
import Tag from "@/models/Tag";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => {
  await connectDB();
  const items = await Tag.find().sort({ name: 1 }).limit(1000).lean();
  return json({ items: plain(items) });
}, { roles: ALL_ROLES });

export const POST = adminRoute(async (req) => {
  await connectDB();
  const data = parse(tagSchema, await readJson(req));
  const slug = makeSlug(data.slug || data.name);
  if (!slug) throw new HttpError(400, "Invalid slug.");
  if (await Tag.exists({ slug })) throw new HttpError(409, "That tag already exists.");
  const tag = await Tag.create({ name: stripTags(data.name), slug });
  return json({ id: String(tag._id) }, 201);
}, { roles: STAFF });
