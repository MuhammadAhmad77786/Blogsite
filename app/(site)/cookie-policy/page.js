import Link from "next/link";
import LegalPage, { ContactLine } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/data";
import { legalMeta } from "@/lib/legal";

export const revalidate = 3600;

export async function generateMetadata() {
  return legalMeta(await getSettings(), {
    title: "Cookie Policy",
    description: "What cookies this website and its advertising and analytics partners use, and how you can control them.",
    path: "/cookie-policy",
  });
}

export default async function CookiePolicyPage() {
  const s = await getSettings();
  const name = s.siteTitle;

  return (
    <LegalPage title="Cookie Policy" subtitle="What cookies are, how we use them, and your choices" current="/cookie-policy">
      <p>
        This Cookie Policy explains how {name} and our partners use cookies and similar technologies, and how you can manage them. It should be read with our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They let a site remember your device, measure how it is used and, in the case of
        advertising cookies, show ads that are more relevant to you. Similar technologies include local storage, pixels and device identifiers; we call them all “cookies” here.
      </p>

      <h2>Types of cookies on this site</h2>
      <div className="table-responsive">
        <table className="table table-bordered bg-white align-middle small">
          <thead>
            <tr><th>Type</th><th>Purpose</th><th>Examples</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Strictly necessary</strong></td>
              <td>Needed for the site to work and stay secure. The public site sets no tracking cookies of its own for visitors. Administrators receive a login session cookie in the admin area only.</td>
              <td>Admin session cookie (administrators only)</td>
            </tr>
            <tr>
              <td><strong>Analytics</strong></td>
              <td>Help us understand which pages are popular and how visitors use the site, in aggregate. Used only if analytics is enabled.</td>
              <td>Google Analytics: <code>_ga</code>, <code>_ga_*</code></td>
            </tr>
            <tr>
              <td><strong>Advertising</strong></td>
              <td>Used by Google and other ad partners to show ads, limit how often you see an ad, measure ad performance and, where you allow it, personalize ads based on your interests and prior visits.</td>
              <td>Google AdSense / DoubleClick: <code>__gads</code>, <code>__gpi</code>, <code>IDE</code>, <code>test_cookie</code>; Ezoic and Media.net partner cookies, if enabled</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Cookie names and lifetimes are set by the third parties and may change. We do not control cookies placed by third parties.
      </p>

      <h2>Advertising cookies and Google</h2>
      <p>
        Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this site and other websites. Google’s use of advertising cookies enables it
        and its partners to serve ads based on your visit to this site and/or other sites on the Internet. You can opt out of personalized advertising by visiting{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>, and learn more at{" "}
        <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">How Google uses cookies</a>. Visitors in the European Economic Area,
        the United Kingdom and Switzerland may be asked for consent before non-essential cookies are used.
      </p>

      <h2>How to manage cookies</h2>
      <ul>
        <li><strong>Browser settings.</strong> Most browsers let you block or delete cookies. See the help pages for{" "}
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a>,{" "}
          <a href="https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Firefox</a>,{" "}
          <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a> and{" "}
          <a href="https://support.microsoft.com/microsoft-edge" target="_blank" rel="noopener noreferrer">Edge</a>. Blocking all cookies may stop parts of some websites from working.</li>
        <li><strong>Interest-based ads.</strong> Opt out at{" "}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a>,{" "}
          <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer">networkadvertising.org</a> or{" "}
          <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">youronlinechoices.com</a> (Europe).</li>
        <li><strong>Analytics.</strong> Use the{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics opt-out add-on</a>.</li>
        <li><strong>Global signals.</strong> Many browsers support “Do Not Track” and Global Privacy Control. Because there is no common standard for DNT, we may not respond to it, but you can use the opt-outs above.</li>
      </ul>

      <h2>Changes</h2>
      <p>We may update this policy as technology, law or our partners change. The “Last updated” date shows the latest version.</p>

      <h2>Contact</h2>
      <p>Questions about cookies? Contact us at <ContactLine email={s.contactEmail} />.</p>
    </LegalPage>
  );
}
