"use client";
import ImageField from "./ImageField";

function meter(len, min, max) {
  if (len === 0) return { cls: "bg-secondary", pct: 0 };
  const pct = Math.min(100, (len / max) * 100);
  if (len < min) return { cls: "bg-warning", pct };
  if (len > max) return { cls: "bg-danger", pct: 100 };
  return { cls: "bg-success", pct };
}

function Check({ ok, children }) {
  return (
    <li className={ok ? "text-success" : "text-muted"}>
      <i className={`bi ${ok ? "bi-check-circle-fill" : "bi-circle"} me-2`} />
      {children}
    </li>
  );
}

function stripHtml(html) {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function SeoPanel({ seo, onChange, title, slug, content, excerpt, featuredAlt, siteUrl, siteName }) {
  const set = (k, v) => onChange({ ...seo, [k]: v });
  const shownTitle = seo.title || title || "Post title";
  const shownDesc = seo.metaDescription || excerpt || "Meta description will appear here.";
  const kw = (seo.focusKeyword || "").trim().toLowerCase();
  const text = stripHtml(content).toLowerCase();
  const firstPara = text.slice(0, 300);
  const words = text ? text.split(" ").length : 0;
  const tm = meter(shownTitle.length, 30, 60);
  const dm = meter((seo.metaDescription || "").length, 120, 160);

  return (
    <div className="adm-card">
      <h2 className="h5 mb-3"><i className="bi bi-graph-up-arrow me-2" />SEO</h2>

      <div className="snippet mb-3">
        <div className="u">{siteUrl.replace(/^https?:\/\//, "")} › {slug || "post-slug"}</div>
        <div className="t text-truncate">{shownTitle.slice(0, 70)} {siteName ? `| ${siteName}` : ""}</div>
        <div className="d">{shownDesc.slice(0, 160)}</div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">SEO title</label>
        <input className="form-control" maxLength={120} value={seo.title} placeholder={title} onChange={(e) => set("title", e.target.value)} />
        <div className="progress mt-1" style={{ height: 5 }}><div className={`progress-bar ${tm.cls}`} style={{ width: `${tm.pct}%` }} /></div>
        <div className="form-text">{shownTitle.length} characters · aim for 50–60</div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Meta description</label>
        <textarea className="form-control" rows={3} maxLength={320} value={seo.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
        <div className="progress mt-1" style={{ height: 5 }}><div className={`progress-bar ${dm.cls}`} style={{ width: `${dm.pct}%` }} /></div>
        <div className="form-text">{(seo.metaDescription || "").length} characters · aim for 120–160</div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Focus keyword</label>
        <input className="form-control" maxLength={80} value={seo.focusKeyword} onChange={(e) => set("focusKeyword", e.target.value)} />
        <ul className="list-unstyled small mt-2 mb-0">
          <Check ok={!!kw && shownTitle.toLowerCase().includes(kw)}>Keyword appears in the SEO title</Check>
          <Check ok={!!kw && (seo.metaDescription || "").toLowerCase().includes(kw)}>Keyword appears in the meta description</Check>
          <Check ok={!!kw && (slug || "").replace(/-/g, " ").includes(kw.replace(/-/g, " "))}>Keyword appears in the URL</Check>
          <Check ok={!!kw && firstPara.includes(kw)}>Keyword appears in the first paragraph</Check>
          <Check ok={!!kw && (featuredAlt || "").toLowerCase().includes(kw)}>Keyword appears in the featured image alt text</Check>
          <Check ok={words >= 300}>Content is at least 300 words ({words} now)</Check>
        </ul>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Canonical URL (optional)</label>
        <input className="form-control" type="url" maxLength={500} placeholder="https://…" value={seo.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)} />
      </div>

      <ImageField
        label="Social share image (optional)"
        value={{ url: seo.ogImage, publicId: "" }}
        onChange={(v) => set("ogImage", v.url)}
        help="Overrides the featured image on Pinterest, Facebook and X."
      />

      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id="noindex" checked={!!seo.noindex} onChange={(e) => set("noindex", e.target.checked)} />
        <label className="form-check-label" htmlFor="noindex">Hide from search engines (noindex)</label>
      </div>
    </div>
  );
}
