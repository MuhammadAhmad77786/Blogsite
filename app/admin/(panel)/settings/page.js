"use client";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import ImageField from "@/components/admin/ImageField";

export default function SettingsPage() {
  const { api } = useAdmin();
  const [s, setS] = useState(null);
  const [adsEnv, setAdsEnv] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api("/api/admin/settings").then((d) => { setS(d.settings); setAdsEnv(d.adsEnv || {}); }).catch((e) => setMsg({ type: "danger", text: e.message }));
  }, [api]);

  if (!s) return msg ? <div className="alert alert-danger">{msg.text}</div> : <p>Loading…</p>;

  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const nest = (k, sub, v) => setS((p) => ({ ...p, [k]: { ...(p[k] || {}), [sub]: v } }));
  const img = (i) => ({ url: i?.url || "", publicId: i?.publicId || "" });

  async function save(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: {
          siteTitle: s.siteTitle, tagline: s.tagline,
          logo: img(s.logo), favicon: img(s.favicon), heroImage: img(s.heroImage), bannerImage: img(s.bannerImage), defaultOgImage: img(s.defaultOgImage),
          heroSlides: (s.heroSlides || []).map((x) => ({
            image: img(x.image), eyebrow: x.eyebrow || "", title: x.title || "", text: x.text || "",
            linkLabel: x.linkLabel || "", linkHref: x.linkHref || "",
          })),
          ads: {
            network: s.ads?.network || "none",
            placements: { top: s.ads?.placements?.top !== false, inContent: s.ads?.placements?.inContent !== false, bottom: s.ads?.placements?.bottom !== false, listing: s.ads?.placements?.listing !== false },
            adsTxt: s.ads?.adsTxt || "",
          },
          contactEmail: s.contactEmail || "", socialLinks: s.socialLinks || {}, footerBlurb: s.footerBlurb || "",
          seoDefaults: s.seoDefaults || {}, analytics: s.analytics || {}, commentsEnabled: s.commentsEnabled !== false,
        },
      });
      setMsg({ type: "success", text: "Settings saved." });
    } catch (err) { setMsg({ type: "danger", text: err.message }); }
    setSaving(false);
  }

  const social = ["pinterest", "instagram", "facebook", "tiktok", "x"];

  return (
    <form onSubmit={save}>
      <div className="d-flex align-items-center mb-3">
        <h1 className="h3 me-auto mb-0">Settings</h1>
        <button className="btn btn-bf" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button>
      </div>
      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="adm-card mb-3">
            <h2 className="h5">General</h2>
            <label className="form-label small">Site title</label>
            <input className="form-control mb-2" required maxLength={80} value={s.siteTitle || ""} onChange={(e) => set("siteTitle", e.target.value)} />
            <label className="form-label small">Tagline</label>
            <input className="form-control mb-2" maxLength={200} value={s.tagline || ""} onChange={(e) => set("tagline", e.target.value)} />
            <label className="form-label small">Contact email</label>
            <input className="form-control mb-2" type="email" maxLength={200} value={s.contactEmail || ""} onChange={(e) => set("contactEmail", e.target.value)} />
            <label className="form-label small">Footer blurb</label>
            <textarea className="form-control mb-2" rows={3} maxLength={500} value={s.footerBlurb || ""} onChange={(e) => set("footerBlurb", e.target.value)} />
            <label className="form-label small">Permalink structure</label>
            <input className="form-control mb-2" value={s.permalinkStructure || "/{slug}"} disabled />
            <div className="form-check form-switch mt-2">
              <input className="form-check-input" type="checkbox" id="cm" checked={s.commentsEnabled !== false} onChange={(e) => set("commentsEnabled", e.target.checked)} />
              <label className="form-check-label" htmlFor="cm">Enable comments</label>
            </div>
          </div>
          <div className="adm-card">
            <h2 className="h5">Social links</h2>
            {social.map((k) => (
              <div className="input-group mb-2" key={k}>
                <span className="input-group-text text-capitalize" style={{ width: 110 }}>{k}</span>
                <input className="form-control" type="url" placeholder="https://…" maxLength={300} value={s.socialLinks?.[k] || ""} onChange={(e) => nest("socialLinks", k, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="adm-card mb-3">
            <h2 className="h5">Branding</h2>
            <ImageField label="Logo (leave empty to use the built-in mark)" value={s.logo} onChange={(v) => set("logo", v)} />
            <ImageField label="Favicon (stored for reference)" value={s.favicon} onChange={(v) => set("favicon", v)} />
            <ImageField label="Home “About” image (square photo next to the welcome text)" value={s.bannerImage} onChange={(v) => set("bannerImage", v)} />
            <ImageField label="Default social share (OG) image" value={s.defaultOgImage} onChange={(v) => set("defaultOgImage", v)} />
          </div>
          <div className="adm-card mb-3">
            <div className="d-flex align-items-center mb-2">
              <h2 className="h5 me-auto mb-0">Home hero (slide 1 is shown)</h2>
              <button type="button" className="btn btn-sm btn-outline-secondary" disabled={(s.heroSlides || []).length >= 6}
                onClick={() => set("heroSlides", [...(s.heroSlides || []), { image: { url: "", publicId: "" }, eyebrow: "", title: "", text: "", linkLabel: "", linkHref: "" }])}>
                Add slide
              </button>
            </div>
            <p className="text-muted small">Slide 1 fills the home hero: label, headline (wrap words in *stars* to highlight them), text, button and a portrait image (recommended 880 x 1100). Empty fields use the built-in defaults.</p>
            {(s.heroSlides || []).map((sl, i) => {
              const upd = (k, v) => set("heroSlides", s.heroSlides.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
              return (
                <div className="border rounded-3 p-2 mb-2" key={i}>
                  <div className="d-flex align-items-center mb-1">
                    <strong className="me-auto">Slide {i + 1}</strong>
                    <button type="button" className="btn btn-sm btn-link" disabled={i === 0} onClick={() => { const a = [...s.heroSlides]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; set("heroSlides", a); }}>Up</button>
                    <button type="button" className="btn btn-sm btn-link" disabled={i === s.heroSlides.length - 1} onClick={() => { const a = [...s.heroSlides]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; set("heroSlides", a); }}>Down</button>
                    <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => set("heroSlides", s.heroSlides.filter((_, j) => j !== i))}>Remove</button>
                  </div>
                  <ImageField value={sl.image} onChange={(v) => upd("image", { url: v.url, publicId: v.publicId })} />
                  <input className="form-control form-control-sm mb-1" placeholder="Small label (e.g. Free printables)" maxLength={60} value={sl.eyebrow || ""} onChange={(e) => upd("eyebrow", e.target.value)} />
                  <input className="form-control form-control-sm mb-1" placeholder="Headline" maxLength={120} value={sl.title || ""} onChange={(e) => upd("title", e.target.value)} />
                  <textarea className="form-control form-control-sm mb-1" rows={2} placeholder="Short text" maxLength={300} value={sl.text || ""} onChange={(e) => upd("text", e.target.value)} />
                  <div className="row g-1">
                    <div className="col-5"><input className="form-control form-control-sm" placeholder="Button text" maxLength={40} value={sl.linkLabel || ""} onChange={(e) => upd("linkLabel", e.target.value)} /></div>
                    <div className="col-7"><input className="form-control form-control-sm" placeholder="/category/paper-crafts" maxLength={300} value={sl.linkHref || ""} onChange={(e) => upd("linkHref", e.target.value)} /></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="adm-card mb-3">
            <h2 className="h5">Ads</h2>
            <p className="text-muted small">
              Ad IDs live in <code>.env.local</code> (see <code>.env.example</code>). Here you choose which network is active. You can override it per category and per post.
            </p>
            <label className="form-label small">Active network (site-wide default)</label>
            <select className="form-select mb-2" value={s.ads?.network || "none"} onChange={(e) => nest("ads", "network", e.target.value)}>
              <option value="none">No ads</option>
              <option value="adsense">Google AdSense{adsEnv.adsense ? "" : " (not configured in .env)"}</option>
              <option value="ezoic">Ezoic{adsEnv.ezoic ? "" : " (not configured in .env)"}</option>
              <option value="medianet">Media.net{adsEnv.medianet ? "" : " (not configured in .env)"}</option>
            </select>
            <div className="small mb-2">
              {["adsense", "ezoic", "medianet"].map((n) => (
                <span key={n} className={`badge me-1 text-bg-${adsEnv[n] ? "success" : "secondary"}`}>{n}: {adsEnv[n] ? "IDs found" : "no IDs"}</span>
              ))}
            </div>
            <label className="form-label small mb-1">Where to show ads</label>
            {[["top", "Top of article"], ["inContent", "Inside article (after 3rd paragraph)"], ["bottom", "End of article"], ["listing", "Blog and category listings"]].map(([k, label]) => (
              <div className="form-check form-switch" key={k}>
                <input className="form-check-input" type="checkbox" id={`ad-${k}`} checked={s.ads?.placements?.[k] !== false}
                  onChange={(e) => nest("ads", "placements", { ...(s.ads?.placements || {}), [k]: e.target.checked })} />
                <label className="form-check-label" htmlFor={`ad-${k}`}>{label}</label>
              </div>
            ))}
            <label className="form-label small mt-3 mb-1">ads.txt (served at /ads.txt)</label>
            <textarea className="form-control font-monospace" rows={4} maxLength={5000} placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0" value={s.ads?.adsTxt || ""} onChange={(e) => nest("ads", "adsTxt", e.target.value)} />
          </div>
          <div className="adm-card mb-3">
            <h2 className="h5">Site-wide SEO defaults</h2>
            <label className="form-label small">Default title</label>
            <input className="form-control mb-2" maxLength={120} value={s.seoDefaults?.title || ""} onChange={(e) => nest("seoDefaults", "title", e.target.value)} />
            <label className="form-label small">Default meta description</label>
            <textarea className="form-control" rows={3} maxLength={320} value={s.seoDefaults?.metaDescription || ""} onChange={(e) => nest("seoDefaults", "metaDescription", e.target.value)} />
          </div>
          <div className="adm-card">
            <h2 className="h5">Analytics</h2>
            <label className="form-label small">Google Analytics ID</label>
            <input className="form-control mb-2" placeholder="G-XXXXXXXXXX" maxLength={40} value={s.analytics?.googleAnalyticsId || ""} onChange={(e) => nest("analytics", "googleAnalyticsId", e.target.value)} />
            <label className="form-label small">Search Console verification code</label>
            <input className="form-control" placeholder="Only the content value of the meta tag" maxLength={200} value={s.analytics?.searchConsoleVerification || ""} onChange={(e) => nest("analytics", "searchConsoleVerification", e.target.value)} />
          </div>
        </div>
      </div>
    </form>
  );
}
