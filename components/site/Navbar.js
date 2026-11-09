import Brand from "./Brand";
import NavLink from "./NavLink";
import { getNavCategories, getSettings } from "@/lib/data";

const DIRECT = 3;

export default async function Navbar() {
  const [settings, navCats] = await Promise.all([getSettings(), getNavCategories()]);
  const direct = navCats.slice(0, DIRECT);
  const extra = navCats.slice(DIRECT);

  return (
    <>
      <a href="#content" className="bf-skip">Skip to content</a>
      <header className="bf-header sticky-top">
        <nav className="navbar navbar-expand-lg bf-navbar" aria-label="Main">
          <div className="container">
            <Brand settings={settings} />
            <button
              className="navbar-toggler bf-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#bfNav"
              aria-controls="bfNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <i className="bi bi-list fs-3" />
            </button>
            <div className="collapse navbar-collapse" id="bfNav">
              <ul className="navbar-nav ms-auto align-items-lg-center">
                <li className="nav-item"><NavLink href="/" exact>Home</NavLink></li>
                <li className="nav-item"><NavLink href="/blog">All Games</NavLink></li>
                {direct.map((c) => (
                  <li className="nav-item" key={c._id}>
                    <NavLink href={`/category/${c.slug}`}>{c.name}</NavLink>
                  </li>
                ))}
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    More <i className="bi bi-chevron-down small" />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end bf-dropdown">
                    {extra.map((c) => (
                      <li key={c._id}><NavLink href={`/category/${c.slug}`} className="dropdown-item">{c.name}</NavLink></li>
                    ))}
                    {extra.length > 0 && <li><hr className="dropdown-divider" /></li>}
                    <li><NavLink href="/about" className="dropdown-item">About</NavLink></li>
                    <li><NavLink href="/contact" className="dropdown-item">Contact</NavLink></li>
                  </ul>
                </li>
                <li className="nav-item ms-lg-3 d-lg-none d-xl-block">
                  <form action="/search" method="get" role="search" className="bf-search">
                    <i className="bi bi-search" aria-hidden="true" />
                    <input className="form-control" type="search" name="q" placeholder="Search games" aria-label="Search games" maxLength={100} />
                  </form>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
