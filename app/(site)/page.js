import Link from "next/link";
import PostCard from "@/components/site/PostCard";
import Confetti from "@/components/site/Confetti";
import CldImage from "@/components/site/CldImage";
import { getCategories, getCommentCounts, getPopularPosts, getPosts, getSettings } from "@/lib/data";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/env";
import { cld } from "@/lib/img";

export const revalidate = 60;

export async function generateMetadata() {
  return buildMetadata(await getSettings(), { path: "/" });
}

const HERO = {
  eyebrow: "🎲 Real games, tested by real families",
  title: "Fun games for *every occasion.*",
  text: "Simple, no-equipment-needed games for kids, adults, parties, families and friends, with clear rules and free printables so you can start playing in minutes.",
  linkLabel: "Browse all games",
  linkHref: "/blog",
};

// Shown on the tiles when a category has no description in the admin.
const TILE_FALLBACK = "Easy games with simple rules and quick setup.";

/** Renders "*emphasised*" segments of a headline as <em>. */
function Headline({ text }) {
  const parts = String(text).split(/\*(.+?)\*/);
  return parts.map((p, i) => (i % 2 ? <em key={i}>{p}</em> : p));
}

function CtaLink({ href, className, children }) {
  if (!href) return null;
  return href.startsWith("/") || href.startsWith("#") ? (
    <Link href={href} className={className}>{children}</Link>
  ) : (
    <a href={href} className={className} rel="noopener noreferrer">{children}</a>
  );
}

function SecHead({ eyebrow, title, sub, link }) {
  return (
    <div className="bf-sec-head">
      <div>
        {eyebrow ? <span className="bf-eyebrow">{eyebrow}</span> : null}
        <h2><span className="bf-swipe">{title}</span></h2>
        {sub ? <p className="sub">{sub}</p> : null}
      </div>
      {link}
    </div>
  );
}

