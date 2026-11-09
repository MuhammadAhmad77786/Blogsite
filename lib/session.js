import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { connectDB } from "./db";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./jwt";
import User from "@/models/User";

const cookieBase = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
});

export async function createSession(user) {
  const token = await signSession({
    sub: String(user._id),
    role: user.role,
    csrf: crypto.randomBytes(24).toString("hex"),
  });
  cookies().set(SESSION_COOKIE, token, { ...cookieBase(), maxAge: SESSION_TTL_SECONDS });
}

export function destroySession() {
  cookies().set(SESSION_COOKIE, "", { ...cookieBase(), maxAge: 0 });
}

/** Full server-side check: valid signature, and the user still exists and is active. */
export async function getCurrentUser() {
  const payload = await verifySession(cookies().get(SESSION_COOKIE)?.value);
  if (!payload?.sub) return null;
  await connectDB();
  const user = await User.findById(payload.sub).lean();
  if (!user || !user.active) return null;
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar?.url || "",
    csrf: payload.csrf,
  };
}

/** For admin pages and layouts. Redirects when unauthenticated or lacking the role. */
export async function requireAdminPage(roles) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (roles && !roles.includes(user.role)) redirect("/admin");
  return user;
}
