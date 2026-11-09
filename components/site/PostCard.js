import Link from "next/link";
import CldImage from "./CldImage";

export function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

const NEW_MS = 14 * 24 * 60 * 60 * 1000;

export default function PostCard({ post, featured = false, pick = false, commentCount = 0, commentsEnabled = true, showExcerpt = true, priority = false }) {
  const cats = (post.categories || []).slice(0, 2);
  const href = `/${post.slug}`;
  const isNew = post.publishedAt && Date.now() - new Date(post.publishedAt).getTime() < NEW_MS;
  const Title = featured ? "h2" : "h3";
  const showComments = commentsEnabled && commentCount > 0;
  return (
    <article className={`bf-card${featured ? " bf-featured" : ""}`}>
      <Link href={href} className="bf-card-cover" aria-hidden="true" tabIndex={-1} />
      <div className="bf-card-media">
        {pick ? <span className="bf-badge pick">★ Pick</span> : isNew ? <span className="bf-badge">New</span> : null}
        {post.featuredImage?.url ? (
          <CldImage
            src={post.featuredImage.url}
            alt={post.featuredImage.alt || post.title}
            sizes={featured ? "(min-width: 768px) 600px, 100vw" : "(min-width: 1200px) 380px, (min-width: 768px) 45vw, 50vw"}
            priority={priority}
          />
        ) : (
          <div className="bf-card-ph"><i className="bi bi-dice-5" aria-hidden="true" /></div>
        )}
      </div>
      <div className="bf-card-body">
        <Title className="bf-card-title">
          <Link href={href}>{post.title}</Link>
        </Title>
        {featured && (
          <div className="bf-byline">
            By {post.author?.name || "Editorial Team"} · {formatDate(post.publishedAt)}
          </div>
        )}
        {showExcerpt && post.excerpt ? <p>{post.excerpt}</p> : null}
        {(cats.length > 0 || showComments) && (
          <div className="bf-card-foot">
            <div className="bf-cats">
              {cats.map((c) => (
                <Link key={c._id || c.slug} href={`/category/${c.slug}`} className="bf-cat-link">{c.name}</Link>
              ))}
            </div>
            {showComments && (
              <Link href={`${href}#comments`} className="bf-cm">
                <i className="bi bi-chat-dots me-1" aria-hidden="true" />
                {commentCount}<span className="visually-hidden"> comment{commentCount === 1 ? "" : "s"}</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
