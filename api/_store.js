import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DATA_PATH = path.join(__dirname, "..", "data", "workmen.json");
const BLOB_PATHNAME = "workmen.json";

const isProduction = process.env.VERCEL === "1";
const usingBlob = isProduction || Boolean(process.env.BLOB_READ_WRITE_TOKEN);

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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Vercel Blob is not configured. Add BLOB_READ_WRITE_TOKEN to the Vercel project."
    );
  }

  const { list } = await import("@vercel/blob");

  const { blobs } = await list({
    prefix: BLOB_PATHNAME,
    limit: 100,
  });

  const match = blobs.find(
    (blob) => blob.pathname === BLOB_PATHNAME
  );

  if (!match) {
    return {};
  }

  const response = await fetch(match.url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to read Workman storage.");
  }

  return await response.json();
}

async function writeAllBlob(data) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Vercel Blob is not configured. Add BLOB_READ_WRITE_TOKEN to the Vercel project."
    );
  }

  const { put } = await import("@vercel/blob");

  await put(
    BLOB_PATHNAME,
    JSON.stringify(data, null, 2),
    {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    }
  );
}

async function readAll() {
  if (usingBlob) {
    return await readAllBlob();
  }

  return await readAllLocal();
}

async function writeAll(data) {
  if (usingBlob) {
    return await writeAllBlob(data);
  }

  return writeAllLocal(data);
}

export async function getWorkmanRecord(handle) {
  const all = await readAll();
  return all[handle] || null;
}

export async function upsertWorkmanRecord(
  handle,
  workmanId,
  patch
) {
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

export async function listAllRecords() {
  const all = await readAll();
  return Object.values(all);
}

export const storageBackend = usingBlob
  ? "vercel-blob"
  : "local-json";