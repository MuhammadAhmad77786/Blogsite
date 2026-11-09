import { requireAdminPage } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Guard({ children }) {
  await requireAdminPage(["admin", "editor"]);
  return children;
}
