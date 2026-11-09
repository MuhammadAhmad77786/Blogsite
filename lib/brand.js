// Single place for the built-in brand defaults. The live site title comes from
// Admin → Settings; these are only used before settings exist.
export const DEFAULT_SITE_TITLE = "No Boring Games";
export const DEFAULT_TAGLINE = "Fun, simple games for every occasion";
export const DEFAULT_FOOTER_BLURB =
  "Simple, no-equipment-needed games for kids, adults, parties, families and friends, with clear rules and free printables you can set up in minutes.";
export const DEFAULT_SEO_TITLE = "No Boring Games | Fun Games for Kids, Parties, Families & Friends";
export const DEFAULT_SEO_DESCRIPTION =
  "Fun, simple games for kids, adults, parties, holidays and family game night, with clear rules and free printables you can set up in minutes.";

/** Splits a title into [main, accent] for the two-tone wordmark. */
export function splitTitle(title) {
  const t = String(title || DEFAULT_SITE_TITLE).trim();
  const amp = t.match(/^(.+?\s&)\s(.+)$/);
  if (amp) return [amp[1] + " ", amp[2]];
  const words = t.split(/\s+/);
  if (words.length > 1) return [words.slice(0, -1).join(" ") + " ", words[words.length - 1]];
  const camel = t.match(/^([A-Z][a-z0-9]+)([A-Z].*)$/);
  if (camel) return [camel[1], camel[2]];
  return [t, ""];
}
