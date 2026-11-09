import Link from "next/link";
import LegalPage, { ContactLine } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/data";
import { legalMeta } from "@/lib/legal";
import { siteUrl } from "@/lib/env";

export const revalidate = 3600;

export async function generateMetadata() {
  return legalMeta(await getSettings(), {
    title: "Terms of Use",
    description: "The rules for using this website, including content, comments, advertising and liability.",
    path: "/terms",
  });
}

export default async function TermsPage() {
  const s = await getSettings();
  const name = s.siteTitle;

  return (
    <LegalPage title="Terms of Use" subtitle={`Please read these terms before using ${name}`} current="/terms">
      <p>
        Welcome to {name} (the “Site”), located at {siteUrl()}. By accessing or using the Site you agree to these Terms of Use and our{" "}
        <Link href="/privacy">Privacy Policy</Link>. If you do not agree, please do not use the Site.
      </p>

      <h2>1. Use of the Site</h2>
      <p>
        You may use the Site for lawful, personal, non-commercial purposes. You agree not to misuse the Site, interfere with its operation,
        attempt to gain unauthorized access, use automated tools to scrape or overload it, or use it in any way that violates applicable law.
      </p>

      <h2>2. Content and intellectual property</h2>
      <p>
        Unless stated otherwise, the articles, text, graphics, logos, layout and other material on the Site are owned by {name} or its
        licensors and are protected by copyright and other laws. You may view and share links to our pages and quote short excerpts with
        clear credit and a link back to the original article. You may not copy, republish, sell or distribute our content, or use it to train
        automated systems, without our written permission. See our <Link href="/copyright">Copyright / DMCA page</Link> if you believe
        content on the Site infringes your rights.
      </p>
      <p>
        Product names, brands and trademarks mentioned on the Site belong to their respective owners. Their appearance does not imply endorsement.
      </p>

      <h2>3. Comments and user contributions</h2>
      <p>If you submit a comment, you confirm that:</p>
      <ul>
        <li>you own it or have the right to post it, and it does not infringe anyone’s rights;</li>
        <li>it is not unlawful, defamatory, abusive, hateful, misleading, or spam, and does not contain malware or promotional links;</li>
        <li>it does not disclose private information about others.</li>
      </ul>
      <p>
        You grant us a non-exclusive, royalty-free, worldwide license to display, store and reproduce your comment on the Site. We moderate comments
        and may edit, refuse or remove any comment at our discretion, without notice.
      </p>

      <h2>4. Advertising and third-party content</h2>
      <p>
        The Site displays advertisements and may link to third-party websites, products and services. We do not control and are not responsible
        for third-party content, ads, offers or practices. Any dealings you have with advertisers or third-party sites are solely between you and them.
        Clicking ads or links is at your own risk. You agree not to click ads artificially or interfere with ad delivery.
      </p>

      <h2>5. No professional advice</h2>
      <p>
        Content on the Site is provided for general information and inspiration. It is not professional, medical, dermatological or financial advice.
        Please read our <Link href="/disclaimer">Disclaimer</Link>.
      </p>

      <h2>6. Disclaimer of warranties</h2>
      <p>
        The Site and its content are provided “as is” and “as available” without warranties of any kind, express or implied, including accuracy,
        completeness, fitness for a particular purpose and non-infringement. We do not guarantee that the Site will be uninterrupted, secure or error-free.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {name} and its owners, contributors and partners will not be liable for any indirect, incidental, special,
        consequential or punitive damages, or any loss of profits, data or goodwill, arising from your use of, or inability to use, the Site or its content,
        even if we were advised of the possibility of such damages.
      </p>

      <h2>8. Indemnification</h2>
      <p>You agree to indemnify and hold harmless {name} and its owners from claims, damages and expenses arising from your breach of these Terms or your misuse of the Site.</p>

      <h2>9. Changes to the Site and these Terms</h2>
      <p>
        We may change or discontinue any part of the Site, and update these Terms, at any time. The “Last updated” date shows the latest version.
        Continuing to use the Site after changes means you accept them.
      </p>

      <h2>10. Termination</h2>
      <p>We may restrict or block access to the Site for anyone who violates these Terms.</p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction in which the Site’s owner is established, without regard to conflict-of-law rules.
        Any dispute will be handled by the competent courts of that jurisdiction, unless mandatory consumer law in your country says otherwise.
      </p>

      <h2>12. Contact</h2>
      <p>Questions about these Terms? Contact us at <ContactLine email={s.contactEmail} />.</p>
    </LegalPage>
  );
}
