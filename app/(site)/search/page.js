import PageHead from "@/components/site/PageHead";
import PostCard from "@/components/site/PostCard";
import Pagination from "@/components/site/Pagination";
import { getCommentCounts, getPosts, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const s = await getSettings();
  return { ...buildMetadata(s, { title: `Search | ${s.siteTitle}`, path: "/search", noindex: true }) };
}

export default async function SearchPage({ searchParams }) {
  const q = String(searchParams?.q || "").trim().slice(0, 100);
  const [settings, data] = await Promise.all([
    getSettings(),
    q ? getPosts({ q, page: searchParams?.page, limit: 12 }) : Promise.resolve({ items: [], total: 0, page: 1, pages: 1 }),
  ]);
  const counts = await getCommentCounts(data.items.map((p) => p._id));

  return (
    <>
      <PageHead eyebrow={q ? `${data.total} result${data.total === 1 ? "" : "s"}` : "Search"} title={q ? `Results for “${q}”` : "Find a game"} />
      <div className="container py-5">
        <form action="/search" method="get" className="bf-search-lg mb-5" role="search">
          <input type="search" name="q" defaultValue={q} placeholder="Try “bingo”, “relay”, “dice”…" maxLength={100} aria-label="Search games" />
          <button type="submit">Search</button>
        </form>
        {q && data.items.length === 0 && <div className="bf-empty mb-4"><p className="mb-0 fs-5">No games matched “{q}”. Try a shorter word like “party” or “kids”.</p></div>}
        <div className="row g-4">
          {data.items.map((p) => (
            <div className="col-md-6 col-lg-4" key={p._id}>
              <PostCard post={p} commentCount={counts[p._id] || 0} commentsEnabled={settings.commentsEnabled !== false} />
            </div>
          ))}
        </div>
        <Pagination page={data.page} pages={data.pages} basePath="/search" params={{ q }} />
      </div>
    </>
  );
}
