import slugify from "slugify";

export const RESERVED_SLUGS = [
  "admin", "api", "blog", "category", "about", "contact", "search", "privacy", "terms",
  "disclaimer", "cookie-policy", "cookies", "copyright", "dmca", "editorial-policy", "privacy-policy", "terms-and-conditions", "terms-of-use", "ads.txt", "sitemap", "sitemap.xml", "robots", "robots.txt", "login", "tag", "tags", "_next", "icon", "apple-icon",
];

export function makeSlug(input) {
  return slugify(String(input || ""), { lower: true, strict: true, trim: true }).slice(0, 120);
}

export function isReserved(slug) {
  return RESERVED_SLUGS.includes(slug);
}

/** Returns a slug not used by Model (excluding excludeId), appending -2, -3 and so on. */
export async function uniqueSlug(Model, base, excludeId = null) {
  const root = isReserved(base || "post") ? `${base || "post"}-post` : base || "post";
  let slug = root;
  let n = 1;
  for (;;) {
    const q = { slug };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await Model.exists(q);
    if (!exists) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}
