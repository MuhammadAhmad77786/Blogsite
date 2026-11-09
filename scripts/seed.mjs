// Creates the first admin (from .env.local) and default site settings.
// Categories and articles are created manually in /admin.
// Safe to run repeatedly: existing records are left untouched.
// Usage: npm run seed            (admin + settings only)
//        npm run seed -- --reset-admin-password   (re-hash ADMIN_PASSWORD onto the existing admin)
import mongoose from "mongoose";
import { applyMongoDns } from "../lib/dns.mjs";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import SiteSettings from "../models/SiteSettings.js";
import { DEFAULT_FOOTER_BLURB, DEFAULT_SEO_DESCRIPTION, DEFAULT_SEO_TITLE, DEFAULT_SITE_TITLE, DEFAULT_TAGLINE } from "../lib/brand.js";

const out = (m) => process.stdout.write(m + "\n");
const fail = (m) => {
  process.stderr.write(m + "\n");
  process.exit(1);
};

try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local: fall back to variables already in the environment
}

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI) fail("MONGODB_URI is missing in .env.local");
if (!/^mongodb(\+srv)?:\/\/[^/]+\/[^/?\s]+/.test(MONGODB_URI)) {
  fail("MONGODB_URI has no database name. Add one after the host, e.g. ...mongodb.net/?retryWrites=true");
}
if (!ADMIN_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL)) fail("ADMIN_EMAIL is missing or invalid in .env.local");
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12 || !/[a-z]/.test(ADMIN_PASSWORD) || !/[A-Z]/.test(ADMIN_PASSWORD) || !/\d/.test(ADMIN_PASSWORD)) {
  fail("ADMIN_PASSWORD must be 12+ characters with upper case, lower case and a number.");
}

const args = process.argv.slice(2);
const resetPw = args.includes("--reset-admin-password");

try {
  applyMongoDns();
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  // --- Admin user ---
  const email = ADMIN_EMAIL.trim().toLowerCase();
  let admin = await User.findOne({ email }).select("+passwordHash");
  if (!admin) {
    admin = await User.create({
      name: `${DEFAULT_SITE_TITLE} Team`,
      email,
      role: "admin",
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
      bio: `The game-lovers behind ${DEFAULT_SITE_TITLE}.`,
    });
    out(`Created admin user: ${email}`);
  } else if (resetPw || !admin.passwordHash) {
    admin.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    admin.role = "admin";
    admin.active = true;
    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    await admin.save();
    out(`Reset password for existing admin: ${email}`);
  } else {
    out(`Admin ${email} already exists (password unchanged).`);
  }

  // --- Settings ---
  await SiteSettings.updateOne({ singleton: "main" }, { $setOnInsert: { singleton: "main" } }, { upsert: true });
  // Rebrand: replace any text that is still the old built-in default. Values you edited in the admin are kept.
  const OLD = "BeautyFits";
  const s = await SiteSettings.findOne({ singleton: "main" });
  const swaps = [
    ["siteTitle", DEFAULT_SITE_TITLE],
    ["tagline", DEFAULT_TAGLINE],
    ["footerBlurb", DEFAULT_FOOTER_BLURB],
    ["seoDefaults.title", DEFAULT_SEO_TITLE],
    ["seoDefaults.metaDescription", DEFAULT_SEO_DESCRIPTION],
  ];
  const oldDefaults = {
    tagline: "Women's fashion, nails, hairstyles & outfit trends",
    "seoDefaults.metaDescription": "Fresh women's fashion ideas, nail art designs, hairstyle inspiration and outfit trends you can try today.",
  };
  let changed = 0;
  for (const [path, value] of swaps) {
    const cur = s.get(path);
    if (!cur || String(cur).includes(OLD) || cur === oldDefaults[path]) {
      s.set(path, value);
      changed++;
    }
  }
  if (changed) {
    await s.save();
    out(`Updated ${changed} default site text field(s) to the new brand.`);
  }
  out("Site settings ready.");

  out("Seed complete.");
  await mongoose.disconnect();
} catch (e) {
  fail(`Seed failed: ${e.message}`);
}
