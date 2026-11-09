import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: "", maxlength: 600 },
    icon: { type: String, default: "bi-stars" },
    image: { url: { type: String, default: "" }, publicId: { type: String, default: "" }, alt: { type: String, default: "" } },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    order: { type: Number, default: 0 },
    adNetwork: { type: String, enum: ["default", "none", "adsense", "ezoic", "medianet"], default: "default" },
    showInFooter: { type: Boolean, default: false },
    showInNavbar: { type: Boolean, default: false },
    seo: {
      title: { type: String, default: "", maxlength: 120 },
      metaDescription: { type: String, default: "", maxlength: 320 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
