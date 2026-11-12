import { z } from "zod";

export const oid = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const httpsUrlOrEmpty = z
  .string()
  .max(600)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "Must be an https:// URL");

export const imageSchema = z.object({
  url: httpsUrlOrEmpty.default(""),
  publicId: z.string().max(300).default(""),
  alt: z.string().max(300).default(""),
});

const emptyImage = { url: "", publicId: "", alt: "" };

export const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date");

const adNetwork = z.enum(["default", "none", "adsense", "ezoic", "medianet"]).default("default");

export const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z.string().trim().max(120).default(""),
  excerpt: z.string().max(600).default(""),
  content: z.string().max(400000).default(""),
  featuredImage: imageSchema.default(emptyImage),
  gallery: z.array(imageSchema).max(30).default([]),
  categories: z.array(oid).max(20).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  author: oid.optional(),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  adNetwork,
  publishedAt: isoDate.nullable().optional(),
  seo: z
    .object({
      title: z.string().max(120).default(""),
      metaDescription: z.string().max(320).default(""),
      focusKeyword: z.string().max(80).default(""),
      canonicalUrl: httpsUrlOrEmpty.default(""),
      ogImage: httpsUrlOrEmpty.default(""),
      noindex: z.boolean().default(false),
    })
    .default({ title: "", metaDescription: "", focusKeyword: "", canonicalUrl: "", ogImage: "", noindex: false }),
});

export const redirectSchema = z.object({
  from: z
    .string()
    .trim()
    .min(1, "Old URL is required")
    .max(300)
    .refine((v) => /^\/[A-Za-z0-9\-_/.%]*$/.test(v), "Old URL must be a path like /old-post")
    .refine((v) => !/^\/(admin|api|_next)(\/|$)/i.test(v), "That path cannot be redirected"),
  to: z
    .string()
    .trim()
    .min(1, "New URL is required")
    .max(600)
    .refine((v) => /^\/[A-Za-z0-9\-_/.%?=&#]*$/.test(v) || /^https:\/\/[^\s]+$/i.test(v), "New URL must start with / or https://"),
  permanent: z.boolean().default(true),
});

export const bulkSchema = z.object({
  ids: z.array(oid).min(1).max(100),
  action: z.enum(["publish", "draft", "delete"]),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: z.string().trim().max(120).default(""),
  description: z.string().max(600).default(""),
  icon: z.string().regex(/^bi-[a-z0-9-]{1,40}$/, "Icon must look like bi-stars").default("bi-stars"),
  image: imageSchema.default(emptyImage),
  parentCategory: oid.nullable().optional(),
  order: z.number().int().min(0).max(9999).default(0),
  adNetwork,
  showInFooter: z.boolean().default(false),
  showInNavbar: z.boolean().default(false),
  seo: z
    .object({ title: z.string().max(120).default(""), metaDescription: z.string().max(320).default("") })
    .default({ title: "", metaDescription: "" }),
});

export const tagSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  slug: z.string().trim().max(80).default(""),
});

const password = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128)
  .refine((p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p), "Use upper case, lower case and a number");

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Valid email required").max(200),
  password,
  role: z.enum(["admin", "editor", "author"]).default("author"),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  role: z.enum(["admin", "editor", "author"]).optional(),
  active: z.boolean().optional(),
  password: password.optional(),
  bio: z.string().max(1000).optional(),
  avatar: z.object({ url: httpsUrlOrEmpty.default(""), publicId: z.string().max(300).default("") }).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(128),
  captchaToken: z.string().min(1).max(4096),
});

const simpleImg = z
  .object({ url: httpsUrlOrEmpty.default(""), publicId: z.string().max(300).default("") })
  .default({ url: "", publicId: "" });

const socialUrl = z
  .string()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Social links must be http(s) URLs")
  .default("");

export const settingsSchema = z.object({
  siteTitle: z.string().trim().min(1).max(80),
  tagline: z.string().max(200).default(""),
  logo: simpleImg,
  favicon: simpleImg,
  heroImage: simpleImg,
  bannerImage: simpleImg,
  heroSlides: z
    .array(
      z.object({
        image: simpleImg,
        eyebrow: z.string().max(60).default(""),
        title: z.string().max(120).default(""),
        text: z.string().max(300).default(""),
        linkLabel: z.string().max(40).default(""),
        linkHref: z
          .string()
          .max(300)
          .refine((v) => v === "" || /^\/[A-Za-z0-9\-_/?=&#%.]*$/.test(v) || /^https:\/\/[^\s]+$/i.test(v), "Slide link must start with / or https://")
          .default(""),
      })
    )
    .max(6)
    .default([]),
  defaultOgImage: simpleImg,
  contactEmail: z
    .string()
    .max(200)
    .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid contact email")
    .default(""),
  socialLinks: z
    .object({ pinterest: socialUrl, instagram: socialUrl, facebook: socialUrl, tiktok: socialUrl, x: socialUrl })
    .default({ pinterest: "", instagram: "", facebook: "", tiktok: "", x: "" }),
  footerBlurb: z.string().max(500).default(""),
  seoDefaults: z
    .object({ title: z.string().max(120).default(""), metaDescription: z.string().max(320).default("") })
    .default({ title: "", metaDescription: "" }),
  analytics: z
    .object({
      googleAnalyticsId: z
        .string()
        .max(40)
        .refine((v) => v === "" || /^(G|UA|GTM)-[A-Z0-9-]{3,30}$/i.test(v), "Invalid Google Analytics ID")
        .default(""),
      searchConsoleVerification: z
        .string()
        .max(200)
        .refine((v) => /^[A-Za-z0-9_-]*$/.test(v), "Use only the verification code, not the full tag")
        .default(""),
      pinterestVerification: z
        .string()
        .max(100)
        .refine((v) => /^[A-Za-z0-9]*$/.test(v), "Use only the Pinterest code, not the full tag")
        .default(""),
    })
    .default({ googleAnalyticsId: "", searchConsoleVerification: "", pinterestVerification: "" }),
  ads: z
    .object({
      network: z.enum(["none", "adsense", "ezoic", "medianet"]).default("none"),
      placements: z
        .object({ top: z.boolean().default(true), inContent: z.boolean().default(true), bottom: z.boolean().default(true), listing: z.boolean().default(true) })
        .default({ top: true, inContent: true, bottom: true, listing: true }),
      adsTxt: z.string().max(5000).default(""),
    })
    .default({ network: "none", placements: { top: true, inContent: true, bottom: true, listing: true }, adsTxt: "" }),
  commentsEnabled: z.boolean().default(true),
});

export const commentPublicSchema = z.object({
  postId: oid,
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().toLowerCase().email("Valid email required").max(200),
  body: z.string().trim().min(2, "Comment is too short").max(2000),
  website: z.string().max(0).optional(), // honeypot
});

export const mediaPatchSchema = z.object({ alt: z.string().max(300) });
