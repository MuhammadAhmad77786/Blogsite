"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "./AdminContext";
import RichEditor from "./RichEditor";
import ImageField from "./ImageField";
import SeoPanel from "./SeoPanel";
import { makeSlug } from "@/lib/slug-client";

const EMPTY = {
  title: "", slug: "", excerpt: "", content: "",
  featuredImage: { url: "", publicId: "", alt: "" },
  categories: [], tags: [], author: "", status: "draft", adNetwork: "default", publishedAt: "",
  seo: { title: "", metaDescription: "", focusKeyword: "", canonicalUrl: "", ogImage: "", noindex: false },
};

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export default function PostEditor({ postId = null, siteName = "" }) {
  const { api, user, siteUrl } = useAdmin();
  const router = useRouter();
  const [post, setPost] = useState(EMPTY);
  const [cats, setCats] = useState([]);
  const [users, setUsers] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const isStaff = user.role !== "author";

  useEffect(() => {
    (async () => {
      try {
        const [c, u] = await Promise.all([
          api("/api/admin/categories"),
          isStaff ? api("/api/admin/users") : Promise.resolve({ items: [] }),
        ]);
        setCats(c.items);
        setUsers(u.items);
        if (postId) {
          const { post: p } = await api(`/api/admin/posts/${postId}`);
          setPost({
            ...EMPTY, ...p,
            featuredImage: { ...EMPTY.featuredImage, ...(p.featuredImage || {}) },
            seo: { ...EMPTY.seo, ...(p.seo || {}) },
            categories: (p.categories || []).map(String),
            author: String(p.author || ""),
            publishedAt: toLocalInput(p.publishedAt),
          });
          setSlugTouched(true);
        }
      } catch (e) {
        setMsg({ type: "danger", text: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [api, postId, isStaff]);

  const set = (k, v) => setPost((p) => ({ ...p, [k]: v }));
  const permalink = useMemo(() => `${siteUrl}/${post.slug || makeSlug(post.title) || "post-slug"}`, [siteUrl, post.slug, post.title]);

  function addTags(raw) {
    const list = raw.split(",").map((t) => t.trim()).filter(Boolean);
    if (!list.length) return;
    set("tags", [...new Set([...post.tags, ...list])].slice(0, 20));
    setTagInput("");
  }

  async function save(statusOverride) {
    setSaving(true);
    setMsg(null);
    try {
      const status = statusOverride || post.status;
      const body = {
        title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
        featuredImage: post.featuredImage, categories: post.categories, tags: post.tags,
        status, seo: post.seo, adNetwork: post.adNetwork || "default",
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
      };
      if (isStaff && post.author) body.author = post.author;
      if (postId) {
        const d = await api(`/api/admin/posts/${postId}`, { method: "PUT", body });
        setPost((p) => ({ ...p, slug: d.slug, status }));
        setMsg({ type: "success", text: "Saved." });
      } else {
        const d = await api("/api/admin/posts", { method: "POST", body });
        router.replace(`/admin/posts/${d.id}`);
      }
    } catch (e) {
      setMsg({ type: "danger", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await api(`/api/admin/posts/${postId}`, { method: "DELETE" });
      router.replace("/admin/posts");
    } catch (e) {
      setMsg({ type: "danger", text: e.message });
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className="row g-3">
      <div className="col-xl-8">
        <div className="d-flex align-items-center mb-3">
          <h1 className="h3 me-auto mb-0">{postId ? "Edit post" : "New post"}</h1>
          {post.status === "published" && post.slug && (
            <a href={`/${post.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-sm">View</a>
          )}
        </div>
        {msg && <div className={`alert alert-${msg.type} py-2`} role="status">{msg.text}</div>}

        <div className="adm-card mb-3">
          <input
            className="form-control form-control-lg mb-2"
            placeholder="Post title"
            maxLength={200}
            value={post.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", makeSlug(e.target.value));
            }}
          />
          <div className="input-group input-group-sm mb-3">
            <span className="input-group-text">Slug</span>
            <input className="form-control" maxLength={120} value={post.slug} onChange={(e) => { setSlugTouched(true); set("slug", makeSlug(e.target.value)); }} />
          </div>
          <div className="small text-muted mb-3">Permalink: <a href={permalink} onClick={(e) => e.preventDefault()}>{permalink}</a></div>
          <RichEditor value={post.content} onChange={(html) => set("content", html)} />
        </div>

        <div className="adm-card mb-3">
          <label className="form-label fw-semibold">Excerpt</label>
          <textarea className="form-control" rows={3} maxLength={600} value={post.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          <div className="form-text">Shown on cards and used as the meta description fallback.</div>
        </div>

        <SeoPanel
          seo={post.seo}
          onChange={(v) => set("seo", v)}
          title={post.title}
          slug={post.slug}
          content={post.content}
          excerpt={post.excerpt}
          featuredAlt={post.featuredImage?.alt}
          siteUrl={siteUrl}
          siteName={siteName}
        />
      </div>

      <div className="col-xl-4">
        <div className="adm-card mb-3">
          <h2 className="h6">Publish</h2>
          <label className="form-label small mb-1">Status</label>
          <select className="form-select mb-2" value={post.status} onChange={(e) => set("status", e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          {post.status === "published" && (
            <div className="small text-muted mb-2">
              <i className="bi bi-calendar-check me-1" />
              {post.publishedAt
                ? `Published on ${new Date(post.publishedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
                : `Publish date: today, ${new Date().toLocaleDateString([], { dateStyle: "medium" })} (set automatically)`}
            </div>
          )}
          <label className="form-label small mb-1">Ads on this post</label>
          <select className="form-select mb-2" value={post.adNetwork || "default"} onChange={(e) => set("adNetwork", e.target.value)}>
            <option value="default">Use category / site default</option><option value="none">No ads</option>
            <option value="adsense">Google AdSense</option><option value="ezoic">Ezoic</option><option value="medianet">Media.net</option>
          </select>
          {isStaff && (
            <>
              <label className="form-label small mb-1">Author</label>
              <select className="form-select mb-2" value={post.author} onChange={(e) => set("author", e.target.value)}>
                <option value="">Me</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </>
          )}
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-bf flex-grow-1" disabled={saving || !post.title.trim()} onClick={() => save()}>
              {saving ? "Saving…" : postId ? "Update" : "Save"}
            </button>
            {post.status !== "published" && (
              <button className="btn btn-outline-success" disabled={saving || !post.title.trim()} onClick={() => save("published")}>Publish</button>
            )}
          </div>
          {postId && <button className="btn btn-link text-danger btn-sm mt-2 p-0" onClick={remove}>Delete post</button>}
        </div>

        <div className="adm-card mb-3">
          <ImageField label="Featured image" value={post.featuredImage} onChange={(v) => set("featuredImage", v)} withAlt />
        </div>

        <div className="adm-card mb-3">
          <h2 className="h6">Categories</h2>
          <div style={{ maxHeight: 220, overflow: "auto" }}>
            {cats.map((c) => (
              <div className="form-check" key={c._id}>
                <input className="form-check-input" type="checkbox" id={`c-${c._id}`} checked={post.categories.includes(c._id)}
                  onChange={(e) => set("categories", e.target.checked ? [...post.categories, c._id] : post.categories.filter((x) => x !== c._id))} />
                <label className="form-check-label" htmlFor={`c-${c._id}`}>{c.name}</label>
              </div>
            ))}
            {cats.length === 0 && <div className="text-muted small">No categories yet.</div>}
          </div>
        </div>

        <div className="adm-card">
          <h2 className="h6">Tags</h2>
          <div className="d-flex flex-wrap gap-1 mb-2">
            {post.tags.map((t) => (
              <span key={t} className="badge text-bg-light border">
                {t} <button type="button" className="btn-close btn-close-sm ms-1" style={{ fontSize: 8 }} aria-label={`Remove ${t}`} onClick={() => set("tags", post.tags.filter((x) => x !== t))} />
              </span>
            ))}
          </div>
          <input
            className="form-control form-control-sm"
            placeholder="Type a tag, press Enter"
            maxLength={40}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTags(tagInput); } }}
            onBlur={() => addTags(tagInput)}
          />
        </div>
      </div>
    </div>
  );
}
