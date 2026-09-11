import { cleanHandle, isValidHandle } from "../_workman-logic.js";
import { sanitizeResponse } from "../_sanitize.js";
import { getWorkmanRecord, upsertWorkmanRecord } from "../_store.js";

const MAX_LENGTH = 2000;

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
    emptyMessage: "THE SIGNAL IS EMPTY.",
  });

  if (!validated.ok) {
    return res.status(400).json({ error: validated.error, message: validated.message });
  }

  const existing = await getWorkmanRecord(handle);

  if (existing && existing.workmanId !== workmanId) {
    return res.status(400).json({
      error: "WORKMAN_MISMATCH",
      message: "THAT HANDLE DOESN'T LOOK RIGHT.",
    });
  }

  // Experiment 02 only unlocks after Experiment 01 is complete — enforce
  // that server-side too, not just in the UI.
  if (!existing?.workCompleted) {
    return res.status(403).json({
      error: "EXPERIMENT_LOCKED",
      message: "COMPLETE THE WORK FIRST.",
    });
  }

  const record = await upsertWorkmanRecord(handle, workmanId, {
    signalCompleted: true,
    signalResponse: validated.value,
  });

  return res.status(200).json({
    success: true,
    signalCompleted: record.signalCompleted,
  });
}
