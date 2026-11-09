import { connectDB } from "@/lib/db";
import { adminRoute, STAFF } from "@/lib/guard";
import { json, plain } from "@/lib/http";
import Comment from "@/models/Comment";
import "@/models/Post";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async (req) => {
  await connectDB();
  const status = new URL(req.url).searchParams.get("status");
  const filter = status === "approved" || status === "pending" ? { status } : {};
  const items = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("post", "title slug")
    .lean();
  return json({ items: plain(items) });
}, { roles: STAFF });
