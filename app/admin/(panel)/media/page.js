"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { cld } from "@/lib/img";

export default function MediaPage() {
  const { api } = useAdmin();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [alts, setAlts] = useState({});

  const load = useCallback(async () => {
    try {
      const d = await api(`/api/admin/media?page=${page}&q=${encodeURIComponent(q)}`);
      setItems(d.items); setPages(d.pages);
      setAlts(Object.fromEntries(d.items.map((m) => [m._id, m.alt || ""])));
    } catch (e) { setMsg({ type: "danger", text: e.message }); }
  }, [api, page, q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  async function upload(e) {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length) return;
    setBusy(true); setMsg(null);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        await api("/api/admin/media", { method: "POST", form });
      }
      setMsg({ type: "success", text: `Uploaded ${files.length} image(s).` });
      setPage(1); load();
    } catch (err) { setMsg({ type: "danger", text: err.message }); }
    setBusy(false);
  }

  async function saveAlt(m) {
    try { await api(`/api/admin/media/${m._id}`, { method: "PATCH", body: { alt: alts[m._id] || "" } }); setMsg({ type: "success", text: "Alt text saved." }); }
    catch (err) { setMsg({ type: "danger", text: err.message }); }
  }
  async function remove(m) {
    if (!window.confirm("Delete this image permanently? Posts using it will show a broken image.")) return;
    try { await api(`/api/admin/media/${m._id}`, { method: "DELETE" }); load(); } catch (err) { setMsg({ type: "danger", text: err.message }); }
  }

  return (
    <>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <h1 className="h3 me-auto mb-0">Media library</h1>
        <input className="form-control" style={{ maxWidth: 240 }} placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <label className={`btn btn-bf mb-0 ${busy ? "disabled" : ""}`}>
          {busy ? "Uploading…" : "Upload images"}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={upload} disabled={busy} />
        </label>
      </div>
      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <div className="row g-3">
        {items.map((m) => (
          <div className="col-6 col-md-4 col-xl-3" key={m._id}>
            <div className="adm-card p-2">
              <img className="adm-thumb mb-2" src={cld(m.url, 400)} alt={m.alt || ""} loading="lazy" />
              <input className="form-control form-control-sm mb-1" placeholder="Alt text" maxLength={300} value={alts[m._id] ?? ""} onChange={(e) => setAlts({ ...alts, [m._id]: e.target.value })} onBlur={() => alts[m._id] !== (m.alt || "") && saveAlt(m)} />
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => navigator.clipboard?.writeText(m.url).then(() => setMsg({ type: "success", text: "URL copied." }))}>Copy URL</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(m)} aria-label="Delete"><i className="bi bi-trash" /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted">No images yet.</p>}
      </div>
      {pages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span className="small align-self-center">{page} / {pages}</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
