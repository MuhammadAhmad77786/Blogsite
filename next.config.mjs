import fs from "node:fs";
import path from "node:path";

const isDev = process.env.NODE_ENV !== "production";

// Public pages that should never be in the sitemap (noindex or not real pages).
const SITEMAP_EXCLUDE = new Set(["/search"]);

/**
 * Finds every static public page under app/(site) at build time, so a new page
 * (e.g. app/(site)/faq/page.js) shows up in page-sitemap.xml without editing any list.
 * Dynamic segments ([slug], [...rest]) are skipped: posts and categories come from the database.
 */
function discoverSitePages() {
  const root = path.join(process.cwd(), "app", "(site)");
  const found = [];
  const walk = (dir, route) => {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some((e) => e.isFile() && /^page\.(js|jsx|ts|tsx|mdx)$/.test(e.name))) found.push(route || "/");
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith("_") || e.name.startsWith("@") || e.name.includes("[")) continue;
      const isGroup = /^\(.*\)$/.test(e.name);
      walk(path.join(dir, e.name), isGroup ? route : `${route}/${e.name}`);
    }
  };
  walk(root, "");
  return found.filter((p) => !SITEMAP_EXCLUDE.has(p)).sort();
}

const adsense = !!process.env.ADSENSE_CLIENT_ID;
const ezoic = Object.keys(process.env).some((k) => k.startsWith("EZOIC_ID_") && process.env[k]);
const medianet = !!process.env.MEDIANET_CID;
const adsOn = adsense || ezoic || medianet;
const adScripts = [
  adsense && "https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://partner.googleadservices.com https://www.googletagservices.com https://adservice.google.com https://*.adtrafficquality.google",
  ezoic && "https://*.ezojs.com https://*.ezoic.net https://*.ezoic.com https://*.ezodn.com https://*.ezoiccdn.com",
  medianet && "https://*.media.net https://contextual.media.net",
].filter(Boolean).join(" ");

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://www.google.com https://www.gstatic.com https://www.googletagmanager.com${adScripts ? " " + adScripts : ""}`,
  "style-src 'self' 'unsafe-inline'",
  adsOn ? "img-src 'self' data: blob: https:" : "img-src 'self' data: blob: https://res.cloudinary.com https://www.google-analytics.com",
  "font-src 'self' data:",
  `connect-src 'self' https://www.google.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com${adScripts ? " " + adScripts : ""}`,
  adsOn ? "frame-src https:" : "frame-src https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  env: { SITE_STATIC_PAGES: JSON.stringify(discoverSitePages()) },
  reactStrictMode: true,
  experimental: { instrumentationHook: true },
  async redirects() {
    return [
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/terms-and-conditions", destination: "/terms", permanent: true },
      { source: "/terms-of-use", destination: "/terms", permanent: true },
      { source: "/cookies", destination: "/cookie-policy", permanent: true },
      { source: "/dmca", destination: "/copyright", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/:type(post|category|page)-sitemap.xml", destination: "/api/sitemap/:type" },
      { source: "/:type(post|category|page)-sitemap:n(\\d+).xml", destination: "/api/sitemap/:type/:n" },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
