import { connectDB } from "./db";
import RateLimit from "@/models/RateLimit";

/**
 * Fixed-window counter stored in MongoDB (works across serverless instances).
 * Returns { allowed, count, remaining }.
 */
export async function rateLimit(key, limit, windowSeconds) {
  await connectDB();
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const doc = await RateLimit.findOneAndUpdate(
    { key: `${key}:${bucket}` },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date((bucket + 1) * windowSeconds * 1000 + 60000) },
    },
    { upsert: true, returnDocument: "after" }
  );
  return { allowed: doc.count <= limit, count: doc.count, remaining: Math.max(0, limit - doc.count) };
}
