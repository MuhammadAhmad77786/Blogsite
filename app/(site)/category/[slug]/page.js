import { notFound, permanentRedirect, redirect } from "next/navigation";
import AdSlot from "@/components/site/AdSlot";
import { resolveNetwork } from "@/lib/ads";
import { findRedirect } from "@/lib/redirects";
import { siteUrl } from "@/lib/env";
import { jsonLd } from "@/lib/seo";
import PageHead from "@/components/site/PageHead";
import PostCard from "@/components/site/PostCard";
import Pagination from "@/components/site/Pagination";
import { getCategoryBySlug, getCommentCounts, getPosts, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params, searchParams }) {
  const [s, cat] = await Promise.all([getSettings(), getCategoryBySlug(params.slug)]);
  if (!cat) return { title: "Not found", robots: { index: false } };
  const page = parseInt(searchParams?.page || "1", 10) || 1;
  return buildMetadata(s, {
    title: cat.seo?.title || `${cat.name} – Fun Games${page > 1 ? ` – Page ${page}` : ""} | ${s.siteTitle}`,
    description: cat.seo?.metaDescription || cat.description || `Fun ${cat.name.toLowerCase()} with simple rules and easy setup from ${s.siteTitle}.`,
    image: cat.image?.url,
    path: `/category/${cat.slug}${page > 1 ? `?page=${page}` : ""}`,
  });
}

export default async function CategoryPage({ params, searchParams }) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) {
    const r = await findRedirect(`/category/${params.slug}`);
    if (r) (r.permanent ? permanentRedirect : redirect)(r.to);
    notFound();
  }
  const [settings, data] = await Promise.all([
    getSettings(),
    getPosts({ page: searchParams?.page, category: cat._id, limit: 10 }),
  ]);
  const counts = await getCommentCounts(data.items.map((p) => p._id));
  const [first, ...rest] = data.page === 1 ? data.items : [null, ...data.items];
  const cm = settings.commentsEnabled !== false;
  const network = resolveNetwork(settings, null, [cat]);
  const base = siteUrl();
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Games", item: `${base}/blog` },
      { "@type": "ListItem", position: 3, name: cat.name, item: `${base}/category/${cat.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }} />
      <PageHead eyebrow={`${data.total} game${data.total === 1 ? "" : "s"}`} title={data.page > 1 ? `${cat.name} – Page ${data.page}` : cat.name} subtitle={cat.description} crumbs={[{ href: "/", label: "Home" }, { href: "/blog", label: "Games" }, { label: cat.name }]} />
      <div className="container py-5">
        {data.items.length === 0 ? (
          <div className="bf-empty"><p className="mb-0 fs-5">No games in this category yet. Check back soon!</p></div>
        ) : (
          <>
            {first && (
              <div className="mb-4">
                <PostCard post={first} featured commentCount={counts[first._id] || 0} commentsEnabled={cm} />
              </div>
            )}
            <AdSlot settings={settings} network={network} placement="listing" />
            <div className="row g-4">
              {rest.map((p) => (
                <div className="col-md-6 col-lg-4" key={p._id}>
                  <PostCard post={p} commentCount={counts[p._id] || 0} commentsEnabled={cm} />
                </div>
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} basePath={`/category/${cat.slug}`} />
          </>
        )}
      </div>
    </>
  );
}
