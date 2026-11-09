"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import ImageField from "@/components/admin/ImageField";
import { makeSlug } from "@/lib/slug-client";

const EMPTY = {
  name: "", slug: "", description: "", icon: "bi-stars",
  image: { url: "", publicId: "", alt: "" }, parentCategory: "", order: 0, adNetwork: "default",
  showInFooter: false, showInNavbar: false, seo: { title: "", metaDescription: "" },
};

export default function CategoriesPage() {
  const { api, user } = useAdmin();
  const canEdit = user.role !== "author";
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [touched, setTouched] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try { setItems((await api("/api/admin/categories")).items); } catch (e) { setMsg({ type: "danger", text: e.message }); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function edit(c) {
    setEditId(c._id);
    setTouched(true);
    setForm({ ...EMPTY, ...c, parentCategory: c.parentCategory || "", image: { ...EMPTY.image, ...(c.image || {}) }, seo: { ...EMPTY.seo, ...(c.seo || {}) } });
  }
  function reset() { setEditId(null); setForm(EMPTY); setTouched(false); }

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    const body = { ...form, order: Number(form.order) || 0, parentCategory: form.parentCategory || null };
    delete body._id; delete body.createdAt; delete body.updatedAt; delete body.__v;
    try {
      if (editId) await api(`/api/admin/categories/${editId}`, { method: "PUT", body });
      else await api("/api/admin/categories", { method: "POST", body });
      setMsg({ type: "success", text: "Saved." });
      reset();
      load();
    } catch (err) { setMsg({ type: "danger", text: err.message }); }
  }

  async function remove(c) {
    if (!window.confirm(`Delete "${c.name}"? Posts will be kept but uncategorised.`)) return;
    try { await api(`/api/admin/categories/${c._id}`, { method: "DELETE" }); load(); } catch (err) { setMsg({ type: "danger", text: err.message }); }
  }

  return (
    <>
      <h1 className="h3 mb-3">Categories</h1>
      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <div className="row g-3">
        <div className="col-lg-7">
          <div className="adm-card table-responsive">
            <table className="table align-middle mb-0">
              <thead><tr><th>Name</th><th>Slug</th><th>Nav</th><th>Footer</th><th /></tr></thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id}>
                    <td><i className={`bi ${c.icon} me-2 text-danger`} />{c.name}</td>
                    <td className="text-muted small">{c.slug}</td>
                    <td>{c.showInNavbar ? <i className="bi bi-check2" /> : ""}</td>
                    <td>{c.showInFooter ? <i className="bi bi-check2" /> : ""}</td>
                    <td className="text-end text-nowrap">
                      {canEdit && <>
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => edit(c)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(c)}>Delete</button>
                      </>}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={5} className="text-muted text-center py-3">No categories yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        {canEdit && (
          <div className="col-lg-5">
            <form className="adm-card" onSubmit={save}>
              <h2 className="h5">{editId ? "Edit category" : "Add category"}</h2>
              <div className="mb-2"><label className="form-label small">Name</label>
                <input className="form-control" required maxLength={80} value={form.name} onChange={(e) => { set("name", e.target.value); if (!touched) set("slug", makeSlug(e.target.value)); }} /></div>
              <div className="mb-2"><label className="form-label small">Slug</label>
                <input className="form-control" maxLength={120} value={form.slug} onChange={(e) => { setTouched(true); set("slug", makeSlug(e.target.value)); }} /></div>
              <div className="mb-2"><label className="form-label small">Description</label>
                <textarea className="form-control" rows={2} maxLength={600} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
              <div className="row g-2 mb-2">
                <div className="col-6"><label className="form-label small">Icon (Bootstrap Icons)</label>
                  <input className="form-control" value={form.icon} pattern="bi-[a-z0-9-]+" onChange={(e) => set("icon", e.target.value)} /></div>
                <div className="col-6"><label className="form-label small">Order</label>
                  <input type="number" min={0} max={9999} className="form-control" value={form.order} onChange={(e) => set("order", e.target.value)} /></div>
              </div>
              <div className="mb-2"><label className="form-label small">Parent</label>
                <select className="form-select" value={form.parentCategory} onChange={(e) => set("parentCategory", e.target.value)}>
                  <option value="">None</option>
                  {items.filter((c) => c._id !== editId).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select></div>
              <div className="mb-2"><label className="form-label small">Ads in this category</label>
                <select className="form-select" value={form.adNetwork || "default"} onChange={(e) => set("adNetwork", e.target.value)}>
                  <option value="default">Use site default</option><option value="none">No ads</option>
                  <option value="adsense">Google AdSense</option><option value="ezoic">Ezoic</option><option value="medianet">Media.net</option>
                </select></div>
              <ImageField label="Image" value={form.image} onChange={(v) => set("image", v)} withAlt />
              <div className="form-check form-switch"><input className="form-check-input" type="checkbox" id="nav" checked={form.showInNavbar} onChange={(e) => set("showInNavbar", e.target.checked)} /><label className="form-check-label" htmlFor="nav">Show in navbar</label></div>
              <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" id="foot" checked={form.showInFooter} onChange={(e) => set("showInFooter", e.target.checked)} /><label className="form-check-label" htmlFor="foot">Show in footer</label></div>
              <h3 className="h6">SEO</h3>
              <input className="form-control mb-2" placeholder="SEO title" maxLength={120} value={form.seo.title} onChange={(e) => set("seo", { ...form.seo, title: e.target.value })} />
              <textarea className="form-control mb-3" rows={2} placeholder="Meta description" maxLength={320} value={form.seo.metaDescription} onChange={(e) => set("seo", { ...form.seo, metaDescription: e.target.value })} />
              <button className="btn btn-bf me-2">{editId ? "Update" : "Add"}</button>
              {editId && <button type="button" className="btn btn-outline-secondary" onClick={reset}>Cancel</button>}
            </form>
          </div>
        )}
      </div>
    </>
  );
}
