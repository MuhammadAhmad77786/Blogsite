import { buildMetadata } from "./seo";

/** Update this date whenever you change the content of a policy page. */
export const LAST_UPDATED = "November 8, 2026";

export function legalMeta(settings, { title, description, path }) {
  return buildMetadata(settings, { title: `${title} | ${settings.siteTitle}`, description, path });
}
