"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";

export default function RedirectsPage() {
  const { api } = useAdmin();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ from: "", to: "", permanent: true });
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try { setItems((await api("/api/admin/redirects")).items); } catch (e) { setMsg({ type: "danger", text: e.message }); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  async function add(e) {
    e.preventDefault(); setMsg(null);
    try {
      await api("/api/admin/redirects", { method: "POST", body: form });
      setForm({ from: "", to: "", permanent: true });
      setMsg({ type: "success", text: "Redirect saved." });
      load();
    } catch (err) { setMsg({ type: "danger", text: err.message }); }
  }
  async function remove(r) {
    if (!window.confirm(`Remove redirect from ${r.from}?`)) return;
    try { await api(`/api/admin/redirects/${r._id}`, { method: "DELETE" }); load(); } catch (err) { setMsg({ type: "danger", text: err.message }); }
  }

  return (
    <>
      <h1 className="h3 mb-1">Redirects</h1>
      <p className="text-muted">When you change a post or category slug, a permanent redirect from the old URL is created automatically. You can also add your own.</p>
      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <form className="adm-card mb-3" onSubmit={add}>
        <div className="row g-2 align-items-end">
          <div className="col-md-4"><label className="form-label small">Old URL (path)</label>
            <input className="form-control" placeholder="/old-post" required maxLength={300} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></div>
          <div className="col-md-4"><label className="form-label small">New URL (path or https://…)</label>
            <input className="form-control" placeholder="/new-post" required maxLength={600} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div>
          <div className="col-md-2"><label className="form-label small">Type</label>
            <select className="form-select" value={form.permanent ? "301" : "302"} onChange={(e) => setForm({ ...form, permanent: e.target.value === "301" })}>
              <option value="301">Permanent (301)</option><option value="302">Temporary (302)</option>
            </select></div>
          <div className="col-md-2"><button className="btn btn-bf w-100">Add</button></div>
        </div>
      </form>
      <div className="adm-card table-responsive">
        <table className="table align-middle mb-0">
          <thead><tr><th>From</th><th>To</th><th>Type</th><th>Source</th><th /></tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id}>
                <td className="font-monospace small">{r.from}</td>
                <td className="font-monospace small text-break">{r.to}</td>
                <td>{r.permanent ? "301" : "302"}</td>
                <td><span className={`badge text-bg-${r.auto ? "info" : "secondary"}`}>{r.auto ? "Automatic" : "Manual"}</span></td>
                <td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={() => remove(r)} aria-label="Remove"><i className="bi bi-trash" /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-3">No redirects yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
