// Simple, unauthenticated-by-default admin view of all Workman
// submissions. Protected with a shared-secret query param rather than
// full auth infrastructure, since this is meant to be read occasionally
// by the project owner, not a multi-user admin panel.
//
// Set ADMIN_SECRET in your environment (Vercel project settings, or a
// local .env) and visit:
//
//   /api/admin/signals?secret=YOUR_SECRET
//
// If ADMIN_SECRET is not set, this endpoint is disabled entirely (returns
// 404) so nothing is ever accidentally left open in a deployment that
// forgot to configure it.

import { listAllRecords, storageBackend } from "../_store.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "USE GET." });
  }

  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return res.status(404).json({ error: "NOT_CONFIGURED" });
  }

  const provided = req.query?.secret;

  if (provided !== adminSecret) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  const records = await listAllRecords();

  // Newest activity first.
  records.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return res.status(200).json({
    backend: storageBackend,
    count: records.length,
    records,
  });
}
