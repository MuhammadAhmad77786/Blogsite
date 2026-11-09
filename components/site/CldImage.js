import { cld, cldSrcSet } from "@/lib/img";

export default function CldImage({ src, alt = "", sizes = "100vw", className, priority = false, widths }) {
  if (!src) return null;
  return (
    <img
      src={cld(src, 800)}
      srcSet={cldSrcSet(src, widths)}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
