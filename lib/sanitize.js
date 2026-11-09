import sanitizeHtml from "sanitize-html";

const RICH = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "strong", "b", "em", "i", "s", "u",
    "a", "img", "hr", "figure", "figcaption", "code", "pre",
    // Simple tables (no attributes), e.g. "Players / Ages / Time" boxes in game posts.
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer nofollow", ...(attribs.target ? { target: "_blank" } : {}) },
    }),
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
};

export function sanitizeRich(html) {
  return sanitizeHtml(String(html || ""), RICH);
}

const NONE = { allowedTags: [], allowedAttributes: {} };

function decode(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Plain text with all markup removed (safe for storage; escaped again by React on render). */
export function stripTags(text) {
  return decode(sanitizeHtml(String(text || ""), NONE)).trim();
}
