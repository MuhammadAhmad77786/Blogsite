"use client";
import { useState } from "react";

export default function CommentForm({ postId }) {
  const [state, setState] = useState({ status: "idle", message: "" });

  async function onSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ status: "sending", message: "" });
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          name: f.get("name"),
          email: f.get("email"),
          body: f.get("body"),
          website: f.get("website"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send your comment.");
      e.currentTarget.reset();
      setState({ status: "done", message: "Thanks! Your comment is awaiting moderation." });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  }

  return (
    <form onSubmit={onSubmit} className="row g-3">
      <div className="col-md-6">
        <label className="form-label" htmlFor="cf-name">Name</label>
        <input id="cf-name" name="name" className="form-control" required maxLength={80} autoComplete="name" />
      </div>
      <div className="col-md-6">
        <label className="form-label" htmlFor="cf-email">Email (not published)</label>
        <input id="cf-email" name="email" type="email" className="form-control" required maxLength={200} autoComplete="email" />
      </div>
      <div className="col-12">
        <label className="form-label" htmlFor="cf-body">Comment</label>
        <textarea id="cf-body" name="body" rows={4} className="form-control" required minLength={2} maxLength={2000} />
      </div>
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="col-12 d-flex align-items-center gap-3">
        <button className="btn btn-bf" disabled={state.status === "sending"}>
          {state.status === "sending" ? "Sending…" : "Post comment"}
        </button>
        {state.message && (
          <span className={state.status === "error" ? "text-danger" : "text-success"} role="status">{state.message}</span>
        )}
      </div>
    </form>
  );
}
