import { cld } from "./img";
import { siteUrl } from "./env";
import { DEFAULT_SITE_TITLE } from "./brand";

/**
 * Builds a Next.js metadata object. Falls back to site-wide defaults.
 * path: canonical path beginning with "/".
 */
export function buildMetadata(settings, { title, description, path = "/", image, canonical, noindex = false, type = "website", publishedTime, modifiedTime } = {}) {
  const base = siteUrl();
  const siteTitle = settings?.siteTitle || DEFAULT_SITE_TITLE;
  const desc = description || settings?.seoDefaults?.metaDescription || settings?.tagline || "";
  const fullTitle = title || settings?.seoDefaults?.title || siteTitle;
  const img = image || settings?.defaultOgImage?.url || "";
  const ogImage = img ? cld(img, 1200) : undefined;
  const url = canonical || `${base}${path}`;

  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      url,
      siteName: siteTitle,
      title: fullTitle,
      description: desc,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: fullTitle,
      description: desc,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export function pageTitle(settings, name) {
  return `${name} | ${settings?.siteTitle || DEFAULT_SITE_TITLE}`;
}

/** Safe JSON for embedding in a script tag. */
export function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}
