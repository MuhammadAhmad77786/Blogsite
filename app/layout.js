import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import Script from "next/script";
import { Nunito } from "next/font/google";
import BootstrapClient from "@/components/site/BootstrapClient";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";
import { DEFAULT_SITE_TITLE } from "@/lib/brand";

// Self-hosted by next/font at build time: no external request, no layout shift.
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800", "900"], display: "swap", variable: "--bf-font-nunito" });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdf8f2",
};

export async function generateMetadata() {
  const s = await getSettings();
  const meta = buildMetadata(s, { path: "/" });
  const name = s.siteTitle || DEFAULT_SITE_TITLE;
  return {
    ...meta,
    metadataBase: new URL(siteUrl()),
    applicationName: name,
    title: { default: meta.title.absolute, template: `%s | ${name}` },
    formatDetection: { telephone: false },
    ...(s.analytics?.searchConsoleVerification
      ? { verification: { google: s.analytics.searchConsoleVerification } }
      : {}),
  };
}

export default async function RootLayout({ children }) {
  const s = await getSettings();
  const ga = s.analytics?.googleAnalyticsId;
  return (
    <html lang="en" className={nunito.variable}>
      <body>
        {children}
        <BootstrapClient />
        {ga ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ga)});`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
