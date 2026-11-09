import { requireAdminPage } from "@/lib/session";
import { siteUrl } from "@/lib/env";
import { AdminProvider } from "@/components/admin/AdminContext";
import Sidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }) {
  const user = await requireAdminPage();
  return (
    <AdminProvider csrf={user.csrf} user={{ id: user.id, name: user.name, role: user.role }} siteUrl={siteUrl()}>
      <div className="adm-body d-flex adm-wrap">
        <Sidebar />
        <div className="adm-main">{children}</div>
      </div>
    </AdminProvider>
  );
}
