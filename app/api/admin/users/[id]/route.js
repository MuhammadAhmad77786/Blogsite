import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, ADMIN } from "@/lib/guard";
import { HttpError, assertId, json, parse, readJson } from "@/lib/http";
import { userUpdateSchema } from "@/lib/schemas";
import { stripTags } from "@/lib/sanitize";
import User from "@/models/User";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

async function otherActiveAdmins(excludeId) {
  return User.countDocuments({ role: "admin", active: true, _id: { $ne: excludeId } });
}

export const PATCH = adminRoute(async (req, { user, params }) => {
  await connectDB();
  assertId(params.id);
  const target = await User.findById(params.id);
  if (!target) throw new HttpError(404, "Not found.");
  const data = parse(userUpdateSchema, await readJson(req));

  const demoting = target.role === "admin" && ((data.role && data.role !== "admin") || data.active === false);
  if (demoting && (await otherActiveAdmins(target._id)) === 0) {
    throw new HttpError(400, "There must be at least one active admin.");
  }
  if (String(target._id) === user.id && (data.active === false || (data.role && data.role !== "admin"))) {
    throw new HttpError(400, "You cannot deactivate or demote your own account.");
  }

  if (data.name !== undefined) target.name = stripTags(data.name);
  if (data.role !== undefined) target.role = data.role;
  if (data.active !== undefined) target.active = data.active;
  if (data.bio !== undefined) target.bio = stripTags(data.bio);
  if (data.avatar !== undefined) target.avatar = { url: data.avatar.url, publicId: stripTags(data.avatar.publicId) };
  if (data.password) {
    target.passwordHash = await bcrypt.hash(data.password, 12);
    target.failedLoginAttempts = 0;
    target.lockedUntil = null;
  }
  await target.save();
  revalidateSite();
  return json({ ok: true });
}, { roles: ADMIN });

export const DELETE = adminRoute(async (req, { user, params }) => {
  await connectDB();
  assertId(params.id);
  if (params.id === user.id) throw new HttpError(400, "You cannot delete your own account.");
  const target = await User.findById(params.id);
  if (!target) return json({ ok: true });
  if (await Post.exists({ author: target._id })) {
    throw new HttpError(409, "This user has posts. Deactivate the account instead, or reassign their posts first.");
  }
  await target.deleteOne();
  return json({ ok: true });
}, { roles: ADMIN });
