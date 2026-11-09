import { siteUrl } from "@/lib/env";

export default function robots() {
  const base = siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/search"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
