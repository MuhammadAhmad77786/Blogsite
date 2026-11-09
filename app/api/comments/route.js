import { connectDB } from "@/lib/db";
import { HttpError, clientIp, errorResponse, json, parse, readJson } from "@/lib/http";
import { commentPublicSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/ratelimit";
import { stripTags } from "@/lib/sanitize";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import SiteSettings from "@/models/SiteSettings";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    let originHost = "";
    try {
      originHost = origin ? new URL(origin).host : "";
    } catch {
      originHost = "";
    }
    if (!origin || originHost !== host) throw new HttpError(403, "Forbidden");

    const ip = clientIp(req);
    const rl = await rateLimit(`comment:${ip}`, 5, 10 * 60);
    if (!rl.allowed) throw new HttpError(429, "Too many comments. Please try again later.");

    const data = parse(commentPublicSchema, await readJson(req));
    if (data.website) return json({ ok: true }); // honeypot: pretend success

    await connectDB();
    const settings = await SiteSettings.findOne({ singleton: "main" }).select("commentsEnabled").lean();
    if (settings && settings.commentsEnabled === false) throw new HttpError(403, "Comments are closed.");

    const now = new Date();
    const post = await Post.exists({
      _id: data.postId,
      status: { $in: ["published", "scheduled"] },
      publishedAt: { $lte: now },
    });
    if (!post) throw new HttpError(404, "Not found.");

    await Comment.create({
      post: data.postId,
      name: stripTags(data.name),
      email: data.email,
      body: stripTags(data.body),
      status: "pending",
    });
    return json({ ok: true }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
