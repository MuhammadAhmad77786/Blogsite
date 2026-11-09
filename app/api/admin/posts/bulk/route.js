import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, ALL_ROLES } from "@/lib/guard";
import { json, parse, readJson } from "@/lib/http";
import { bulkSchema } from "@/lib/schemas";
import Post from "@/models/Post";

export const dynamic = "force-dynamic";

export const POST = adminRoute(async (req, { user }) => {
  await connectDB();
  const { ids, action } = parse(bulkSchema, await readJson(req));
  const filter = { _id: { $in: ids } };
  if (user.role === "author") filter.author = user.id;

  revalidateSite();
  if (action === "delete") {
    const r = await Post.deleteMany(filter);
    return json({ affected: r.deletedCount });
  }
  if (action === "draft") {
    const r = await Post.updateMany(filter, { $set: { status: "draft" } });
    return json({ affected: r.modifiedCount });
  }
  const now = new Date();
  const r = await Post.updateMany(filter, [
    { $set: { status: "published", publishedAt: { $ifNull: ["$publishedAt", now] } } },
  ]);
  return json({ affected: r.modifiedCount });
}, { roles: ALL_ROLES });
