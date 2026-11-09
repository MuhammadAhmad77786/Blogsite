import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  { url: { type: String, default: "" }, publicId: { type: String, default: "" }, alt: { type: String, default: "" } },
  { _id: false }
);

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, default: "", maxlength: 600 },
    content: { type: String, default: "" },
    featuredImage: { type: ImageSchema, default: () => ({}) },
    gallery: { type: [ImageSchema], default: [] },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    tags: { type: [String], default: [] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published", "scheduled"], default: "draft" },
    publishedAt: { type: Date, default: null },
    views: { type: Number, default: 0 },
    adNetwork: { type: String, enum: ["default", "none", "adsense", "ezoic", "medianet"], default: "default" },
    seo: {
      title: { type: String, default: "", maxlength: 120 },
      metaDescription: { type: String, default: "", maxlength: 320 },
      focusKeyword: { type: String, default: "", maxlength: 80 },
      canonicalUrl: { type: String, default: "", maxlength: 500 },
      ogImage: { type: String, default: "", maxlength: 500 },
      noindex: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ categories: 1 });
PostSchema.index({ title: "text", excerpt: "text", tags: "text" });

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
