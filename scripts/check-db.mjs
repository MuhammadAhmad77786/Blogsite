// Proves the MongoDB connection with a real write + read + delete.
// Usage: npm run check:db
import mongoose from "mongoose";
import { applyMongoDns } from "../lib/dns.mjs";

try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local: use variables already in the environment
}
const uri = process.env.MONGODB_URI;
if (!uri) {
  process.stderr.write("MONGODB_URI is missing in .env.local\n");
  process.exit(1);
}

applyMongoDns();

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const col = mongoose.connection.collection("_healthcheck");
  const { insertedId } = await col.insertOne({ at: new Date(), note: "snipandprint db check" });
  const found = await col.findOne({ _id: insertedId });
  await col.deleteOne({ _id: insertedId });
  if (!found) throw new Error("Wrote a document but could not read it back.");
  process.stdout.write("OK: MongoDB connection works (wrote, read and deleted a test document).\n");
  await mongoose.disconnect();
} catch (e) {
  process.stderr.write(`FAILED: ${e.message}\n`);
  process.exit(1);
}
