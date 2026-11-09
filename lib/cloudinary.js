import { v2 as cloudinary } from "cloudinary";
import { requireEnv } from "./env";

function client() {
  cloudinary.config({
    cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });
  return cloudinary;
}

export function uploadBuffer(buffer, { folder = "snipandprint" } = {}) {
  const c = client();
  return new Promise((resolve, reject) => {
    const stream = c.uploader.upload_stream(
      { folder, resource_type: "image", overwrite: false },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export async function destroyImage(publicId) {
  return client().uploader.destroy(publicId, { resource_type: "image", invalidate: true });
}
