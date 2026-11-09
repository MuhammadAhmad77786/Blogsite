import { sitemapIndex } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

const HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  "X-Robots-Tag": "noindex, follow",
};

export async function GET() {
  try {
    return new Response(await sitemapIndex(), { headers: HEADERS });
  } catch {
    return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Retry-After": "300" } });
  }
}
