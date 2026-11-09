// Proves Cloudinary credentials with a real upload, then deletes the test image.
// Usage: npm run check:cloudinary
import { v2 as cloudinary } from "cloudinary";

try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local: use variables already in the environment
}
const { CLOUDINARY_CLOUD_NAME: cloud_name, CLOUDINARY_API_KEY: api_key, CLOUDINARY_API_SECRET: api_secret } = process.env;
if (!cloud_name || !api_key || !api_secret) {
  process.stderr.write("CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET missing in .env.local\n");
  process.exit(1);
}
cloudinary.config({ cloud_name, api_key, api_secret, secure: true });

// 1x1 transparent PNG
const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

try {
  const res = await cloudinary.uploader.upload(PNG, { folder: "snipandprint/_healthcheck" });
  process.stdout.write(`OK: upload works -> ${res.secure_url}\n`);
  await cloudinary.uploader.destroy(res.public_id);
  process.stdout.write("Test image deleted.\n");
} catch (e) {
  process.stderr.write(`FAILED: ${e?.error?.message || e.message}\n`);
  process.exit(1);
}
