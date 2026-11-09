import { revalidatePath } from "next/cache";

/** Refresh every cached public page after admin changes. */
export function revalidateSite() {
  try {
    revalidatePath("/", "layout");
  } catch {
    // not fatal: pages also revalidate on a timer
  }
}
