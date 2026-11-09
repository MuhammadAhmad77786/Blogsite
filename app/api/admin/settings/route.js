import { connectDB } from "@/lib/db";
import { revalidateSite } from "@/lib/revalidate";
import { adminRoute, ADMIN } from "@/lib/guard";
import { json, parse, plain, readJson } from "@/lib/http";
import { settingsSchema } from "@/lib/schemas";
import { stripTags } from "@/lib/sanitize";
import { configuredNetworks } from "@/lib/ads";
import SiteSettings from "@/models/SiteSettings";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => {
  await connectDB();
  const s = await SiteSettings.findOneAndUpdate(
    { singleton: "main" },
    { $setOnInsert: { singleton: "main" } },
    { upsert: true, returnDocument: "after" }
  ).lean();
  return json({ settings: plain(s), adsEnv: configuredNetworks() });
}, { roles: ADMIN });

export const PUT = adminRoute(async (req) => {
  await connectDB();
  const d = parse(settingsSchema, await readJson(req));
  const img = (i) => ({ url: i.url, publicId: stripTags(i.publicId) });
  const links = Object.fromEntries(Object.entries(d.socialLinks).map(([k, v]) => [k, v]));
  await SiteSettings.findOneAndUpdate(
    { singleton: "main" },
    {
      $set: {
        siteTitle: stripTags(d.siteTitle),
        tagline: stripTags(d.tagline),
        logo: img(d.logo),
        favicon: img(d.favicon),
        heroImage: img(d.heroImage),
        bannerImage: img(d.bannerImage),
        heroSlides: d.heroSlides.map((s) => ({
          image: img(s.image),
          eyebrow: stripTags(s.eyebrow),
          title: stripTags(s.title),
          text: stripTags(s.text),
          linkLabel: stripTags(s.linkLabel),
          linkHref: s.linkHref,
        })),
        defaultOgImage: img(d.defaultOgImage),
        contactEmail: d.contactEmail,
        socialLinks: links,
        footerBlurb: stripTags(d.footerBlurb),
        seoDefaults: { title: stripTags(d.seoDefaults.title), metaDescription: stripTags(d.seoDefaults.metaDescription) },
        analytics: d.analytics,
        ads: { network: d.ads.network, placements: d.ads.placements, adsTxt: d.ads.adsTxt.split("\r").join("").slice(0, 5000) },
        commentsEnabled: d.commentsEnabled,
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  revalidateSite();
  return json({ ok: true });
}, { roles: ADMIN });
