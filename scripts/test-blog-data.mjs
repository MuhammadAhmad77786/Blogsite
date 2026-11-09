// Creates (or removes) sample categories + posts for testing the blog.
// Everything it creates is marked so it can be removed cleanly:
//   posts      -> tag "test-data"
//   categories -> description ends with " (test)" is NOT used; we track by slug list below
//   images     -> Cloudinary folder "noboringgames/test-data"
// Usage: node scripts/test-blog-data.mjs          (create)
//        node scripts/test-blog-data.mjs --remove (delete everything it created)
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { applyMongoDns } from "../lib/dns.mjs";
import Post from "../models/Post.js";
import Category from "../models/Category.js";

try { process.loadEnvFile(".env.local"); } catch {}
const out = (m) => process.stdout.write(m + "\n");
const FOLDER = "noboringgames/test-data";
const TAG = "test-data";

const CATS = [
  ["Kids Games", "kids-games", "bi-emoji-smile", "Party games, classroom fun and birthday hits for little ones."],
  ["Party Games", "party-games", "bi-balloon", "Big-group games that get everyone laughing."],
  ["Family Games", "family-games", "bi-house-heart", "Games every age can play together at home."],
  ["Adult Games", "adult-games", "bi-cup-straw", "Get-together games for grown-up gatherings."],
  ["Couples Games", "couples-games", "bi-heart", "Date-night games for two."],
  ["Games for Friends", "games-for-friends", "bi-people", "Hangout games for your favorite people."],
];

// [title, categories, tags, players, age, time, bg, accent, views, daysAgo]
const POSTS = [
  ["Pumpkin Dice Game: Roll, Draw and Giggle", ["kids-games", "party-games"], ["halloween", "quick"], "2–6", "4+", "15 min", "#fde5d4", "#f26a21", 420, 1],
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, max = 22) {
  const lines = [];
  let line = "";
  for (const w of text.split(" ")) {
    if ((line + " " + w).trim().length > max) { lines.push(line.trim()); line = w; } else line += " " + w;
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 4);
}

function coverSvg(title, bg, accent) {
  const lines = wrap(title.split(":")[0]);
  const y0 = 470 - (lines.length - 1) * 42;
  const text = lines.map((l, i) => `<text x="600" y="${y0 + i * 84}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="72" fill="#1f2430">${esc(l)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
<rect width="1200" height="900" fill="${bg}"/>
<circle cx="110" cy="120" r="60" fill="${accent}" opacity=".25"/><circle cx="1090" cy="790" r="90" fill="${accent}" opacity=".2"/>
<rect x="960" y="70" width="150" height="150" rx="28" fill="${accent}" transform="rotate(12 1035 145)"/>
<circle cx="1000" cy="110" r="14" fill="#fff"/><circle cx="1035" cy="145" r="14" fill="#fff"/><circle cx="1070" cy="180" r="14" fill="#fff"/>
<rect x="80" y="690" width="120" height="120" rx="22" fill="#fff" stroke="#1f2430" stroke-width="5" transform="rotate(-10 140 750)"/>
<circle cx="140" cy="750" r="13" fill="#1f2430"/>
<rect x="250" y="250" width="700" height="8" fill="${accent}"/>
${text}
<text x="600" y="${y0 + lines.length * 84 + 30}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="34" fill="${accent}">NO BORING GAMES</text>
</svg>`;
}

function content(title, players, age, time) {
  const name = title.split(":")[0];
  return `<p>${esc(name)} is one of those games that needs almost nothing to set up but keeps everyone playing round after round. Here is everything you need to get started in a few minutes.</p>
<h2>What you need</h2>
<ul><li>A flat space to play</li><li>Paper and a pen for keeping score</li><li>A timer (a phone works)</li><li>Optional: small prizes for the winners</li></ul>
<h2>How to play</h2>
<ol><li><strong>Set up.</strong> Split players into teams or play individually, and explain the goal in one sentence.</li><li><strong>Take turns.</strong> Each player or team has 60 seconds to complete the challenge.</li><li><strong>Score it.</strong> Give one point for every success and write it down.</li><li><strong>Play three rounds.</strong> The highest total after three rounds wins.</li></ol>
<blockquote><p><strong>Tip:</strong> For younger kids, skip the timer and let everyone finish. The giggles are the point.</p></blockquote>
<h2>At a glance</h2>
<table><thead><tr><th>Players</th><th>Ages</th><th>Time</th></tr></thead><tbody><tr><td>${players}</td><td>${age}</td><td>${time}</td></tr></tbody></table>
<h3>Variations</h3>
<ul><li><strong>Harder:</strong> cut the timer to 30 seconds.</li><li><strong>Bigger groups:</strong> play as a relay with teams of four.</li><li><strong>Themed:</strong> use holiday props for Halloween or Christmas.</li></ul>
<p>Have a favorite twist on this game? Leave a comment and tell us how your group plays it.</p>`;
}

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

applyMongoDns();
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

if (process.argv.includes("--remove")) {
  const posts = await Post.find({ tags: TAG }).lean();
  for (const p of posts) if (p.featuredImage?.publicId) await cloudinary.uploader.destroy(p.featuredImage.publicId, { invalidate: true }).catch(() => {});
  const r1 = await Post.deleteMany({ tags: TAG });
  const r2 = await Category.deleteMany({ slug: { $in: CATS.map((c) => c[1]) } });
  await mongoose.connection.collection("comments").deleteMany({ post: { $in: posts.map((p) => p._id) } });
  out(`Removed ${r1.deletedCount} posts, ${r2.deletedCount} categories and their images.`);
  await mongoose.disconnect();
  process.exit(0);
}

const author = await mongoose.connection.collection("users").findOne({ role: "admin" });
if (!author) throw new Error("No admin user found. Run npm run seed first.");

const catIds = {};
for (const [i, [name, slug, icon, description]] of CATS.entries()) {
  const c = await Category.findOneAndUpdate(
    { slug },
    { $setOnInsert: { name, slug, icon, description, order: i, showInNavbar: i < 4, showInFooter: true } },
    { upsert: true, returnDocument: "after" }
  );
  catIds[slug] = c._id;
}
out(`Categories ready: ${Object.keys(catIds).length}`);

let made = 0;
for (const [title, cats, tags, players, age, time, bg, accent, views, daysAgo] of POSTS) {
  const slug = slugify(title);
  if (await Post.exists({ slug })) { out(`skip (exists): ${slug}`); continue; }
  const svg = coverSvg(title, bg, accent);
  const up = await cloudinary.uploader.upload(`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, { folder: FOLDER, format: "png" });
  await Post.create({
    title,
    slug,
    excerpt: `${title.split(":")[0]}: simple rules, quick setup and big laughs for ${players} players, ages ${age}.`,
    content: content(title, players, age, time),
    featuredImage: { url: up.secure_url, publicId: up.public_id, alt: title },
    categories: cats.map((s) => catIds[s]),
    tags: [...tags, TAG],
    author: author._id,
    status: "published",
    publishedAt: new Date(Date.now() - daysAgo * 86400000),
    views,
  });
  made++;
  out(`created: ${slug}`);
}
out(`Done. Created ${made} posts.`);
await mongoose.disconnect();
