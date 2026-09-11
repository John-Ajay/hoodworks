// Local-only dev server so `/api/workman` works with `npm run dev`
// without needing the Vercel CLI. Not used in production — Vercel
// serves api/workman.js directly as a serverless function there.
import express from "express";
import cors from "cors";
import { cleanHandle, isValidHandle, generateWorkmanId } from "./_workman-logic.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/workman", (req, res) => {
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

  return res.json({ handle, workmanId, status: "ACTIVE" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Local API dev server running on http://localhost:${PORT}`);
});
