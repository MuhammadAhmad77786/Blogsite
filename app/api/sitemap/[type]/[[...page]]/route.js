import { sitemapUrlset } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// Reached through rewrites: /post-sitemap.xml, /post-sitemap2.xml, /category-sitemap.xml, /page-sitemap.xml
export async function GET(_req, { params }) {
  const page = Math.max(1, parseInt((params.page && params.page[0]) || "1", 10) || 1);
  try {
    const xml = await sitemapUrlset(params.type, page);
    if (!xml) return new Response("Not found", { status: 404 });
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
        "X-Robots-Tag": "noindex, follow",
      },
    });
  } catch {
    return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Retry-After": "300" } });
  }
}
