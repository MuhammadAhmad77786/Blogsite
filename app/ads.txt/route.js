import { connectDB } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";

export const dynamic = "force-dynamic";

// Served at /ads.txt. Edit the content in Admin > Settings > Ads (no redeploy needed).
export async function GET() {
  let text = "";
  try {
    await connectDB();
    const s = await SiteSettings.findOne({ singleton: "main" }).select("ads.adsTxt").lean();
    text = s?.ads?.adsTxt || "";
  } catch {
    text = "";
  }
  if (!text.trim()) return new Response("Not found", { status: 404 });
  return new Response(text.trim() + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
