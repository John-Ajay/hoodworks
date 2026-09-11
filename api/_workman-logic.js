import crypto from "crypto";

export function cleanHandle(input) {
  if (typeof input !== "string") return null;
  let handle = input.trim();
  if (handle.startsWith("@")) handle = handle.slice(1);
  handle = handle.toLowerCase();
  return handle;
}

// X handles: 1-15 chars, letters/numbers/underscore
export function isValidHandle(handle) {
  if (!handle) return false;
  if (handle.length < 1 || handle.length > 15) return false;
  return /^[a-z0-9_]+$/.test(handle);
}

// Deterministic 5-digit Workman ID derived from the handle
export function generateWorkmanId(handle) {
  const hash = crypto.createHash("sha256").update(handle).digest("hex");
  const num = parseInt(hash.slice(0, 8), 16) % 100000;
  return String(num).padStart(5, "0").slice(0, 5);
}
