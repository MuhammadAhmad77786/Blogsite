import { NextResponse } from "next/server";
import { ZodError } from "zod";
import mongoose from "mongoose";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Invalid request.");
  }
}

export function parse(schema, data) {
  try {
    return schema.parse(data);
  } catch (e) {
    if (e instanceof ZodError) throw new HttpError(400, e.issues[0]?.message || "Invalid input.");
    throw new HttpError(400, "Invalid input.");
  }
}

export function assertId(id) {
  if (typeof id !== "string" || !mongoose.isValidObjectId(id)) throw new HttpError(404, "Not found.");
  return id;
}

export function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function clientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim().slice(0, 64);
  return (req.headers.get("x-real-ip") || "unknown").slice(0, 64);
}

export function errorResponse(e) {
  if (e instanceof HttpError) return json({ error: e.message }, e.status);
  return json({ error: "Something went wrong." }, 500);
}

export function plain(doc) {
  return JSON.parse(JSON.stringify(doc));
}
