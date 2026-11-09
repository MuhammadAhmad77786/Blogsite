import Link from "next/link";
import LegalPage, { ContactLine } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/data";
import { legalMeta } from "@/lib/legal";

export const revalidate = 3600;

export async function generateMetadata() {
  return legalMeta(await getSettings(), {
    title: "Copyright & DMCA",
    description: "Our copyright policy and how to report content you believe infringes your rights.",
    path: "/copyright",
  });
}

export default async function CopyrightPage() {
  const s = await getSettings();
  const name = s.siteTitle;
  const email = s.contactEmail;

  return (
    <LegalPage title="Copyright & DMCA" subtitle="Respecting creators and their work" current="/copyright">
      <h2>Our content</h2>
      <p>
        © {new Date().getFullYear()} {name}. All rights reserved. Text, graphics, logos and original images on this site are protected by copyright. You may quote
        a short excerpt with clear credit and a link to the original article. Please do not copy full articles or images without written permission. See
        our <Link href="/terms">Terms of Use</Link>.
      </p>

      <h2>We respect the rights of others</h2>
      <p>
        We respect intellectual property and expect our contributors to do the same. If you believe that material on this site infringes your copyright, you may send us
        a notice under the Digital Millennium Copyright Act (DMCA) or equivalent law in your country.
      </p>

      <h2>How to file a takedown notice</h2>
      <p>Please email <ContactLine email={email} /> with the subject “Copyright notice” and include:</p>
      <ol>
        <li>your name, address, phone number and email address;</li>
        <li>a description of the copyrighted work you say has been infringed, with a link to it if available;</li>
        <li>the exact URL(s) on this site of the material you want removed;</li>
        <li>a statement that you have a good-faith belief that the use is not authorized by the copyright owner, its agent or the law;</li>
        <li>a statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf; and</li>
        <li>your physical or electronic signature.</li>
      </ol>
      <p>
        Please be aware that knowingly making a false claim of infringement can lead to legal liability. We review complete notices promptly and may remove or disable access
        to the material while we do.
      </p>

      <h2>Counter-notice</h2>
      <p>
        If you believe material was removed by mistake or misidentification, you may send a counter-notice to the same address with your contact details, a description of the
        removed material and its former location, a statement under penalty of perjury that you have a good-faith belief it was removed in error, and consent to the jurisdiction
        of the courts in your location. We may restore the material unless the complainant tells us they have started legal action.
      </p>

      <h2>Repeat infringers</h2>
      <p>In appropriate circumstances we will block users who repeatedly infringe the rights of others.</p>

      <h2>Image credits</h2>
      <p>
        If you recognize your own work or a credit is missing, tell us at <ContactLine email={email} /> and we will add a credit or remove the image.
      </p>
    </LegalPage>
  );
}
