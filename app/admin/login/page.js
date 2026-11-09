import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LoginForm from "@/components/admin/LoginForm";
import { Wordmark } from "@/components/site/Brand";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/admin");
  return (
    <div className="adm-body adm-login d-flex align-items-center justify-content-center p-3">
      <div className="adm-card w-100" style={{ maxWidth: 420 }}>
        <div className="text-center mb-4">
          <img src="/logo-mark.svg" width={64} height={64} alt="" className="mb-2" />
          <div><Wordmark /></div>
          <p className="text-muted small mt-2 mb-0">Admin sign in</p>
        </div>
        <LoginForm siteKey={process.env.CAPTCHA_SITE_KEY || ""} />
      </div>
    </div>
  );
}
