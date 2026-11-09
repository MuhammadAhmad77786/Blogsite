import Link from "next/link";
import LegalPage, { ContactLine } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/data";
import { legalMeta } from "@/lib/legal";

export const revalidate = 3600;

export async function generateMetadata() {
  return legalMeta(await getSettings(), {
    title: "Editorial Policy",
    description: "How we design, test, review and correct our games and printables, and how advertising stays separate.",
    path: "/editorial-policy",
  });
}

export default async function EditorialPolicyPage() {
  const s = await getSettings();
  const name = s.siteTitle;

  return (
    <LegalPage title="Editorial Policy" subtitle="The standards behind everything we publish" current="/editorial-policy">
      <p>
        {name} exists to help families, teachers and party hosts find simple games that are actually fun. This page explains the standards we hold our content to.
      </p>

      <h2>What we publish</h2>
      <p>
        Original games, rules, printables and party ideas. Our focus is on games that real people can play at home, at parties or in a
        classroom, with little or no equipment, on a small budget and for different ages.
      </p>

      <h2>How we create content</h2>
      <ul>
        <li><strong>Useful first.</strong> Every article should answer a clear question or inspire a specific idea, not just fill space.</li>
        <li><strong>Accuracy.</strong> We play-test our games and test-print our files before publishing, so the rules and supply lists are right.</li>
        <li><strong>Originality.</strong> We write our own text and respect the work of others. We credit sources and do not copy content from other sites.</li>
        <li><strong>Clarity.</strong> We use plain language and clear structure so articles are easy to read on any device.</li>
      </ul>

      <h2>Images</h2>
      <p>
        We use images that we own, create, or have the right to use. Some images may be illustrative or digitally created and may not show real products or guaranteed results. See our{" "}
        <Link href="/disclaimer">Disclaimer</Link>.
      </p>

      <h2>Advertising and independence</h2>
      <p>
        The site is funded by advertising. Advertisers do not review or influence our articles, and ads are kept separate from editorial content. Any sponsored content or affiliate
        relationship will be clearly disclosed. Read how advertising works in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Health and safety</h2>
      <p>
        Some of our games involve running, small parts, balloons or scissors. We flag age guidance and supervision tips where it matters, and we recommend adults supervise young children during every game.
      </p>

      <h2>Corrections and updates</h2>
      <p>
        We review popular games from time to time and update them when we improve a design or find a better method. If you find an error, please email <ContactLine email={s.contactEmail} />.
        We investigate every report and correct confirmed mistakes promptly.
      </p>

      <h2>Comments</h2>
      <p>We welcome respectful comments and moderate them to remove spam, abuse and off-topic content. See our <Link href="/terms">Terms of Use</Link> for the comment rules.</p>
    </LegalPage>
  );
}
