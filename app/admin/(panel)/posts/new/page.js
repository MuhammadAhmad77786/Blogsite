import PostEditor from "@/components/admin/PostEditor";
import { getSettings } from "@/lib/data";

export default async function NewPost() {
  const s = await getSettings();
  return <PostEditor siteName={s.siteTitle} />;
}
