"use client";
import { useEffect, useState } from "react";

export default function LoginForm({ siteKey }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!siteKey) return;
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    s.async = true;
    s.onload = () => window.grecaptcha.ready(() => setReady(true));
    document.head.appendChild(s);
    return () => {
      s.remove();
      document.querySelectorAll(".grecaptcha-badge").forEach((b) => b.parentElement?.remove());
    };
  }, [siteKey]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      if (!siteKey || !window.grecaptcha) throw new Error("CAPTCHA is not available. Please reload the page.");
      const captchaToken = await window.grecaptcha.execute(siteKey, { action: "admin_login" });
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: f.get("email"), password: f.get("password"), captchaToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Sign in failed.");
      window.location.href = "/admin";
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input id="email" name="email" type="email" className="form-control" required autoComplete="username" maxLength={200} />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">Password</label>
        <input id="password" name="password" type="password" className="form-control" required autoComplete="current-password" maxLength={128} />
      </div>
      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
      <button className="btn btn-bf w-100" disabled={busy || !ready}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-muted small mt-3 mb-0">
        Protected by reCAPTCHA. Google&apos;s{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and{" "}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms</a> apply.
      </p>
    </form>
  );
}
