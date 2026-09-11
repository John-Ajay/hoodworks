import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DATA_PATH = path.join(__dirname, "..", "data", "workmen.json");

const BLOB_PATHNAME = "workmen.json";

const isProduction = process.env.VERCEL === "1";

const usingBlob =
  isProduction ||
  Boolean(process.env.BLOB_STORE_ID) ||
  Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readAllLocal() {
  try {
    const raw = fs.readFileSync(LOCAL_DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeAllLocal(data) {
  fs.mkdirSync(path.dirname(LOCAL_DATA_PATH), {
    recursive: true,
  });

  fs.writeFileSync(
    LOCAL_DATA_PATH,
    JSON.stringify(data, null, 2)
  );
}

async function getBlobSdk() {
  if (
    !process.env.BLOB_STORE_ID &&
    !process.env.BLOB_READ_WRITE_TOKEN
  ) {
    throw new Error(
      "Vercel Blob is not configured. Connect a Blob store to this Vercel project."
    );
  }

  /*
   * @vercel/blob uses Vercel OIDC automatically when:
   *
   * BLOB_STORE_ID is available
   * +
   * Vercel provides VERCEL_OIDC_TOKEN
   *
   * A BLOB_READ_WRITE_TOKEN is still supported as a fallback.
   */
  return import("@vercel/blob");
}

async function readAllBlob() {
  const { get } = await getBlobSdk();

  try {
    const result = await get(BLOB_PATHNAME, {
      access: "private",
      useCache: false,
    });

    if (!result) {
      return {};
    }

    const text = await new Response(result.stream).text();

    return JSON.parse(text);
  } catch (error) {
    if (
      error?.status === 404 ||
      error?.code === "BLOB_NOT_FOUND"
    ) {
      return {};
    }

    throw error;
  }
}

async function writeAllBlob(data) {
  const { put } = await getBlobSdk();

  await put(
    BLOB_PATHNAME,
    JSON.stringify(data, null, 2),
    {
      access: "private",
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