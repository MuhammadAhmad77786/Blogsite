import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import { getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata() {
  const s = await getSettings();
  return buildMetadata(s, {
    title: `Contact Us | ${s.siteTitle}`,
    description: `Contact the ${s.siteTitle} team for questions, collaborations, corrections, copyright requests and privacy requests.`,
    path: "/contact",
  });
}

const SOCIALS = [
  ["pinterest", "bi-pinterest", "Pinterest"],
  ["instagram", "bi-instagram", "Instagram"],
  ["facebook", "bi-facebook", "Facebook"],
  ["tiktok", "bi-tiktok", "TikTok"],
  ["x", "bi-twitter-x", "X"],
];

export default async function ContactPage() {
  const s = await getSettings();
  const links = s.socialLinks || {};
  return (
    <>
      <PageHead eyebrow="Say hello" title="Contact Us" subtitle="Questions, game requests, collaborations or feedback? We would love to hear from you." crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]} />
      <div className="container py-5">
        <div className="bf-prose">
          <div className="text-center mb-4">
            {s.contactEmail ? (
              <>
                <p className="fs-5 mb-1">Email us at</p>
                <p className="h3"><a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></p>
              </>
            ) : (
              <p className="fs-5">Our contact email will be available here soon.</p>
            )}
            <div className="bf-share mt-3">
              {SOCIALS.filter(([k]) => links[k]).map(([k, icon, label]) => (
                <a key={k} href={links[k]} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  <i className={`bi ${icon}`} />
                </a>
              ))}
            </div>
          </div>

          <h2>What you can contact us about</h2>
          <ul>
            <li><strong>Questions and feedback</strong> about our games and printables.</li>
            <li><strong>Game requests.</strong> Tell us what kind of game you would like next.</li>
            <li><strong>Collaborations and partnerships.</strong> Tell us briefly about your brand and idea.</li>
            <li><strong>Corrections.</strong> If you spot an error, we will review it promptly. See our <Link href="/editorial-policy">Editorial Policy</Link>.</li>
            <li><strong>Copyright and image credits.</strong> See our <Link href="/copyright">Copyright / DMCA page</Link> for what to include.</li>
            <li><strong>Privacy requests.</strong> To access, correct or delete your data, see our <Link href="/privacy">Privacy Policy</Link>.</li>
          </ul>

          <h2>Response time</h2>
          <p>We read every message and aim to reply within 2 to 5 business days.</p>
        </div>
      </div>
    </>
  );
}