export default async function HomePage() {
  const [settings, cats, latest] = await Promise.all([getSettings(), getCategories(), getPosts({ limit: 12 })]);
  const fresh = latest.items.slice(0, 4);
  const more = latest.items.slice(4, 12);
  const popular = await getPopularPosts(3, fresh.map((p) => p._id));
  const counts = await getCommentCounts([...fresh, ...more, ...popular].map((p) => p._id));
  const cm = settings.commentsEnabled !== false;

  const top = cats.filter((c) => !c.parentCategory);
  const tiles = top.slice(0, 6);
  const name = settings.siteTitle;
  const pinterest = settings.socialLinks?.pinterest;
  const base = siteUrl();

  // The first admin "Home slider" slide drives the hero; anything left empty falls back to the defaults.
  const slide = settings.heroSlides?.[0] || {};
  const hero = {
    eyebrow: slide.eyebrow || HERO.eyebrow,
    title: slide.title || HERO.title,
    text: slide.text || HERO.text,
    linkLabel: slide.linkLabel || HERO.linkLabel,
    linkHref: slide.linkHref || HERO.linkHref,
    image: slide.image?.url || settings.heroImage?.url || "",
  };

  const pins = latest.items.filter((p) => p.featuredImage?.url).slice(0, 5);

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name,
        description: settings.seoDefaults?.metaDescription || settings.tagline,
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${base}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name,
        url: base,
        logo: settings.logo?.url ? cld(settings.logo.url, 512) : `${base}/logo-mark.svg`,
        sameAs: Object.values(settings.socialLinks || {}).filter(Boolean),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />

      {/* ---------- Hero ---------- */}
      <section className="bf-hero">
        <Confetti />
        <div className="container bf-hero-grid">
          <div>
            <span className="bf-kicker">{hero.eyebrow}</span>
            <h1><Headline text={hero.title} /></h1>
            <p className="bf-lede">{hero.text}</p>
            <form className="bf-searchbar" role="search" method="get" action="/search">
              <input type="search" name="q" maxLength={100} placeholder="Search games… try “pumpkin”, “dice”, “relay”" aria-label="Search games" />
              <button type="submit">Search</button>
            </form>
            <div className="bf-hero-actions">
              <CtaLink href={hero.linkHref} className="btn btn-bf">{hero.linkLabel}</CtaLink>
              {fresh.length > 0 && (
                <>
                  <span className="or">or</span>
                  <a href="#fresh" className="btn btn-bf-outline">See what&apos;s new →</a>
                </>
              )}
            </div>
            <div className="bf-trust">
              <div className="t"><span className="n">100s</span><span className="l">of games</span></div>
              <div className="t"><span className="n">100%</span><span className="l">Free to play</span></div>
              <div className="t"><span className="n">5 min</span><span className="l">Avg. setup time</span></div>
              <div className="t"><span className="n">New</span><span className="l">Games weekly</span></div>
            </div>
          </div>

          <div className="bf-hero-art" aria-hidden={hero.image ? undefined : "true"}>
            <span className="blob" />
            {hero.image ? (
              <img className="photo" src={cld(hero.image, 900)} srcSet={`${cld(hero.image, 500)} 500w, ${cld(hero.image, 900)} 900w`} sizes="(min-width: 992px) 440px, 80vw" alt={slide.title ? slide.title.replace(/\*/g, "") : `${name} game`} fetchpriority="high" decoding="async" width={440} height={550} />
            ) : (
              <span className="cards">
                <span className="gc c1">🎲</span>
                <span className="gc c2">🎯</span>
                <span className="gc c3">🎈</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Start here ---------- */}
      {tiles.length > 0 && (
        <section className="bf-section" id="start">
          <div className="container">
            <SecHead eyebrow="Start here" title="Who’s playing?" sub="Pick your crowd and jump straight to games made for them." />
            <div className="bf-tiles">
              {tiles.map((c, i) => (
                <Link key={c._id} href={`/category/${c.slug}`} className={`bf-tile c${i % 6}`}>
                  <span className="ic"><i className={`bi ${c.icon || "bi-stars"}`} aria-hidden="true" /></span>
                  <h3>{c.name}</h3>
                  <p>{c.description ? c.description.slice(0, 110) + (c.description.length > 110 ? "…" : "") : TILE_FALLBACK}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Just added ---------- */}
      {fresh.length > 0 && (
        <section className="bf-section tint" id="fresh">
          <div className="container">
            <SecHead
              eyebrow="🍂 Just added"
              title="Fresh games"
              sub="The newest games and printables, ready to play."
              link={<Link href="/blog" className="bf-link-arrow">See all games →</Link>}
            />
            <div className="row g-4">
              {fresh.map((p, i) => (
                <div className="col-6 col-lg-3" key={p._id}>
                  <PostCard post={p} showExcerpt={false} commentCount={counts[p._id] || 0} commentsEnabled={cm} priority={i < 2 && !hero.image} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Most loved ---------- */}
      {popular.length > 0 && (
        <section className="bf-section">
          <div className="container">
            <SecHead
              eyebrow="Reader favorites"
              title="Most-loved games"
              sub="The ones families keep coming back to."
              link={<Link href="/blog" className="bf-link-arrow">Browse everything →</Link>}
            />
            <div className="row g-4">
              {popular.map((p) => (
                <div className="col-md-6 col-lg-4" key={p._id}>
                  <PostCard post={p} pick showExcerpt={false} commentCount={counts[p._id] || 0} commentsEnabled={cm} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Browse by type ---------- */}
      {cats.length > 0 && (
        <section className="bf-section alt">
          <div className="container">
            <SecHead eyebrow="Another way in" title="Browse by game type" />
            <div className="bf-pills">
              {cats.map((c) => (
                <Link key={c._id} href={`/category/${c.slug}`} className="bf-pill">
                  <i className={`bi ${c.icon || "bi-stars"}`} aria-hidden="true" />{c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- About ---------- */}
      <section className="bf-section">
        <div className="container">
          <div className="bf-about">
            <div className="pic">
              {settings.bannerImage?.url ? (
                <CldImage src={settings.bannerImage.url} alt={`About ${name}`} sizes="(min-width: 768px) 400px, 100vw" widths={[400, 800]} />
              ) : (
                <div className="ph" aria-hidden="true">🎲</div>
              )}
            </div>
            <div className="box">
              <span className="bf-eyebrow accent">The people behind the games</span>
              <h2>Hi, welcome to {name} 👋</h2>
              <p>{settings.footerBlurb}</p>
              <Link href="/about" className="btn btn-bf-teal">More about us →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Latest feed ---------- */}
      {more.length > 0 && (
        <section className="bf-section pt-0">
          <div className="container">
            <SecHead
              eyebrow="Fresh off the press"
              title="Latest"
              sub="The newest guides, newest first."
              link={<Link href="/blog" className="bf-link-arrow">All games →</Link>}
            />
            <div className="row g-4">
              {more.map((p) => (
                <div className="col-6 col-lg-3" key={p._id}>
                  <PostCard post={p} showExcerpt={false} commentCount={counts[p._id] || 0} commentsEnabled={cm} />
                </div>
              ))}
            </div>
            <div className="text-center mt-5">
              <Link href="/blog" className="btn btn-bf">See all games</Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Pinterest wall ---------- */}
      {pinterest && pins.length >= 3 && (
        <section className="bf-section bf-pin-sec">
          <div className="container">
            <SecHead
              eyebrow="Where our game nights begin"
              title="Follow us on Pinterest"
              sub="Ideas, printables and game inspiration. Save your favorites for game night."
            />
          </div>
          <div className="bf-pins">
            {pins.map((p) => (
              <Link href={`/${p.slug}`} className="bf-pin" key={p._id} aria-label={p.title}>
                <CldImage src={p.featuredImage.url} alt={p.featuredImage.alt || p.title} sizes="(min-width: 992px) 17vw, (min-width: 576px) 33vw, 50vw" widths={[300, 500]} />
              </Link>
            ))}
            <a href={pinterest} target="_blank" rel="noopener noreferrer" className="bf-pin more">
              <i className="bi bi-pinterest" aria-hidden="true" />
              <span>See all our pins →</span>
            </a>
          </div>
        </section>
      )}

      {/* ---------- CTA band ---------- */}
      <section className="bf-band">
        <div className="container">
          <div>
            <span className="bf-eyebrow">— Free game ideas</span>
            <h2>Never run out of games to play</h2>
            <p>New games and printables every week. Bookmark the site or follow along so game night is always sorted.</p>
          </div>
          <div className="btns">
            {pinterest && (
              <a href={pinterest} target="_blank" rel="noopener noreferrer" className="btn btn-bf-white">
                <i className="bi bi-pinterest me-2" aria-hidden="true" />Follow on Pinterest
              </a>
            )}
            <Link href="/blog" className="btn btn-bf">Browse games</Link>
          </div>
        </div>
      </section>
    </>
  );
}
