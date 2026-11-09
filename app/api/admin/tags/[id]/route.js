import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, STAFF } from "@/lib/guard";
import { HttpError, assertId, json, parse, readJson } from "@/lib/http";
import { tagSchema } from "@/lib/schemas";
import { makeSlug } from "@/lib/slug";
import { stripTags } from "@/lib/sanitize";
import Tag from "@/models/Tag";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

export const PUT = adminRoute(async (req, { params }) => {
  await connectDB();
  assertId(params.id);
  const tag = await Tag.findById(params.id);
  if (!tag) throw new HttpError(404, "Not found.");
  const data = parse(tagSchema, await readJson(req));
  const slug = makeSlug(data.slug || data.name);
  if (!slug) throw new HttpError(400, "Invalid slug.");
  if (await Tag.exists({ slug, _id: { $ne: tag._id } })) throw new HttpError(409, "That tag already exists.");
  const oldName = tag.name;
  const name = stripTags(data.name);
  tag.set({ name, slug });
  await tag.save();
  if (oldName !== name) {
    await Post.updateMany({ tags: oldName }, { $set: { "tags.$[t]": name } }, { arrayFilters: [{ t: oldName }] });
    revalidateSite();
  }
  return json({ ok: true });
}, { roles: STAFF });

export const DELETE = adminRoute(async (req, { params }) => {
  await connectDB();
  assertId(params.id);
  const tag = await Tag.findById(params.id);
  if (tag) {
    await Post.updateMany({ tags: tag.name }, { $pull: { tags: tag.name } });
    await tag.deleteOne();
    revalidateSite();
  }
  return json({ ok: true });
}, { roles: STAFF });
