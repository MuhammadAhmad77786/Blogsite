"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminContext";
import { Wordmark } from "@/components/site/Brand";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "bi-speedometer2", exact: true, roles: ["admin", "editor", "author"] },
  { href: "/admin/posts", label: "Posts", icon: "bi-file-earmark-text", roles: ["admin", "editor", "author"] },
  { href: "/admin/categories", label: "Categories", icon: "bi-folder2", roles: ["admin", "editor"] },
  { href: "/admin/tags", label: "Tags", icon: "bi-tags", roles: ["admin", "editor"] },
  { href: "/admin/media", label: "Media", icon: "bi-images", roles: ["admin", "editor", "author"] },
  { href: "/admin/comments", label: "Comments", icon: "bi-chat-dots", roles: ["admin", "editor"] },
  { href: "/admin/redirects", label: "Redirects", icon: "bi-signpost-split", roles: ["admin", "editor"] },
  { href: "/admin/users", label: "Users", icon: "bi-people", roles: ["admin"] },
  { href: "/admin/settings", label: "Settings", icon: "bi-gear", roles: ["admin"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { api, user } = useAdmin();

  async function logout() {
    try {
      await api("/api/admin/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin/login";
    }
  }

  return (
    <aside className="adm-side p-3 d-flex flex-column gap-1">
      <div className="px-2 pb-3"><Wordmark /></div>
      {ITEMS.filter((i) => i.roles.includes(user.role)).map((i) => {
        const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={active ? "active" : ""}>
            <i className={`bi ${i.icon}`} /> {i.label}
          </Link>
        );
      })}
      <div className="mt-auto pt-3 border-top border-secondary">
        <div className="small px-2 mb-2 text-truncate">{user.name} · {user.role}</div>
        <a href="/" target="_blank" rel="noopener noreferrer"><i className="bi bi-box-arrow-up-right" /> View site</a>
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}><i className="bi bi-box-arrow-left" /> Sign out</a>
      </div>
    </aside>
  );
}
