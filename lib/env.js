const REQUIRED = [
  "MONGODB_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "SESSION_SECRET",
  "CAPTCHA_SITE_KEY",
  "CAPTCHA_SECRET_KEY",
  "SITE_URL",
];

export function validateEnv() {
  const missing = REQUIRED.filter((k) => !String(process.env[k] || "").trim());
  if (missing.length) {
    throw new Error(
      "Missing required environment variables: " + missing.join(", ") + ". See .env.example."
    );
  }
  if (!/^mongodb(\+srv)?:\/\/[^/]+\/[^/?\s]+/.test(process.env.MONGODB_URI)) {
    throw new Error(
      "MONGODB_URI has no database name. Add one after the host, e.g. ...mongodb.net/snipandprint?retryWrites=true"
    );
  }
  if (process.env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters.");
  }
}

export function requireEnv(name) {
  const v = String(process.env[name] || "").trim();
  if (!v) throw new Error("Missing required environment variable: " + name);
  return v;
}

export function siteUrl() {
  return String(process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}
