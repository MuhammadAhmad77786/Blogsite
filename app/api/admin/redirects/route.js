import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, STAFF } from "@/lib/guard";
import { HttpError, json, parse, plain, readJson } from "@/lib/http";
import { redirectSchema } from "@/lib/schemas";
import { normalizePath, wouldLoop } from "@/lib/redirects";
import Redirect from "@/models/Redirect";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => {
  await connectDB();
  const items = await Redirect.find().sort({ createdAt: -1 }).limit(1000).lean();
  return json({ items: plain(items) });
}, { roles: STAFF });

export const POST = adminRoute(async (req) => {
  await connectDB();
  const data = parse(redirectSchema, await readJson(req));
  const from = normalizePath(data.from);
  if (from === normalizePath(data.to)) throw new HttpError(400, "Old and new URL are the same.");
  if (data.to.startsWith("/") && (await wouldLoop(from, data.to))) throw new HttpError(400, "That would create a redirect loop.");
  await Redirect.updateOne({ from }, { $set: { to: data.to, permanent: data.permanent, auto: false } }, { upsert: true });
  revalidateSite();
  return json({ ok: true }, 201);
}, { roles: STAFF });
