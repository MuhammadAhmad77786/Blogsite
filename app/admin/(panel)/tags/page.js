"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";

export default function TagsPage() {
  const { api } = useAdmin();
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try { setItems((await api("/api/admin/tags")).items); } catch (e) { setMsg({ type: "danger", text: e.message }); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    try {
      if (editId) await api(`/api/admin/tags/${editId}`, { method: "PUT", body: { name } });
      else await api("/api/admin/tags", { method: "POST", body: { name } });
      setName(""); setEditId(null); load();
    } catch (err) { setMsg({ type: "danger", text: err.message }); }
  }
  async function remove(t) {
    if (!window.confirm(`Delete tag "${t.name}" from all posts?`)) return;
    try { await api(`/api/admin/tags/${t._id}`, { method: "DELETE" }); load(); } catch (err) { setMsg({ type: "danger", text: err.message }); }
  }

  return (
    <>
      <h1 className="h3 mb-3">Tags</h1>
      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <form className="adm-card mb-3 d-flex gap-2" onSubmit={save}>
        <input className="form-control" placeholder="Tag name" required maxLength={50} value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-bf">{editId ? "Update" : "Add"}</button>
        {editId && <button type="button" className="btn btn-outline-secondary" onClick={() => { setEditId(null); setName(""); }}>Cancel</button>}
      </form>
      <div className="adm-card table-responsive">
        <table className="table align-middle mb-0">
          <thead><tr><th>Name</th><th>Slug</th><th /></tr></thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id}>
                <td>{t.name}</td><td className="text-muted small">{t.slug}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => { setEditId(t._id); setName(t.name); }}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(t)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={3} className="text-muted text-center py-3">No tags yet. Tags are also created automatically when you add them to a post.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
