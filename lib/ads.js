// Ad configuration. Network IDs come from environment variables (never hardcoded).
// Which network is active (site-wide, per category, per post) is controlled from /admin.

export const NETWORKS = ["adsense", "ezoic", "medianet"];
export const PLACEMENTS = ["top", "inContent", "bottom", "listing"];

const SUFFIX = { top: "TOP", inContent: "INCONTENT", bottom: "BOTTOM", listing: "LISTING" };
const env = (k) => String(process.env[k] || "").trim();

/** Which networks have credentials in the environment (used to show status in admin). */
export function configuredNetworks() {
  return {
    adsense: !!env("ADSENSE_CLIENT_ID"),
    ezoic: PLACEMENTS.some((p) => env(`EZOIC_ID_${SUFFIX[p]}`)),
    medianet: !!env("MEDIANET_CID"),
  };
}

/** post override > first category override > site default */
export function resolveNetwork(settings, post, categories = []) {
  const pick = (v) => (v && v !== "default" ? v : null);
  const chosen = pick(post?.adNetwork) || categories.map((c) => pick(c?.adNetwork)).find(Boolean) || settings?.ads?.network || "none";
  return NETWORKS.includes(chosen) ? chosen : "none";
}

/** Returns props for <AdUnit/> or null when nothing should render. */
export function adFor(settings, network, placement) {
  if (!NETWORKS.includes(network) || !PLACEMENTS.includes(placement)) return null;
  const enabled = settings?.ads?.placements?.[placement];
  if (enabled === false) return null;
  const sfx = SUFFIX[placement];

  if (network === "adsense") {
    const client = env("ADSENSE_CLIENT_ID");
    const slot = env(`ADSENSE_SLOT_${sfx}`);
    if (!client || !slot) return null;
    return { network, placement, client, slot };
  }
  if (network === "ezoic") {
    const id = env(`EZOIC_ID_${sfx}`);
    if (!/^\d{2,6}$/.test(id)) return null;
    return { network, placement, ezoicId: id };
  }
  if (network === "medianet") {
    const cid = env("MEDIANET_CID");
    const crid = env(`MEDIANET_CRID_${sfx}`);
    if (!cid || !crid) return null;
    return { network, placement, cid, crid, size: env("MEDIANET_SIZE") || "300x250" };
  }
  return null;
}

/**
 * Splits sanitized article HTML after the Nth top-level paragraph, so an ad can sit inside the text
 * without breaking blockquotes or lists. Returns [before, after] or null if the article is too short.
 */
export function splitAfterParagraph(html, n = 3, minTotal = 6) {
  const re = /<(\/?)(blockquote|ul|ol|pre|figure)\b[^>]*>|<\/p>/gi;
  let depth = 0;
  let count = 0;
  let splitAt = -1;
  let total = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m[2]) {
      depth += m[1] ? -1 : 1;
      if (depth < 0) depth = 0;
    } else if (depth === 0) {
      total += 1;
      count += 1;
      if (count === n && splitAt === -1) splitAt = m.index + m[0].length;
    }
  }
  if (splitAt === -1 || total < minTotal) return null;
  return [html.slice(0, splitAt), html.slice(splitAt)];
}
