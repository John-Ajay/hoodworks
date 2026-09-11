// Local-only dev server so all /api routes work with `npm run dev`
// without needing the Vercel CLI. Not used in production — Vercel
// serves each api/*.js file directly as its own serverless function
// there. This file wires the exact same handler modules into Express
// so local behavior matches production instead of re-implementing it.
import express from "express";
import cors from "cors";
import { cleanHandle, isValidHandle, generateWorkmanId } from "./_workman-logic.js";
import workHandler from "./workman/work.js";
import signalHandler from "./workman/signal.js";
import stateHandler from "./workman/state.js";
import adminSignalsHandler from "./admin/signals.js";

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

// Vercel functions read query params from req.query, which Express
// already populates the same way — so these handlers work unmodified.
app.post("/api/workman/work", workHandler);
app.post("/api/workman/signal", signalHandler);
app.get("/api/workman/state", stateHandler);
app.get("/api/admin/signals", adminSignalsHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Local API dev server running on http://localhost:${PORT}`);
  console.log(`Storage: data/workmen.json (local JSON file — Vercel Blob is used in production)`);
});
