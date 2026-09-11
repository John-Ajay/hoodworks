// In production (Vercel) the frontend and the /api serverless function
// share the same origin, so a relative path just works.
// For local development you can point this at a separate backend by
// setting VITE_API_URL in a .env file.
const API_BASE = import.meta.env.VITE_API_URL || "";

async function handleJsonResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message || "SOMETHING WENT WRONG.";
    const error = new Error(message);
    error.code = data?.error || "UNKNOWN";
    throw error;
  }

  return data;
}

export async function submitWorkmanHandle(handle) {
  const res = await fetch(`${API_BASE}/api/workman`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle }),
  });

  return handleJsonResponse(res);
}

export async function submitWork(handle, workmanId, response) {
  const res = await fetch(`${API_BASE}/api/workman/work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, workmanId, response }),
  });

  return handleJsonResponse(res);
}

export async function submitSignal(handle, workmanId, response) {
  const res = await fetch(`${API_BASE}/api/workman/signal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, workmanId, response }),
  });

  return handleJsonResponse(res);
}

export async function fetchWorkmanState(handle) {
  const res = await fetch(`${API_BASE}/api/workman/state?handle=${encodeURIComponent(handle)}`);
  return handleJsonResponse(res);
}
