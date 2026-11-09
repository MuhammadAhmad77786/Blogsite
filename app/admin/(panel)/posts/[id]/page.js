import PostEditor from "@/components/admin/PostEditor";
import { getSettings } from "@/lib/data";

export default async function EditPost({ params }) {
  const s = await getSettings();
  return <PostEditor postId={params.id} siteName={s.siteTitle} />;
}
