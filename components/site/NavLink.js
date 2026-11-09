"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, exact = false, className = "nav-link", children }) {
  const pathname = usePathname() || "/";
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  const closeMenu = () => {
    const el = document.getElementById("bfNav");
    if (el && el.classList.contains("show")) el.classList.remove("show");
  };
  return (
    <Link href={href} className={`${className}${active ? " active" : ""}`} aria-current={active ? "page" : undefined} onClick={closeMenu}>
      {children}
    </Link>
  );
}
