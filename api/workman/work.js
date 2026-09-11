import { cleanHandle, isValidHandle } from "../_workman-logic.js";
import { sanitizeResponse } from "../_sanitize.js";
import { getWorkmanRecord, upsertWorkmanRecord } from "../_store.js";

const MAX_LENGTH = 500;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "USE POST." });
  }

  const { handle: rawHandle, workmanId, response: rawResponse } = req.body || {};

  const handle = cleanHandle(rawHandle);
  if (!isValidHandle(handle)) {
    return res.status(400).json({
      error: "INVALID_HANDLE",
      message: "THAT HANDLE DOESN'T LOOK RIGHT.",
    });
  }

  if (!workmanId || typeof workmanId !== "string") {
    return res.status(400).json({ error: "MISSING_WORKMAN_ID", message: "MISSING WORKMAN ID." });
  }

  const validated = sanitizeResponse(rawResponse, {
    maxLength: MAX_LENGTH,
    emptyMessage: "GIVE US SOMETHING TO WORK WITH.",
  });

  if (!validated.ok) {
    return res.status(400).json({ error: validated.error, message: validated.message });
  }

  // Don't let a request for one Workman ID overwrite another handle's
  // existing record under a mismatched ID.
  const existing = await getWorkmanRecord(handle);
  if (existing && existing.workmanId !== workmanId) {
    return res.status(400).json({
      error: "WORKMAN_MISMATCH",
      message: "THAT HANDLE DOESN'T LOOK RIGHT.",
    });
  }

  const record = await upsertWorkmanRecord(handle, workmanId, {
    workCompleted: true,
    workResponse: validated.value,
  });

  return res.status(200).json({
    success: true,
    workCompleted: record.workCompleted,
  });
}
