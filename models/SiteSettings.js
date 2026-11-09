import mongoose from "mongoose";
import { DEFAULT_FOOTER_BLURB, DEFAULT_SEO_DESCRIPTION, DEFAULT_SEO_TITLE, DEFAULT_SITE_TITLE, DEFAULT_TAGLINE } from "../lib/brand.js";

const Img = { url: { type: String, default: "" }, publicId: { type: String, default: "" } };

const SiteSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "main", unique: true },
    siteTitle: { type: String, default: DEFAULT_SITE_TITLE, maxlength: 80 },
    tagline: { type: String, default: DEFAULT_TAGLINE, maxlength: 200 },
    logo: Img,
    favicon: Img,
    heroImage: Img,
    bannerImage: Img,
    heroSlides: {
      type: [
        {
          _id: false,
          image: Img,
          eyebrow: { type: String, default: "", maxlength: 60 },
          title: { type: String, default: "", maxlength: 120 },
          text: { type: String, default: "", maxlength: 300 },
          linkLabel: { type: String, default: "", maxlength: 40 },
          linkHref: { type: String, default: "", maxlength: 300 },
        },
      ],
      default: [],
    },
    defaultOgImage: Img,
    contactEmail: { type: String, default: "", maxlength: 200 },
    socialLinks: {
      pinterest: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      x: { type: String, default: "" },
    },
    footerBlurb: {
      type: String,
      default: DEFAULT_FOOTER_BLURB,
      maxlength: 500,
    },
    permalinkStructure: { type: String, default: "/{slug}" },
    seoDefaults: {
      title: { type: String, default: DEFAULT_SEO_TITLE, maxlength: 120 },
      metaDescription: {
        type: String,
        default: DEFAULT_SEO_DESCRIPTION,
        maxlength: 320,
      },
    },
    analytics: {
      googleAnalyticsId: { type: String, default: "", maxlength: 40 },
      searchConsoleVerification: { type: String, default: "", maxlength: 200 },
    },
    ads: {
      network: { type: String, enum: ["none", "adsense", "ezoic", "medianet"], default: "none" },
      placements: {
        top: { type: Boolean, default: true },
        inContent: { type: Boolean, default: true },
        bottom: { type: Boolean, default: true },
        listing: { type: Boolean, default: true },
      },
      adsTxt: { type: String, default: "", maxlength: 5000 },
    },
    commentsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);
