import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, STAFF } from "@/lib/guard";
import { assertId, json } from "@/lib/http";
import Redirect from "@/models/Redirect";

export const dynamic = "force-dynamic";

export const DELETE = adminRoute(async (req, { params }) => {
  await connectDB();
  assertId(params.id);
  await Redirect.deleteOne({ _id: params.id });
  revalidateSite();
  return json({ ok: true });
}, { roles: STAFF });
