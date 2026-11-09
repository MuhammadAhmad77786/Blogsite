import { adminRoute } from "@/lib/guard";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async (req, { user }) => {
  return json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
