import AdSlot from "@/components/site/AdSlot";
import PageHead from "@/components/site/PageHead";
import PostCard from "@/components/site/PostCard";
import Pagination from "@/components/site/Pagination";
import { getCommentCounts, getPosts, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ searchParams }) {
  const s = await getSettings();
  const page = parseInt(searchParams?.page || "1", 10) || 1;
  return buildMetadata(s, {
    title: `All Games${page > 1 ? ` – Page ${page}` : ""} | ${s.siteTitle}`,
    description: `Browse every game, printable and party idea from ${s.siteTitle}. New games added every week.`,
    path: page > 1 ? `/blog?page=${page}` : "/blog",
  });
}

export default async function BlogPage({ searchParams }) {
  const [settings, data] = await Promise.all([getSettings(), getPosts({ page: searchParams?.page, limit: 10 })]);
  const counts = await getCommentCounts(data.items.map((p) => p._id));
  const [first, ...rest] = data.page === 1 ? data.items : [null, ...data.items];
  const cm = settings.commentsEnabled !== false;

  return (
    <>
      <PageHead eyebrow="Every game" title={data.page > 1 ? `All Games – Page ${data.page}` : "All Games"} subtitle="Every game and printable on the site, newest first." crumbs={[{ href: "/", label: "Home" }, { label: "All Games" }]} />
      <div className="container py-5">
        {data.items.length === 0 ? (
          <div className="bf-empty"><p className="mb-0 fs-5">The first games are on their way. Check back soon!</p></div>
        ) : (
          <>
            {first && (
              <div className="mb-4">
                <PostCard post={first} featured commentCount={counts[first._id] || 0} commentsEnabled={cm} />
              </div>
            )}
            <AdSlot settings={settings} network={settings.ads?.network || "none"} placement="listing" />
            <div className="row g-4">
              {rest.map((p) => (
                <div className="col-md-6 col-lg-4" key={p._id}>
                  <PostCard post={p} commentCount={counts[p._id] || 0} commentsEnabled={cm} />
                </div>
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} basePath="/blog" />
          </>
        )}
      </div>
    </>
  );
}
