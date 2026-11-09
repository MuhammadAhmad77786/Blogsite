import Link from "next/link";
import Confetti from "./Confetti";

/**
 * Page header used on listings and static pages.
 * crumbs: optional [{ href, label }] rendered before the title (last item is the current page).
 */
export default function PageHead({ title, subtitle, eyebrow, crumbs }) {
  return (
    <section className="bf-page-head">
      <Confetti edges />
      <div className="container">
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="bf-crumbs">
            {crumbs.map((c, i) => (
              <span key={c.href || i}>
                {i > 0 && <span className="sep">/</span>}
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        {eyebrow ? <span className="bf-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </section>
  );
}
