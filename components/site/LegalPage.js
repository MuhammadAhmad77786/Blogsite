import Link from "next/link";
import PageHead from "./PageHead";
import { LAST_UPDATED } from "@/lib/legal";

const LINKS = [
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms of Use"],
  ["/disclaimer", "Disclaimer"],
  ["/cookie-policy", "Cookie Policy"],
  ["/copyright", "Copyright / DMCA"],
  ["/editorial-policy", "Editorial Policy"],
];

export function ContactLine({ email }) {
  return email ? (
    <a href={`mailto:${email}`}>{email}</a>
  ) : (
    <Link href="/contact">our contact page</Link>
  );
}

export default function LegalPage({ title, subtitle, current, children }) {
  return (
    <>
      <PageHead title={title} subtitle={subtitle} />
      <div className="container py-5">
        <div className="bf-prose bf-legal">
          <p className="text-muted small">Last updated: {LAST_UPDATED}</p>
          {children}
          <hr className="my-5" />
          <p className="small text-muted mb-2">Related pages</p>
          <ul className="list-inline small">
            {LINKS.filter(([href]) => href !== current).map(([href, label]) => (
              <li className="list-inline-item me-3" key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
