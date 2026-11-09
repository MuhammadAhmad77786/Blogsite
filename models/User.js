import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 200 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "editor", "author"], default: "author" },
    active: { type: Boolean, default: true },
    bio: { type: String, default: "", maxlength: 1000 },
    avatar: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    socialLinks: {
      instagram: { type: String, default: "" },
      pinterest: { type: String, default: "" },
      x: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
