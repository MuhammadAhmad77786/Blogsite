import Link from "next/link";
import LegalPage, { ContactLine } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/data";
import { legalMeta } from "@/lib/legal";

export const revalidate = 3600;

export async function generateMetadata() {
  return legalMeta(await getSettings(), {
    title: "Disclaimer",
    description: "Important information about the games, printables and activities on this website, including safety, advertising and images.",
    path: "/disclaimer",
  });
}

export default async function DisclaimerPage() {
  const s = await getSettings();
  const name = s.siteTitle;

  return (
    <LegalPage title="Disclaimer" subtitle="Please read this before relying on anything you see here" current="/disclaimer">
      <h2>General information only</h2>
      <p>
        The content on {name} covers games, printables, party ideas and activities. It is published for general information, inspiration
        and entertainment only. We try to keep it accurate and up to date, but we make no representation or warranty, express or implied, about the
        completeness, accuracy, reliability or availability of any content.
      </p>

      <h2>Game safety and supervision</h2>
      <p>
        Games and activities can involve running, small parts, scissors, balloons and other materials that are not safe for every age. Young children should
        always be supervised by an adult. Small pieces can be a choking hazard for children under 3. Always read the labels and follow the manufacturer’s
        instructions for any supplies you use, choose age-appropriate, non-toxic materials, and use your own judgement about whether a project suits the
        children taking part. You are responsible for the safety of the people doing the activity.
      </p>

      <h2>Results and opinions vary</h2>
      <p>
        Your finished project may look different from ours. Results depend on your printer, paper, supplies, skill and many other factors, and colors
        can print differently than they appear on screen. Opinions expressed in articles and comments are those of their authors only.
      </p>

      <h2>Images</h2>
      <p>
        Some images on the site may be illustrative, stock, licensed or digitally created or enhanced. They are used to inspire and may not represent the exact
        result you will get. Printed colors can look different than they do on screen.
      </p>

      <h2>Advertising and sponsored content</h2>
      <p>
        {name} displays third-party advertising, such as Google AdSense, to fund the site. Advertisers do not control our editorial content, and the
        appearance of an ad is not an endorsement by us. If we ever publish sponsored posts or use affiliate links, we will clearly label them. See our{" "}
        <Link href="/privacy">Privacy Policy</Link> for how advertising cookies work and how to opt out.
      </p>

      <h2>Third-party links and products</h2>
      <p>
        We may mention or link to third-party products, brands and websites for convenience. We do not control them and are not responsible for their content,
        availability, prices, policies or any transactions you make. Mentioning a brand does not mean it endorses us or that we endorse it.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        Any reliance you place on information from this site is strictly at your own risk. To the fullest extent permitted by law, we are not liable for any
        loss, injury, damage or expense arising from the use of, or inability to use, the site or its content. See our <Link href="/terms">Terms of Use</Link>.
      </p>

      <h2>Corrections</h2>
      <p>Spotted a mistake? Please tell us at <ContactLine email={s.contactEmail} /> and we will review it promptly.</p>
    </LegalPage>
  );
}
