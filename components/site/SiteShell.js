import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteShell({ children }) {
  return (
    <>
      <Navbar />
      <main id="content">{children}</main>
      <Footer />
    </>
  );
}
