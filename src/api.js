// In production (Vercel) the frontend and the /api serverless function
// share the same origin, so a relative path just works.
// For local development you can point this at a separate backend by
// setting VITE_API_URL in a .env file.
const API_BASE = import.meta.env.VITE_API_URL || "";

export async function submitWorkmanHandle(handle) {
  const res = await fetch(`${API_BASE}/api/workman`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message || "SOMETHING WENT WRONG.";
    const error = new Error(message);
    error.code = data?.error || "UNKNOWN";
    throw error;
  }

  return data;
}
