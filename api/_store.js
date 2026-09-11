// Storage for Workman task submissions (Experiment 01 / Experiment 02).
//
// Vercel's serverless filesystem is ephemeral and read-only between
// invocations, so a plain local JSON file (like a `data/workmen.json`
// committed to the repo) will NOT persist writes in production — every
// cold start resets it, and concurrent instances don't share disk.
//
// To keep this as close to "just a JSON file" as possible while still
// persisting reliably on Vercel, this uses Vercel Blob (a flat,
// schema-less file store — not a database) in production, and falls
// back to a real local JSON file at data/workmen.json for local dev,
// so `npm run dev` works with zero extra setup.
//
// Production requires the BLOB_READ_WRITE_TOKEN environment variable,
// which Vercel provisions automatically once Blob storage is enabled
// for the project (Storage tab -> Create Database -> Blob). No manual
// token copying needed if you use the dashboard flow.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DATA_PATH = path.join(__dirname, "..", "data", "workmen.json");
const BLOB_PATHNAME = "workmen.json";

const usingBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readAllLocal() {
  try {
    const raw = fs.readFileSync(LOCAL_DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeAllLocal(data) {
  fs.mkdirSync(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_DATA_PATH, JSON.stringify(data, null, 2));
}

async function readAllBlob() {
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
  const match = blobs.find((b) => b.pathname === BLOB_PATHNAME);
  if (!match) return {};

  const res = await fetch(match.url, { cache: "no-store" });
  if (!res.ok) return {};
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function writeAllBlob(data) {
  const { put } = await import("@vercel/blob");
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

async function readAll() {
  return usingBlob ? readAllBlob() : readAllLocal();
}

async function writeAll(data) {
  return usingBlob ? writeAllBlob(data) : writeAllLocal(data);
}

// Fetch a single workman record by handle (the primary key).
export async function getWorkmanRecord(handle) {
  const all = await readAll();
  return all[handle] || null;
}

// Merge `patch` into the workman's record, creating it if needed.
// Returns the updated record.
export async function upsertWorkmanRecord(handle, workmanId, patch) {
  const all = await readAll();
  const now = new Date().toISOString();
  const existing = all[handle];

  const record = {
    handle,
    workmanId,
    workCompleted: false,
    workResponse: null,
    signalCompleted: false,
    signalResponse: null,
    createdAt: existing?.createdAt || now,
    ...existing,
    ...patch,
    updatedAt: now,
  };

  all[handle] = record;
  await writeAll(all);
  return record;
}

// Returns every stored record as an array, for the admin view.
export async function listAllRecords() {
  const all = await readAll();
  return Object.values(all);
}

export const storageBackend = usingBlob ? "vercel-blob" : "local-json";
