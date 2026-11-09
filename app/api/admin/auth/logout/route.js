import { adminRoute } from "@/lib/guard";
import { destroySession } from "@/lib/session";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export const POST = adminRoute(async () => {
  destroySession();
  return json({ ok: true });
});
