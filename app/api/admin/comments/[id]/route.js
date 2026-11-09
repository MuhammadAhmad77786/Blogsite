import { z } from "zod";
import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, STAFF } from "@/lib/guard";
import { assertId, json, parse, readJson } from "@/lib/http";
import Comment from "@/models/Comment";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute(async (req, { params }) => {
  await connectDB();
  assertId(params.id);
  const { status } = parse(z.object({ status: z.enum(["pending", "approved"]) }), await readJson(req));
  await Comment.updateOne({ _id: params.id }, { $set: { status } });
  revalidateSite();
  return json({ ok: true });
}, { roles: STAFF });

export const DELETE = adminRoute(async (req, { params }) => {
  await connectDB();
  assertId(params.id);
  await Comment.deleteOne({ _id: params.id });
  revalidateSite();
  return json({ ok: true });
}, { roles: STAFF });
