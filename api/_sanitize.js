// Shared validation + sanitization for free-text task submissions
// (Experiment 01 "The Work" and Experiment 02 "The Signal").

// Escapes HTML-significant characters so stored/returned text can never
// be interpreted as markup or script if echoed back into the app.
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Validates and sanitizes a submitted response.
// Returns { ok: true, value } or { ok: false, error, message }.
export function sanitizeResponse(raw, { maxLength, emptyMessage }) {
  if (typeof raw !== "string") {
    return { ok: false, error: "EMPTY_RESPONSE", message: emptyMessage };
  }

  const trimmed = raw.trim();

  if (!trimmed) {
    return { ok: false, error: "EMPTY_RESPONSE", message: emptyMessage };
  }

  if (trimmed.length > maxLength) {
    return {
      ok: false,
      error: "RESPONSE_TOO_LONG",
      message: `KEEP IT UNDER ${maxLength} CHARACTERS.`,
    };
  }

  return { ok: true, value: escapeHtml(trimmed) };
}
