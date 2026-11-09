import Link from "next/link";
import { requireAdminPage } from "@/lib/session";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import "@/models/User";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireAdminPage();
  await connectDB();
  const own = user.role === "author" ? { author: user.id } : {};
  const staff = user.role !== "author";
  const [draft, published, recent, pendingCount, comments] = await Promise.all([
    Post.countDocuments({ ...own, status: "draft" }),
    Post.countDocuments({ ...own, status: "published" }),
    Post.find(own).sort({ updatedAt: -1 }).limit(6).select("title status updatedAt").lean(),
    staff ? Comment.countDocuments({ status: "pending" }) : 0,
    staff ? Comment.find().sort({ createdAt: -1 }).limit(6).populate("post", "title").lean() : [],
  ]);

  const stat = (label, value, icon) => (
    <div className="col-6 col-lg-3">
      <div className="adm-card d-flex align-items-center gap-3">
        <div className="bf-badge-icon mb-0"><i className={`bi ${icon}`} /></div>
        <div><div className="fs-3 fw-bold lh-1">{value}</div><div className="text-muted small">{label}</div></div>
      </div>
    </div>
  );

  return (
    <>
      <h1 className="h3 mb-4">Welcome back, {user.name}</h1>
      <div className="row g-3 mb-4">
        {stat("Published", published, "bi-check2-circle")}
        {stat("Drafts", draft, "bi-pencil-square")}
        {staff && stat("Comments pending", pendingCount, "bi-chat-dots")}
      </div>
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="adm-card">
            <div className="d-flex justify-content-between mb-2">
              <h2 className="h5 mb-0">Recent posts</h2>
              <Link href="/admin/posts/new" className="btn btn-bf btn-sm">New post</Link>
            </div>
            <ul className="list-group list-group-flush">
              {recent.map((p) => (
                <li key={String(p._id)} className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <Link href={`/admin/posts/${p._id}`} className="text-decoration-none">{p.title}</Link>
                  <span className="badge text-bg-light">{p.status}</span>
                </li>
              ))}
              {recent.length === 0 && <li className="list-group-item px-0 text-muted">No posts yet.</li>}
            </ul>
          </div>
        </div>
        {staff && (
          <div className="col-lg-6">
            <div className="adm-card">
              <h2 className="h5">Recent comments</h2>
              <ul className="list-group list-group-flush">
                {comments.map((c) => (
                  <li key={String(c._id)} className="list-group-item px-0">
                    <strong>{c.name}</strong> on <em>{c.post?.title || "deleted post"}</em>{" "}
                    <span className="badge text-bg-light">{c.status}</span>
                    <div className="text-muted small text-truncate">{c.body}</div>
                  </li>
                ))}
                {comments.length === 0 && <li className="list-group-item px-0 text-muted">No comments yet.</li>}
              </ul>
              <Link href="/admin/comments" className="small">Moderate comments</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
