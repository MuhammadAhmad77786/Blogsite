"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";

export default function CommentsPage() {
  const { api } = useAdmin();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("pending");
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try { setItems((await api(`/api/admin/comments?status=${status}`)).items); } catch (e) { setMsg({ type: "danger", text: e.message }); }
  }, [api, status]);
  useEffect(() => { load(); }, [load]);

  async function act(c, kind) {
    try {
      if (kind === "delete") {
        if (!window.confirm("Delete this comment?")) return;
        await api(`/api/admin/comments/${c._id}`, { method: "DELETE" });
      } else {
        await api(`/api/admin/comments/${c._id}`, { method: "PATCH", body: { status: kind } });
      }
      load();
    } catch (e) { setMsg({ type: "danger", text: e.message }); }
  }

  return (
    <>
      <div className="d-flex align-items-center mb-3">
        <h1 className="h3 me-auto mb-0">Comments</h1>
        <div className="btn-group">
          {["pending", "approved", "all"].map((s) => (
            <button key={s} className={`btn btn-sm ${status === s ? "btn-dark" : "btn-outline-secondary"}`} onClick={() => setStatus(s)}>{s[0].toUpperCase() + s.slice(1)}</button>
          ))}
        </div>
      </div>
      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}
      <div className="d-grid gap-2">
        {items.map((c) => (
          <div className="adm-card" key={c._id}>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <strong>{c.name}</strong><span className="text-muted small">{c.email}</span>
              <span className="text-muted small">on <em>{c.post?.title || "deleted post"}</em></span>
              <span className={`badge ms-auto text-bg-${c.status === "approved" ? "success" : "warning"}`}>{c.status}</span>
            </div>
            <p className="my-2" style={{ whiteSpace: "pre-wrap" }}>{c.body}</p>
            <div className="d-flex gap-2">
              {c.status !== "approved" && <button className="btn btn-sm btn-success" onClick={() => act(c, "approved")}>Approve</button>}
              {c.status === "approved" && <button className="btn btn-sm btn-outline-secondary" onClick={() => act(c, "pending")}>Unapprove</button>}
              <button className="btn btn-sm btn-outline-danger" onClick={() => act(c, "delete")}>{c.status === "pending" ? "Reject & delete" : "Delete"}</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-muted">Nothing here.</p>}
      </div>
    </>
  );
}
