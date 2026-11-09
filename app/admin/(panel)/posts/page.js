"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";

const BADGE = { published: "success", draft: "secondary", scheduled: "info" };

export default function PostsPage() {
  const { api } = useAdmin();
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try {
      const sp = new URLSearchParams({ page: String(page), q, status, category });
      setData(await api(`/api/admin/posts?${sp}`));
      setSel([]);
    } catch (e) {
      setMsg({ type: "danger", text: e.message });
    }
  }, [api, page, q, status, category]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    api("/api/admin/categories").then((d) => setCats(d.items)).catch(() => {});
  }, [api]);

  async function bulk(action) {
    if (!sel.length) return;
    if (action === "delete" && !window.confirm(`Delete ${sel.length} post(s) permanently?`)) return;
    try {
      const d = await api("/api/admin/posts/bulk", { method: "POST", body: { ids: sel, action } });
      setMsg({ type: "success", text: `${d.affected} post(s) updated.` });
      load();
    } catch (e) {
      setMsg({ type: "danger", text: e.message });
    }
  }

  const allSelected = data.items.length > 0 && sel.length === data.items.length;

  return (
    <>
      <div className="d-flex align-items-center mb-3">
        <h1 className="h3 me-auto mb-0">Posts <span className="text-muted fs-6">({data.total})</span></h1>
        <Link href="/admin/posts/new" className="btn btn-bf">New post</Link>
      </div>
      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <div className="adm-card">
        <div className="row g-2 mb-3">
          <div className="col-md-4"><input className="form-control" placeholder="Search title…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
          <div className="col-md-3">
            <select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All categories</option>
              {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value="" disabled={!sel.length} onChange={(e) => e.target.value && bulk(e.target.value)} aria-label="Bulk actions">
              <option value="">Bulk…</option><option value="publish">Publish</option><option value="draft">Move to draft</option><option value="delete">Delete</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead><tr>
              <th style={{ width: 32 }}><input type="checkbox" className="form-check-input" checked={allSelected} onChange={(e) => setSel(e.target.checked ? data.items.map((i) => i._id) : [])} aria-label="Select all" /></th>
              <th>Title</th><th>Author</th><th>Categories</th><th>Status</th><th>Updated</th>
            </tr></thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p._id}>
                  <td><input type="checkbox" className="form-check-input" checked={sel.includes(p._id)} onChange={(e) => setSel(e.target.checked ? [...sel, p._id] : sel.filter((x) => x !== p._id))} aria-label={`Select ${p.title}`} /></td>
                  <td><Link href={`/admin/posts/${p._id}`} className="fw-semibold text-decoration-none">{p.title}</Link><div className="small text-muted">/{p.slug}</div></td>
                  <td>{p.author?.name}</td>
                  <td className="small">{(p.categories || []).map((c) => c.name).join(", ")}</td>
                  <td><span className={`badge text-bg-${BADGE[p.status]}`}>{p.status}</span></td>
                  <td className="small text-muted">{new Date(p.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data.items.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">No posts found.</td></tr>}
            </tbody>
          </table>
        </div>
        {data.pages > 1 && (
          <div className="d-flex justify-content-center gap-2">
            <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span className="small align-self-center">{page} / {data.pages}</span>
            <button className="btn btn-sm btn-outline-secondary" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </>
  );
}
