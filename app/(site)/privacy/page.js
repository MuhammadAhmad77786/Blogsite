import Link from "next/link";
import LegalPage, { ContactLine } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/data";
import { legalMeta } from "@/lib/legal";
import { siteUrl } from "@/lib/env";

export const revalidate = 3600;

export async function generateMetadata() {
  return legalMeta(await getSettings(), {
    title: "Privacy Policy",
    description: "How we collect, use and protect your information, including cookies and advertising partners such as Google AdSense.",
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const s = await getSettings();
  const name = s.siteTitle;
  const url = siteUrl();
  const email = s.contactEmail;

  return (
    <LegalPage title="Privacy Policy" subtitle={`How ${name} handles your information`} current="/privacy">
      <p>
        This Privacy Policy explains what information {name} (“we”, “us”, “our”), available at {url}, collects when you visit
        or interact with the site, how we use it, and the choices you have. By using the site you agree to the practices
        described here. If you do not agree, please do not use the site.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Information you give us</h3>
      <ul>
        <li><strong>Comments.</strong> If you leave a comment we collect the name, email address and message you submit. Your email address is never displayed publicly.</li>
        <li><strong>Emails.</strong> If you contact us by email we keep your message and address so we can reply.</li>
      </ul>
      <h3>Information collected automatically</h3>
      <p>
        When you visit, our servers and our analytics and advertising partners may automatically receive technical information such
        as your IP address, browser type and version, device type, operating system, language, the pages you view, the time and date
        of your visit, and the website that referred you. This is collected using server logs, cookies and similar technologies.
      </p>
      <p>We do not require you to create an account to read the site, and we do not knowingly collect sensitive personal information.</p>

      <h2>2. How we use information</h2>
      <ul>
        <li>to operate, maintain and improve the site and its content;</li>
        <li>to display, moderate and respond to comments and messages;</li>
        <li>to understand how visitors use the site (analytics) and fix problems;</li>
        <li>to show advertising that helps fund the site;</li>
        <li>to protect the site against spam, abuse and security threats; and</li>
        <li>to comply with legal obligations.</li>
      </ul>

      <h2>3. Legal bases (EEA, UK and similar regions)</h2>
      <p>
        Where data protection law such as the GDPR applies, we process personal data based on your <strong>consent</strong> (for
        example, advertising and analytics cookies, and comments you choose to submit), our <strong>legitimate interests</strong>
        (running, securing and improving the site), and <strong>legal obligations</strong>. You can withdraw consent at any time
        without affecting processing that happened before.
      </p>

      <h2>4. Cookies and similar technologies</h2>
      <p>
        We and our partners use cookies, local storage and similar technologies for analytics and advertising. You can read about
        the types of cookies, what they do and how to control them in our <Link href="/cookie-policy">Cookie Policy</Link>.
      </p>

      <h2>5. Advertising</h2>
      <p>
        We may display advertisements served by third parties, including <strong>Google AdSense</strong>, and may also work with
        other advertising networks such as Ezoic or Media.net. These companies are “third-party vendors”.
      </p>
      <ul>
        <li>Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this website and other websites.</li>
        <li>Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</li>
        <li>
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>. You can also opt out of
          some third-party vendors’ use of cookies for personalized advertising by visiting{" "}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a>,{" "}
          <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer">the Network Advertising Initiative opt-out page</a> or, in Europe,{" "}
          <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">Your Online Choices</a>.
        </li>
        <li>
          To learn how Google uses data from sites that use its services, see{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses information from sites or apps that use our services</a>.
        </li>
        <li>Advertising partners may collect and use your IP address, device identifiers and browsing information subject to their own privacy policies, which we do not control.</li>
        <li>Visitors in the European Economic Area, the United Kingdom and Switzerland may be asked for consent before personalized ads are shown.</li>
      </ul>

      <h2>6. Analytics</h2>
      <p>
        We may use Google Analytics or similar tools to understand traffic and improve the site. These tools use cookies to collect
        information such as pages visited and approximate location, in aggregate form. You can prevent Google Analytics from
        collecting your data by installing the{" "}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.
      </p>

      <h2>7. Third-party services we use</h2>
      <ul>
        <li><strong>Cloudinary</strong> delivers and optimizes the images on the site.</li>
        <li><strong>Hosting and database providers</strong> store the site and its content, including comments.</li>
        <li><strong>Social sharing links</strong> (Pinterest, Facebook, X, WhatsApp) are ordinary links. They only share data with those services if you click them and use them.</li>
        <li><strong>Google reCAPTCHA</strong> protects our administrator login from automated abuse. It is not shown to ordinary visitors.</li>
      </ul>
      <p>Each of these services has its own privacy policy and handles data under its own terms.</p>

      <h2>8. Comments</h2>
      <p>
        Comments are moderated before they appear. The name and text of an approved comment are public. Please do not include personal
        information you do not want others to see. You can ask us to edit or delete your comment at any time (see “Your rights”).
      </p>

      <h2>9. Sharing and disclosure</h2>
      <p>
        We do not sell your personal information for money. We share information only with service providers who help us run the site
        (as described above), with advertising partners as described in section 5, when required by law or to protect rights and safety,
        and in connection with a business transfer such as a merger or sale of the site.
      </p>

      <h2>10. Data retention</h2>
      <p>
        We keep comments and email correspondence for as long as needed for the purpose they were provided, and then delete or
        anonymize them. Server logs and analytics data are kept for a limited period. Advertising partners retain data according to their own policies.
      </p>

      <h2>11. Your rights</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>access the personal data we hold about you and receive a copy;</li>
        <li>correct inaccurate data and request deletion of your data;</li>
        <li>restrict or object to certain processing, and withdraw consent at any time;</li>
        <li>data portability; and</li>
        <li>lodge a complaint with your local data protection authority.</li>
      </ul>
      <p>
        <strong>California residents (CCPA/CPRA).</strong> You may request to know, correct or delete personal information we collect,
        and to opt out of the “sale” or “sharing” of personal information. We do not sell personal information for money. Some uses of
        advertising cookies by our partners may be considered “sharing” under California law; you can opt out using the advertising
        opt-out links in section 5. We will not discriminate against you for exercising your rights.
      </p>
      <p>To exercise any of these rights, contact us at <ContactLine email={email} />. We may need to verify your identity before acting on a request.</p>

      <h2>12. Children’s privacy</h2>
      <p>
        The site is not directed to children under 13 (or under 16 where local law requires), and we do not knowingly collect personal
        information from them. If you believe a child has given us personal information, contact us and we will delete it.
      </p>

      <h2>13. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect information, including encrypted connections (HTTPS) and
        restricted administrator access. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.
      </p>

      <h2>14. International transfers</h2>
      <p>
        Our providers may process data in countries other than your own, including the United States. Where required, we rely on appropriate
        safeguards such as standard contractual clauses.
      </p>

      <h2>15. Links to other sites</h2>
      <p>The site contains links to third-party websites. We are not responsible for their content or privacy practices, and we encourage you to read their policies.</p>

      <h2>16. Changes to this policy</h2>
      <p>We may update this policy from time to time. The “Last updated” date at the top shows when it last changed. Continued use of the site after changes means you accept the updated policy.</p>

      <h2>17. Contact us</h2>
      <p>Questions about this policy or your data? Contact us at <ContactLine email={email} />.</p>
    </LegalPage>
  );
}
