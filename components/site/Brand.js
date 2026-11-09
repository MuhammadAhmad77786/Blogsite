import Link from "next/link";
import { cld } from "@/lib/img";
import { DEFAULT_SITE_TITLE, splitTitle } from "@/lib/brand";

export function Wordmark({ title = DEFAULT_SITE_TITLE }) {
  const [a, b] = splitTitle(title);
  return (
    <span className="bf-wordmark">
      <span className="bf-w1">{a}</span>
      {b ? <span className="bf-w2">{b}</span> : null}
    </span>
  );
}

export default function Brand({ settings, size = 42 }) {
  const logo = settings?.logo?.url;
  const title = settings?.siteTitle || DEFAULT_SITE_TITLE;
  return (
    <Link className="navbar-brand bf-brand" href="/" aria-label={`${title} home`}>
      <img src={logo ? cld(logo, size * 2) : "/logo-mark.svg"} width={size} height={size} alt="" decoding="async" />
      <Wordmark title={title} />
    </Link>
  );
}
