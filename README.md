# Snip & Print

Free printable DIY crafts, templates, coloring pages and games. The site name, tagline, logo, footer text, hero and social links are all edited in **Admin → Settings** (the hero uses slide 1 of the "Home hero" list; wrap words in `*stars*` to highlight them). Brand defaults live in `lib/brand.js`.

Re-running `npm run seed` also replaces any site text still set to the old "BeautyFits" defaults (your own edits are kept). One Next.js 14 (App Router) app: public site plus an admin panel at `/admin`.

Stack: Next.js, Bootstrap 5, MongoDB (Mongoose), Cloudinary, TipTap, reCAPTCHA v3.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in every value.
   - `SESSION_SECRET`: 32+ random characters (`node -e "process.stdout.write(require('crypto').randomBytes(48).toString('hex'))"`).
   - `ADMIN_PASSWORD`: 12+ characters with upper case, lower case and a number. Used only by the seed script.
   - reCAPTCHA: create a **v3** key pair at https://www.google.com/recaptcha/admin and add your domain (and `localhost` for development).
3. Prove the plumbing:
   - `npm run check:db` writes, reads and deletes a test document in MongoDB.
   - `npm run check:cloudinary` uploads and deletes a test image.
4. `npm run seed` creates the admin user (hashed password), site settings, 8 categories and 8 starter posts. Safe to re-run. Use `npm run seed -- --reset-admin-password` to re-apply `ADMIN_PASSWORD` to an existing admin.
5. `npm run dev`, then sign in at `http://localhost:3000/admin/login`.

The app refuses to start if a required environment variable is missing.

## Roles

| Role | Can do |
| --- | --- |
| Admin | Everything, including Users and Settings |
| Editor | All posts, categories, tags, comments, media |
| Author | Own posts and own media only |

## Security notes

- Login order: per-IP rate limit, then reCAPTCHA (server-verified), then credentials. Accounts lock for 15 minutes after 5 failures.
- Every `/admin/*` page and `/api/admin/*` route is checked by middleware **and** again server-side in the layout / route handler. State-changing requests also need a matching Origin and CSRF token.
- Session cookie: `httpOnly`, `sameSite=strict`, `secure` in production, 8 hour lifetime.
- Rich text is sanitised on save and again on render.
- The CSP allows inline scripts (`'unsafe-inline'`) because Next.js injects inline bootstrap scripts. Moving to a nonce-based CSP is a possible hardening step.
- Rate limits are stored in MongoDB, so they work across serverless instances.

## Permalinks

Posts live at `/{slug}`. The slugs `admin`, `api`, `blog`, `category`, `about`, `contact`, `search`, `privacy`, `terms` and a few others are reserved.

## Ads

1. Put your network IDs in `.env.local` (see the "Ads" block in `.env.example`): AdSense, Ezoic and/or Media.net.
2. In **Admin → Settings → Ads** choose the active network, which placements to show (top, inside article, end of article, listings) and edit `ads.txt` (served at `/ads.txt`).
3. Override the network per category (**Admin → Categories**) or per post (post sidebar). Order of precedence: post, then category, then site default.

Ad code loads only after the page has finished loading and the slot is near the viewport. Each slot reserves a fixed minimum height (`.bf-ad` in `globals.css`) so nothing shifts. Nothing renders when a network or slot ID is missing. When an ad network is configured in `.env`, the CSP is widened to allow it (`img-src` and `frame-src` become `https:`).

## Redirects

Changing a post or category slug automatically creates a permanent redirect from the old URL. **Admin → Redirects** lets you add your own (single or multi-segment paths, or external `https://` targets). Permanent redirects are served as 308 and temporary ones as 307, which search engines treat like 301 and 302.

## Sitemap

`/sitemap.xml` is a sitemap index (like WordPress / Yoast) pointing to `/post-sitemap.xml`, `/category-sitemap.xml` and `/page-sitemap.xml` (posts split into `/post-sitemap2.xml`, … every 1000 URLs). They are generated from the database on every request, so a post you publish appears immediately; nothing to regenerate.

Included: live published posts (and scheduled posts once their date passes), categories that contain at least one live post, and the static pages. Each post lists its images with titles and alt text. `lastmod` comes from the real update dates.
Excluded: drafts, future-scheduled posts, posts marked noindex, posts whose canonical URL points elsewhere, and empty categories.

Submit `https://yourdomain/sitemap.xml` once in Google Search Console and Bing Webmaster Tools. `robots.txt` also advertises it.
