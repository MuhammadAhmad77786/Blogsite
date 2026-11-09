import dns from "node:dns";

let applied = false;

/**
 * Some home routers/ISPs time out on the DNS TXT/SRV lookups that
 * mongodb+srv:// connection strings need ("queryTxt ETIMEOUT").
 * Set MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 in .env.local to resolve them
 * through public DNS instead. Does nothing when the variable is empty.
 */
export function applyMongoDns() {
  if (applied) return;
  applied = true;
  const list = String(process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length) dns.setServers(list);
}
