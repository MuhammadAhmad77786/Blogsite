import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { adminRoute, ADMIN, STAFF } from "@/lib/guard";
import { HttpError, json, parse, plain, readJson } from "@/lib/http";
import { userCreateSchema } from "@/lib/schemas";
import { stripTags } from "@/lib/sanitize";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Staff can list users (to pick an author); only admins manage them.
export const GET = adminRoute(async (req, { user }) => {
  await connectDB();
  const select = user.role === "admin" ? "-passwordHash" : "name role";
  const items = await User.find({ ...(user.role === "admin" ? {} : { active: true }) })
    .select(select)
    .sort({ createdAt: 1 })
    .lean();
  return json({ items: plain(items) });
}, { roles: STAFF });

export const POST = adminRoute(async (req) => {
  await connectDB();
  const data = parse(userCreateSchema, await readJson(req));
  if (await User.exists({ email: data.email })) throw new HttpError(409, "A user with that email already exists.");
  const passwordHash = await bcrypt.hash(data.password, 12);
  const u = await User.create({ name: stripTags(data.name), email: data.email, role: data.role, passwordHash });
  return json({ id: String(u._id) }, 201);
}, { roles: ADMIN });
