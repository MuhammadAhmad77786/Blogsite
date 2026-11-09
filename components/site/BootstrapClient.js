"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BootstrapClient() {
  const pathname = usePathname();
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then((m) => {
      const B = m.default || m;
      // Start auto-playing carousels (the data API only auto-starts on window load).
      document.querySelectorAll('[data-bs-ride="carousel"]').forEach((el) => B.Carousel.getOrCreateInstance(el));
    });
  }, [pathname]);
  return null;
}
