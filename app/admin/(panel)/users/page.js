"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";

const NEW = { name: "", email: "", password: "", role: "author" };

export default function UsersPage() {
  const { api, user } = useAdmin();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(NEW);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try { setItems((await api("/api/admin/users")).items); } catch (e) { setMsg({ type: "danger", text: e.message }); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  async function create(e) {
    e.preventDefault(); setMsg(null);
    try { await api("/api/admin/users", { method: "POST", body: form }); setForm(NEW); setMsg({ type: "success", text: "User created." }); load(); }
    catch (err) { setMsg({ type: "danger", text: err.message }); }
  }
  async function patch(u, body, ok) {
    setMsg(null);
    try { await api(`/api/admin/users/${u._id}`, { method: "PATCH", body }); setMsg({ type: "success", text: ok }); load(); }
    catch (err) { setMsg({ type: "danger", text: err.message }); }
  }
  async function resetPw(u) {
    const pw = window.prompt(`New password for ${u.email} (12+ chars, upper, lower, number):`);
    if (pw) patch(u, { password: pw }, "Password reset.");
  }
  async function remove(u) {
    if (!window.confirm(`Delete ${u.email}?`)) return;
    try { await api(`/api/admin/users/${u._id}`, { method: "DELETE" }); load(); } catch (err) { setMsg({ type: "danger", text: err.message }); }
  }

  return (
    <>
      <h1 className="h3 mb-3">Users</h1>
      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="adm-card table-responsive">
            <table className="table align-middle mb-0">
              <thead><tr><th>Name</th><th>Role</th><th>Status</th><th /></tr></thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}<div className="small text-muted">{u.email}</div></td>
                    <td>
                      <select className="form-select form-select-sm" value={u.role} disabled={u._id === user.id} onChange={(e) => patch(u, { role: e.target.value }, "Role updated.")}>
                        <option value="admin">Admin</option><option value="editor">Editor</option><option value="author">Author</option>
                      </select>
                    </td>
                    <td>{u.active ? <span className="badge text-bg-success">Active</span> : <span className="badge text-bg-secondary">Deactivated</span>}{u.lockedUntil && new Date(u.lockedUntil) > new Date() && <span className="badge text-bg-warning ms-1">Locked</span>}</td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => resetPw(u)}>Reset password</button>
                      {u._id !== user.id && (<>
                        <button className="btn btn-sm btn-outline-warning me-1" onClick={() => patch(u, { active: !u.active }, u.active ? "User deactivated." : "User activated.")}>{u.active ? "Deactivate" : "Activate"}</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u)} aria-label="Delete"><i className="bi bi-trash" /></button>
                      </>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-4">
          <form className="adm-card" onSubmit={create}>
            <h2 className="h5">Add user</h2>
            <input className="form-control mb-2" placeholder="Name" required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="form-control mb-2" type="email" placeholder="Email" required maxLength={200} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="form-control mb-2" type="password" placeholder="Password (12+ chars)" required minLength={12} maxLength={128} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="form-select mb-3" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="author">Author (own posts only)</option><option value="editor">Editor (all posts and categories)</option><option value="admin">Admin (everything)</option>
            </select>
            <button className="btn btn-bf">Create user</button>
          </form>
        </div>
      </div>
    </>
  );
}
