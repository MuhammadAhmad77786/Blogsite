import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";

export const metadata = { title: "Not found", robots: { index: false, follow: false } };

// Catches multi-segment URLs (e.g. /old/path) so admin-defined redirects work for them too.
export default async function CatchAll({ params }) {
  const path = "/" + (params.rest || []).join("/");
  const r = await findRedirect(path);
  if (r) (r.permanent ? permanentRedirect : redirect)(r.to);
  notFound();
}
