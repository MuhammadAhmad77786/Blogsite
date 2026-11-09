import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { HttpError, clientIp, errorResponse, json, parse, readJson } from "@/lib/http";
import { loginSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/ratelimit";
import { verifyCaptcha } from "@/lib/captcha";
import { createSession } from "@/lib/session";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
// Used so unknown emails cost the same time as known ones.
let dummyHash;
function getDummyHash() {
  if (!dummyHash) dummyHash = bcrypt.hashSync("not-a-real-password", 12);
  return dummyHash;
}

export async function POST(req) {
  try {
    const ip = clientIp(req);

    // 1. Per-IP throttle on every attempt (before any other work).
    const ipLimit = await rateLimit(`login-ip:${ip}`, 15, 15 * 60);
    if (!ipLimit.allowed) throw new HttpError(429, "Too many attempts. Try again later.");

    const body = parse(loginSchema, await readJson(req));

    // 2. CAPTCHA must pass before credentials are even looked at.
    const human = await verifyCaptcha(body.captchaToken, ip);
    if (!human) throw new HttpError(400, "CAPTCHA verification failed. Please try again.");

    // 3. Credentials.
    await connectDB();
    const email = String(body.email);
    const user = await User.findOne({ email }).select("+passwordHash");
    const locked = user?.lockedUntil && user.lockedUntil > new Date();
    const hash = user?.passwordHash || getDummyHash();
    const ok = await bcrypt.compare(String(body.password), hash).catch(() => false);

    if (!user || !user.active || locked || !ok) {
      if (user && !locked) {
        const fails = (user.failedLoginAttempts || 0) + 1;
        const set = { failedLoginAttempts: fails };
        if (fails >= MAX_FAILS) {
          set.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000 * Math.min(4, Math.floor(fails / MAX_FAILS)));
        }
        await User.updateOne({ _id: user._id }, { $set: set });
      }
      throw new HttpError(401, "Invalid email or password.");
    }

    await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0, lockedUntil: null } });
    await createSession(user);
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
