import { cleanHandle, isValidHandle, generateWorkmanId } from "./_workman-logic.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "USE POST." });
  }

  const rawHandle = req.body?.handle;

  if (!rawHandle || typeof rawHandle !== "string" || !rawHandle.trim()) {
    return res.status(400).json({ error: "EMPTY_HANDLE", message: "ENTER YOUR X HANDLE." });
  }

  const handle = cleanHandle(rawHandle);

  if (!isValidHandle(handle)) {
    return res.status(400).json({
      error: "INVALID_HANDLE",
      message: "THAT HANDLE DOESN'T LOOK RIGHT.",
    });
  }

  const workmanId = generateWorkmanId(handle);

  return res.status(200).json({
    handle,
    workmanId,
    status: "ACTIVE",
  });
}
