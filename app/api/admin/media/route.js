import { connectDB } from "@/lib/db";
import { adminRoute, ALL_ROLES } from "@/lib/guard";
import { HttpError, escapeRegex, json, plain } from "@/lib/http";
import { uploadBuffer } from "@/lib/cloudinary";
import { stripTags } from "@/lib/sanitize";
import { rateLimit } from "@/lib/ratelimit";
import Media from "@/models/Media";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function sniff(buf) {
  const h = buf.subarray(0, 16);
  if (h[0] === 0xff && h[1] === 0xd8) return "image/jpeg";
  if (h.subarray(1, 4).toString() === "PNG") return "image/png";
  if (h.subarray(0, 3).toString() === "GIF") return "image/gif";
  if (h.subarray(0, 4).toString() === "RIFF" && h.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (h.subarray(4, 8).toString() === "ftyp" && /avif|avis/.test(h.subarray(8, 16).toString())) return "image/avif";
  return null;
}

export const GET = adminRoute(async (req, { user }) => {
  await connectDB();
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = 24;
  const q = String(sp.get("q") || "").trim().slice(0, 100);
  const filter = {};
  if (q) filter.$or = [{ alt: { $regex: escapeRegex(q), $options: "i" } }, { originalName: { $regex: escapeRegex(q), $options: "i" } }];
  if (user.role === "author") filter.uploadedBy = user.id;
  const [items, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Media.countDocuments(filter),
  ]);
  return json({ items: plain(items), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}, { roles: ALL_ROLES });

export const POST = adminRoute(async (req, { user }) => {
  await connectDB();
  const rl = await rateLimit(`upload:${user.id}`, 60, 60 * 10);
  if (!rl.allowed) throw new HttpError(429, "Too many uploads. Slow down.");

  let form;
  try {
    form = await req.formData();
  } catch {
    throw new HttpError(400, "Invalid upload.");
  }
  const file = form.get("file");
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") throw new HttpError(400, "No file provided.");
  if (file.size > MAX_BYTES) throw new HttpError(413, "Image is too large (max 8 MB).");
  if (!TYPES.has(file.type)) throw new HttpError(400, "Only JPG, PNG, WebP, GIF or AVIF images are allowed.");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!sniff(buffer)) throw new HttpError(400, "File does not look like a valid image.");

  let result;
  try {
    result = await uploadBuffer(buffer);
  } catch {
    throw new HttpError(502, "Image upload failed.");
  }
  const alt = stripTags(String(form.get("alt") || "")).slice(0, 300);
  const media = await Media.create({
    url: result.secure_url,
    publicId: result.public_id,
    alt,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
    originalName: stripTags(String(file.name || "")).slice(0, 200),
    uploadedBy: user.id,
  });
  return json({ item: plain(media.toObject()) }, 201);
}, { roles: ALL_ROLES });
