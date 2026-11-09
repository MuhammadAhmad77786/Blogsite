import { requireEnv } from "./env";

/** Verifies a reCAPTCHA v3 token server-side. Fails closed on any problem. */
export async function verifyCaptcha(token, ip) {
  if (typeof token !== "string" || token.length < 20 || token.length > 4096) return false;
  try {
    const body = new URLSearchParams({ secret: requireEnv("CAPTCHA_SECRET_KEY"), response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success === true && data.action === "admin_login" && (data.score ?? 0) >= 0.5;
  } catch {
    return false;
  }
}
