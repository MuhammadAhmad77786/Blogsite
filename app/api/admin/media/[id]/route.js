import { connectDB } from "@/lib/db";
import { adminRoute, ALL_ROLES } from "@/lib/guard";
import { HttpError, assertId, json, parse, readJson } from "@/lib/http";
import { mediaPatchSchema } from "@/lib/schemas";
import { destroyImage } from "@/lib/cloudinary";
import { stripTags } from "@/lib/sanitize";
import Media from "@/models/Media";

export const dynamic = "force-dynamic";

async function loadOwned(id, user) {
  assertId(id);
  const m = await Media.findById(id);
  if (!m) throw new HttpError(404, "Not found.");
  if (user.role === "author" && String(m.uploadedBy) !== user.id) throw new HttpError(403, "Forbidden");
  return m;
}

export const PATCH = adminRoute(async (req, { user, params }) => {
  await connectDB();
  const m = await loadOwned(params.id, user);
  const { alt } = parse(mediaPatchSchema, await readJson(req));
  m.alt = stripTags(alt);
  await m.save();
  return json({ ok: true });
}, { roles: ALL_ROLES });

export const DELETE = adminRoute(async (req, { user, params }) => {
  await connectDB();
  const m = await loadOwned(params.id, user);
  try {
    await destroyImage(m.publicId);
  } catch {
    throw new HttpError(502, "Could not delete the image from storage.");
  }
  await m.deleteOne();
  return json({ ok: true });
}, { roles: ALL_ROLES });
