import { cleanHandle, isValidHandle } from "../_workman-logic.js";
import { getWorkmanRecord } from "../_store.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "USE GET." });
  }

  const handle = cleanHandle(req.query?.handle);

  if (!isValidHandle(handle)) {
    return res.status(400).json({
      error: "INVALID_HANDLE",
      message: "THAT HANDLE DOESN'T LOOK RIGHT.",
    });
  }

  const record = await getWorkmanRecord(handle);

  return res.status(200).json({
    workCompleted: Boolean(record?.workCompleted),
    signalCompleted: Boolean(record?.signalCompleted),
  });
}
