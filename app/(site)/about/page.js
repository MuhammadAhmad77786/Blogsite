import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import { getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata() {
  const s = await getSettings();
  return buildMetadata(s, {
    title: `About Us | ${s.siteTitle}`,
    description: `Meet the team behind ${s.siteTitle}: fun, simple games for kids, parties, families and friends.`,
    path: "/about",
  });
}

export default async function AboutPage() {
  const s = await getSettings();
  const name = s.siteTitle;
  return (
    <>
      <PageHead eyebrow="Hello there" title={`About ${name}`} subtitle={s.tagline} crumbs={[{ href: "/", label: "Home" }, { label: "About" }]} />
      <div className="container py-5">
        <div className="bf-prose">
          <h2>Our story</h2>
          <p>
            {name} started with a simple problem: most party and family games are either too complicated or just plain boring. We wanted games
            that were quick to set up, needed little or no equipment and were genuinely fun for kids and grown-ups. Today we share them here, free, for anyone
            who needs a rainy-day activity, a classroom game or a last-minute party idea.
          </p>

          <h2>Our mission</h2>
          <p>
            To make game time easy to start. Every post gives you clear rules, a short setup list and, where it helps, a free printable you can use
            today. No special equipment, no complicated instructions.
          </p>

          <h2>What you will find here</h2>
          <ol className="bf-steps">
            <li><div><strong>Games for every crowd.</strong> Kids games, party games, family games and games for adults and friends.</div></li>
            <li><div><strong>Seasonal and holiday games.</strong> Halloween, Thanksgiving, Christmas and more, ready when the season comes.</div></li>
            <li><div><strong>Free printables.</strong> Bingo cards, scavenger hunts, score sheets and game cards you can print at home.</div></li>
          </ol>

          <h2>How we pick our games</h2>
          <p>
            Every game is played and tested with real kids, families and friends before it goes live. We write clear rules, list what you need up
            front and add tips for different ages and group sizes. You can read more in our <Link href="/editorial-policy">Editorial Policy</Link>.
          </p>

          <h2>Using our games and printables</h2>
          <p>
            Our games and printables are free for personal, home and classroom use. Please share a link to the post rather than the file itself, and do not sell or
            redistribute them. See our <Link href="/terms">Terms of Use</Link> and <Link href="/copyright">Copyright</Link> page for details.
          </p>

          <h2>How this site is funded</h2>
          <p>
            {name} is free to use. We cover our costs with advertising, which is kept separate from our content. You can learn how ads and cookies work in our{" "}
            <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookie-policy">Cookie Policy</Link>.
          </p>

          <h2>Say hello</h2>
          <p>
            Played one of our games? Have an idea for a new one? We would love to hear from you. <Link href="/contact">Contact us</Link> or browse the{" "}
            <Link href="/blog">latest games</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
