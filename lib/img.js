/** Adds Cloudinary auto format/quality/width transforms to a delivery URL. */
export function cld(url, width) {
  if (!url || typeof url !== "string") return "";
  const marker = "/image/upload/";
  const i = url.indexOf(marker);
  if (i === -1 || !url.includes("res.cloudinary.com")) return url;
  const t = ["f_auto", "q_auto", width ? `w_${width}` : null, width ? "c_limit" : null].filter(Boolean).join(",");
  return url.slice(0, i + marker.length) + t + "/" + url.slice(i + marker.length);
}

export function cldSrcSet(url, widths = [400, 800, 1200]) {
  if (!url || !url.includes("res.cloudinary.com")) return undefined;
  return widths.map((w) => `${cld(url, w)} ${w}w`).join(", ");
}
