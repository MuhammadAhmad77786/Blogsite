import { connectDB } from "./db";
import Redirect from "@/models/Redirect";

export function normalizePath(p) {
  let s = String(p || "").trim();
  s = s.split("#")[0].split("?")[0];
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/\/{2,}/g, "/");
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return s.toLowerCase().slice(0, 300);
}

/** Returns { to, permanent } for a request path, or null. Never throws. */
export async function findRedirect(path) {
  try {
    await connectDB();
    const r = await Redirect.findOne({ from: normalizePath(path) }).lean();
    return r ? { to: r.to, permanent: r.permanent } : null;
  } catch {
    return null;
  }
}

/** Called when a post/category slug changes so old links keep working. */
export async function recordMove(oldPath, newPath) {
  const from = normalizePath(oldPath);
  const to = normalizePath(newPath);
  if (from === to) return;
  await Redirect.deleteOne({ from: to }); // never redirect away from a live URL
  await Redirect.updateMany({ to: from }, { $set: { to } }); // collapse chains
  await Redirect.updateOne({ from }, { $set: { to, permanent: true, auto: true } }, { upsert: true });
}

/** Follows existing redirects from `to`; true if it would lead back to `from`. */
export async function wouldLoop(from, to) {
  let cur = normalizePath(to);
  for (let i = 0; i < 6; i += 1) {
    if (cur === normalizePath(from)) return true;
    const next = await Redirect.findOne({ from: cur }).lean();
    if (!next || /^https?:/i.test(next.to)) return false;
    cur = normalizePath(next.to);
  }
  return true;
}
