import Link from "next/link";

function pageList(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("gap" + n);
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, pages, basePath, params = {} }) {
  if (pages <= 1) return null;
  const href = (n) => {
    const sp = new URLSearchParams(params);
    if (n > 1) sp.set("page", String(n));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <nav aria-label="Pagination" className="mt-5">
      <ul className="pagination bf-pagination justify-content-center flex-wrap">
        <li className={`page-item${page <= 1 ? " disabled" : ""}`}>
          <Link className="page-link" href={href(page - 1)} aria-label="Previous">‹</Link>
        </li>
        {pageList(page, pages).map((n) =>
          typeof n === "string" ? (
            <li key={n} className="page-item disabled"><span className="page-link">…</span></li>
          ) : (
            <li key={n} className={`page-item${n === page ? " active" : ""}`}>
              <Link className="page-link" href={href(n)} aria-current={n === page ? "page" : undefined}>{n}</Link>
            </li>
          )
        )}
        <li className={`page-item${page >= pages ? " disabled" : ""}`}>
          <Link className="page-link" href={href(page + 1)} aria-label="Next">›</Link>
        </li>
      </ul>
    </nav>
  );
}
