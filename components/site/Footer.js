import Link from "next/link";
import Brand from "./Brand";
import { getFooterCategories, getNavCategories, getSettings } from "@/lib/data";

export const SOCIALS = [
  ["pinterest", "bi-pinterest", "Pinterest"],
  ["instagram", "bi-instagram", "Instagram"],
  ["facebook", "bi-facebook", "Facebook"],
  ["tiktok", "bi-tiktok", "TikTok"],
  ["x", "bi-twitter-x", "X"],
];

export default async function Footer() {
  const [s, cats, navCats] = await Promise.all([getSettings(), getFooterCategories(), getNavCategories()]);
  const links = s.socialLinks || {};
  const browse = cats.length ? cats : navCats;
  const socials = SOCIALS.filter(([k]) => links[k]);

  return (
    <footer className="bf-footer">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <Brand settings={s} size={36} />
            <p className="mt-3 pe-lg-4 mb-3">{s.footerBlurb}</p>
            {socials.length > 0 && (
              <div className="bf-social">
                {socials.map(([k, icon, label]) => (
                  <a key={k} href={links[k]} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <i className={`bi ${icon}`} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="col-6 col-lg-3">
            <h4>Browse games</h4>
            <ul>
              {browse.map((c) => (
                <li key={c._id}><Link href={`/category/${c.slug}`}>{c.name}</Link></li>
              ))}
              <li><Link href="/blog">All games</Link></li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/editorial-policy">Editorial policy</Link></li>
              <li><Link href="/search">Search</Link></li>
            </ul>
          </div>
          <div className="col-lg-3">
            <h4>Get in touch</h4>
            <ul>
              {s.contactEmail ? (
                <li><a href={`mailto:${s.contactEmail}`}><i className="bi bi-envelope me-2" />{s.contactEmail}</a></li>
              ) : (
                <li><Link href="/contact">Send us a message</Link></li>
              )}
              <li className="small">Our games and printables are free for personal, home and classroom use.</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bf-footer-bottom">
        <div className="container py-3 d-flex flex-wrap justify-content-between gap-2">
          <span>© {new Date().getFullYear()} {s.siteTitle}</span>
          <span className="d-flex flex-wrap gap-2">
            <Link href="/privacy">Privacy Policy</Link><span aria-hidden="true">|</span>
            <Link href="/cookie-policy">Cookie Policy</Link><span aria-hidden="true">|</span>
            <Link href="/terms">Terms</Link><span aria-hidden="true">|</span>
            <Link href="/disclaimer">Disclaimer</Link><span aria-hidden="true">|</span>
            <Link href="/copyright">Copyright</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
