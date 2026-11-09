import mongoose from "mongoose";

const RedirectSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, unique: true, maxlength: 300 },
    to: { type: String, required: true, maxlength: 600 },
    permanent: { type: Boolean, default: true },
    auto: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Redirect || mongoose.model("Redirect", RedirectSchema);
