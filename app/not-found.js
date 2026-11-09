import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";

export const metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <SiteShell>
      <div className="container py-5 text-center" style={{ minHeight: "50vh" }}>
        <p className="bf-eyebrow">Error 404</p>
        <h1 className="display-5 fw-bold">Oops, this page doesn&apos;t exist</h1>
        <p className="text-muted fs-5">The page you are looking for has moved or never existed. Try a search or head back home.</p>
        <div className="d-flex flex-wrap gap-3 justify-content-center mt-4"><Link href="/" className="btn btn-bf">Back to home</Link><Link href="/blog" className="btn btn-bf-outline">Browse games</Link></div>
      </div>
    </SiteShell>
  );
}
