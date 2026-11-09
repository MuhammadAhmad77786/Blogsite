import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import CldImage from "@/components/site/CldImage";
import PostCard, { formatDate } from "@/components/site/PostCard";
import CommentForm from "@/components/site/CommentForm";
import { getApprovedComments, getPostBySlug, getRelatedPosts, getSettings, incrementViews } from "@/lib/data";
import AdSlot from "@/components/site/AdSlot";
import { resolveNetwork, splitAfterParagraph } from "@/lib/ads";
import { findRedirect } from "@/lib/redirects";
import { siteUrl } from "@/lib/env";
import { cld } from "@/lib/img";
import { sanitizeRich, stripTags } from "@/lib/sanitize";
import { buildMetadata, jsonLd } from "@/lib/seo";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const [s, post] = await Promise.all([getSettings(), getPostBySlug(params.slug)]);
  if (!post) return { title: "Not found", robots: { index: false } };
  return buildMetadata(s, {
    title: post.seo?.title || `${post.title} | ${s.siteTitle}`,
    description: post.seo?.metaDescription || post.excerpt || stripTags(String(post.content || "").replace(/<\/(p|h[2-4]|li|blockquote)>/gi, " ")).replace(/\s+/g, " ").slice(0, 155),
    image: post.seo?.ogImage || post.featuredImage?.url,
    canonical: post.seo?.canonicalUrl || undefined,
    path: `/${post.slug}`,
    noindex: !!post.seo?.noindex,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    const r = await findRedirect(`/${params.slug}`);
    if (r) (r.permanent ? permanentRedirect : redirect)(r.to);
    notFound();
  }
  const [settings, related, comments] = await Promise.all([
    getSettings(),
    getRelatedPosts(post),
    getApprovedComments(post._id),
  ]);
  incrementViews(post._id);

  const base = siteUrl();
  const url = `${base}/${post.slug}`;
  const img = post.featuredImage?.url;
  const cm = settings.commentsEnabled !== false;
  const author = post.author || {};
  const enc = encodeURIComponent;

  const network = resolveNetwork(settings, post, post.categories);
  const bodyHtml = sanitizeRich(post.content);
  const split = splitAfterParagraph(bodyHtml);
  const cat0 = post.categories?.[0];
  const pinHref = `https://www.pinterest.com/pin/create/button/?url=${enc(url)}&description=${enc(post.title)}${img ? `&media=${enc(cld(img, 1200))}` : ""}`;
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Games", item: `${base}/blog` },
      ...(cat0 ? [{ "@type": "ListItem", position: 3, name: cat0.name, item: `${base}/category/${cat0.slug}` }] : []),
      { "@type": "ListItem", position: cat0 ? 4 : 3, name: post.title, item: url },
    ],
  };

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: img ? [cld(img, 1200)] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: author.name || settings.siteTitle },
    publisher: { "@type": "Organization", name: settings.siteTitle, logo: { "@type": "ImageObject", url: settings.logo?.url ? cld(settings.logo.url, 512) : `${base}/logo-mark.svg` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <article className="container py-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(crumbs) }} />
      <div className="bf-post-wrap">
        <nav aria-label="Breadcrumb" className="bf-crumbs">
          <Link href="/">Home</Link><span className="sep">/</span><Link href="/blog">Games</Link>
          {cat0 && <><span className="sep">/</span><Link href={`/category/${cat0.slug}`}>{cat0.name}</Link></>}
        </nav>
        <header className="bf-post-head">
          {post.categories?.length > 0 && (
            <div className="bf-cats">
              {post.categories.map((c) => (
                <Link key={c._id} href={`/category/${c.slug}`} className="bf-cat-link">{c.name}</Link>
              ))}
            </div>
          )}
          <h1 className="bf-post-title">{post.title}</h1>
          <div className="bf-post-meta">
            {author.avatar?.url ? (
              <img className="av" src={cld(author.avatar.url, 72)} alt="" width={36} height={36} />
            ) : (
              <span className="av" aria-hidden="true"><i className="bi bi-person" /></span>
            )}
            <span>By <strong>{author.name || "Editorial Team"}</strong></span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {post.updatedAt && new Date(post.updatedAt) - new Date(post.publishedAt) > 864e5 && (
              <>
                <span aria-hidden="true">·</span>
                <span>Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time></span>
              </>
            )}
          </div>
        </header>
        {img && (
          <div className="bf-post-hero">
            <CldImage src={img} alt={post.featuredImage.alt || post.title} sizes="(min-width: 860px) 796px, 100vw" priority />
            <a className="bf-pin-save" href={pinHref} target="_blank" rel="noopener noreferrer" aria-label="Save this to Pinterest">
              <i className="bi bi-pinterest" aria-hidden="true" />Save
            </a>
          </div>
        )}

        <AdSlot settings={settings} network={network} placement="top" />

        {split ? (
          <>
            <div className="bf-content" dangerouslySetInnerHTML={{ __html: split[0] }} />
            <AdSlot settings={settings} network={network} placement="inContent" />
            <div className="bf-content" dangerouslySetInnerHTML={{ __html: split[1] }} />
          </>
        ) : (
          <div className="bf-content" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        )}

        <AdSlot settings={settings} network={network} placement="bottom" />

        {post.tags?.length > 0 && (
          <div className="mt-4 d-flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link key={t} href={`/search?q=${enc(t)}`} className="bf-tag">#{t}</Link>
            ))}
          </div>
        )}

        <div className="bf-share my-4">
          <strong>Share this game:</strong>
          <a className="pin" href={pinHref} target="_blank" rel="noopener noreferrer" aria-label="Share on Pinterest"><i className="bi bi-pinterest" /></a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><i className="bi bi-facebook" /></a>
          <a href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(post.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X"><i className="bi bi-twitter-x" /></a>
          <a href={`https://wa.me/?text=${enc(`${post.title} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><i className="bi bi-whatsapp" /></a>
        </div>

        <div className="bf-author my-4">
          {author.avatar?.url ? (
            <img className="bf-avatar" src={cld(author.avatar.url, 128)} alt={author.name} width={64} height={64} />
          ) : (
            <div className="bf-avatar"><i className="bi bi-person" /></div>
          )}
          <div>
            <div className="small text-muted text-uppercase fw-semibold">Written by</div>
            <h2 className="h5 mb-1">{author.name || "Editorial Team"}</h2>
            {author.bio && <p className="mb-0 text-muted">{author.bio}</p>}
          </div>
        </div>

        {cm && (
          <section id="comments" className="my-5">
            <h2 className="h3 mb-3">Comments ({comments.length})</h2>
            <div className="d-grid gap-3 mb-4">
              {comments.map((c) => (
                <div className="bf-comment" key={c._id}>
                  <strong>{c.name}</strong> <span className="small text-muted">· {formatDate(c.createdAt)}</span>
                  <p className="mb-0 mt-1" style={{ whiteSpace: "pre-wrap" }}>{c.body}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-muted mb-0">Be the first to comment.</p>}
            </div>
            <h3 className="h5">Leave a comment</h3>
            <CommentForm postId={post._id} />
          </section>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-5">
          <div className="bf-sec-head"><div><span className="bf-eyebrow">Keep playing</span><h2>You might also <span className="bf-swipe">like</span></h2></div></div>
          <div className="row g-4">
            {related.map((p) => (
              <div className="col-md-6 col-lg-4" key={p._id}>
                <PostCard post={p} commentsEnabled={false} />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
