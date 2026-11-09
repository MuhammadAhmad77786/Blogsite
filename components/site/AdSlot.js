import AdUnit from "./AdUnit";
import { adFor } from "@/lib/ads";

/** Server component: renders nothing unless this placement is enabled and the network has IDs in .env. */
export default function AdSlot({ settings, network, placement }) {
  const cfg = adFor(settings, network, placement);
  if (!cfg) return null;
  return <AdUnit {...cfg} />;
}
