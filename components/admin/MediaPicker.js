"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "./AdminContext";
import { cld } from "@/lib/img";

export default function MediaPicker({ onSelect, onClose }) {
  const { api } = useAdmin();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await api(`/api/admin/media?page=${page}&q=${encodeURIComponent(q)}`);
      setItems(d.items);
      setPages(d.pages);
    } catch (e) {
      setError(e.message);
    }
  }, [api, page, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const d = await api("/api/admin/media", { method: "POST", form });
      onSelect({ url: d.item.url, publicId: d.item.publicId, alt: d.item.alt || "" });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="adm-modal-back" onClick={onClose} role="dialog" aria-modal="true" aria-label="Choose an image">
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          <h2 className="h5 mb-0 me-auto">Choose an image</h2>
          <input className="form-control form-control-sm" style={{ maxWidth: 220 }} placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <label className={`btn btn-bf btn-sm mb-0 ${busy ? "disabled" : ""}`}>
            {busy ? "Uploading…" : "Upload new"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={upload} disabled={busy} />
          </label>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="row g-2">
          {items.map((m) => (
            <div className="col-4 col-md-3 col-lg-2" key={m._id}>
              <button type="button" className="adm-media-item w-100" onClick={() => onSelect({ url: m.url, publicId: m.publicId, alt: m.alt || "" })}>
                <img className="adm-thumb" src={cld(m.url, 240)} alt={m.alt || ""} loading="lazy" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-muted">No images yet. Upload one to get started.</p>}
        </div>
        {pages > 1 && (
          <div className="d-flex justify-content-center gap-2 mt-3">
            <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span className="small align-self-center">{page} / {pages}</span>
            <button className="btn btn-sm btn-outline-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
