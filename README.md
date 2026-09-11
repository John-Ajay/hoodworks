# HOODS WORKS — THE WORKMEN

A minimal, industrial-feeling mini web experience.

**Flow:** Enter your X handle → WELCOME, WORKMAN → Workman ID → ENTER THE WORKSHOP → complete Experiment 01 → unlock Experiment 02.

No wallet connection. No blockchain. No NFT minting. No real eligibility check —
every valid handle becomes an active Workman with a deterministic ID.

This project is a single deployable unit: a React + Vite frontend with Vercel
serverless functions under `/api`. No separate backend host needed.

## Project structure

```
hoods-works/
├── api/
│   ├── workman.js              POST /api/workman — register/re-enter as a Workman
│   ├── workman/
│   │   ├── work.js             POST /api/workman/work    — submit Experiment 01
│   │   ├── signal.js           POST /api/workman/signal  — submit Experiment 02
│   │   └── state.js            GET  /api/workman/state   — completion status lookup
│   ├── admin/
│   │   └── signals.js          GET  /api/admin/signals   — view all submissions
│   ├── _workman-logic.js       shared handle-cleaning / ID logic (not a route)
│   ├── _sanitize.js            shared input validation + HTML escaping (not a route)
│   ├── _store.js                shared storage layer (not a route)
│   └── dev-server.js           local-only Express server so `npm run dev` works without the Vercel CLI
├── src/
│   ├── components/             Landing, Processing, WorkmanResult, Workshop, TaskView
│   ├── App.jsx                  view-state flow, including the two experiment task screens
│   ├── api.js                   fetch wrapper, same-origin in production
│   └── index.css / App.css     design system + screen styles (unchanged, only extended)
├── vercel.json                  SPA rewrite so client-side routing/refresh works
└── package.json
```

Files/routes prefixed with `_` (e.g. `_store.js`) are shared helpers, not
serverless functions — Vercel excludes underscore-prefixed files from routing.

## Requirements

- Node.js 18+
- npm

## Local development

```bash
npm install
npm run dev
```

This runs the Vite dev server (`http://localhost:5173`) **and** a small local
Express server (`http://localhost:4000`) together, so every `/api` route works
locally exactly like it will on Vercel. The frontend is pointed at the local
API via `VITE_API_URL` in `.env`.

The local API server (`api/dev-server.js`) is dev-only and wires in the exact
same handler modules Vercel uses in production — it doesn't duplicate the
logic, just runs it inside Express instead of as separate functions.

Locally, submissions are stored in `data/workmen.json` (gitignored, created
automatically on first submission).

## API

### Register / re-enter as a Workman (existing, unchanged)

```
POST /api/workman
Body:     { "handle": "@seunoguntade" }
Response: { "handle": "seunoguntade", "workmanId": "38990", "status": "ACTIVE" }
```

### Submit Experiment 01 — THE WORK (new)

```
POST /api/workman/work
Body:     { "handle": "seunoguntade", "workmanId": "38990", "response": "I bring creativity." }
Response: { "success": true, "workCompleted": true }
```

Rejects empty responses (`GIVE US SOMETHING TO WORK WITH.`) and responses over
500 characters.

### Submit Experiment 02 — THE SIGNAL (new)

```
POST /api/workman/signal
Body:     { "handle": "seunoguntade", "workmanId": "38990", "response": "Build more experiments." }
Response: { "success": true, "signalCompleted": true }
```

Rejects empty responses (`THE SIGNAL IS EMPTY.`), responses over 2,000
characters, and — enforced server-side, not just in the UI — any attempt to
submit before Experiment 01 has been completed for that Workman
(`403 EXPERIMENT_LOCKED`).

### Check completion state (new)

```
GET /api/workman/state?handle=seunoguntade
Response: { "workCompleted": true, "signalCompleted": false }
```

Used on page load/refresh to restore whether the current Workman's
experiments show as completed.

### Admin — view submissions (new)

```
GET /api/admin/signals?secret=YOUR_ADMIN_SECRET
```

Returns every stored Workman record, newest activity first. See "Viewing
Workman submissions" below.

Handle rules for all endpoints (unchanged): whitespace is trimmed, a leading
`@` is stripped, and the handle is lowercased. Must be 1–15 characters of
letters, numbers, or underscores. Every handle that passes that shape check is
accepted — there is no eligibility list, no X/Twitter API call, and no
follower or NFT check. The Workman ID is a deterministic 5-digit number
derived from a hash of the cleaned handle, so the same handle always returns
the same ID.

## Submitted text: validation & safety

- Empty or whitespace-only responses are rejected for both experiments.
- Experiment 01 responses are capped at 500 characters; Experiment 02 at 2,000.
- All submitted text is HTML-escaped before storage, so it can never be
  interpreted as markup or executed as script if it's ever rendered back into
  the app or an admin view.
- A submission can't overwrite another handle's record under a mismatched
  Workman ID.

## How submission storage works

Every Workman's record (handle, Workman ID, both task responses, completion
flags, and timestamps) is stored as one JSON object, keyed by handle — the
same shape as the example in the spec:

```json
{
  "seunoguntade": {
    "handle": "seunoguntade",
    "workmanId": "38990",
    "workCompleted": true,
    "workResponse": "I bring creativity and community building.",
    "signalCompleted": true,
    "signalResponse": "I want Hoods Works to build more interactive experiments.",
    "createdAt": "2026-09-11T00:00:00.000Z",
    "updatedAt": "2026-09-11T00:30:00.000Z"
  }
}
```

**Important Vercel limitation:** Vercel's serverless functions run on an
ephemeral, read-only filesystem — a plain committed `data/workmen.json` file
would appear to work in every individual request, but writes don't persist
between invocations (a cold start, or a request handled by a different
instance, would see the original file again, silently losing submissions).
A local JSON file is not a viable persistence layer in that environment.

To stay as close to "just a JSON file" as possible while actually persisting
in production, this project uses **Vercel Blob** — flat, schema-less file
storage (not a relational/document database) that Vercel provisions with one
click and exposes as a single environment variable. Locally, the same code
path transparently falls back to a real `data/workmen.json` file, so no Blob
setup is needed for local development.

This is intentionally not MongoDB, Postgres, Supabase, or Firebase — it's the
smallest amount of persistence that actually survives Vercel's serverless
environment.

### Enabling storage on Vercel

1. In your Vercel project, go to **Storage → Create Database → Blob**.
2. Vercel automatically adds a `BLOB_READ_WRITE_TOKEN` environment variable to
   your project — no manual copying needed.
3. Redeploy (or it'll apply automatically on your next deploy).

If `BLOB_READ_WRITE_TOKEN` is not set, the API falls back to the local JSON
file path, which will **not** persist reliably on Vercel — so make sure Blob
is enabled before relying on submissions in production.

## Viewing Workman submissions

Set an `ADMIN_SECRET` environment variable (in Vercel project settings, or
locally in `.env`) to any value you choose, then visit:

```
https://your-deployment.vercel.app/api/admin/signals?secret=YOUR_ADMIN_SECRET
```

This returns raw JSON of every Workman's record, newest activity first — handle,
Workman ID, both responses, and timestamps. If `ADMIN_SECRET` is not set, this
endpoint is disabled entirely (returns `404`) so nothing is ever accidentally
left open on a deployment that forgot to configure it. There's no separate
admin login page or dashboard — this keeps things simple per the brief; the
JSON is easy to skim as-is, or pipe into `jq`/a spreadsheet if you want a table.

## Environment variables

| Variable              | Required | Where               | Purpose                                    |
|------------------------|----------|----------------------|---------------------------------------------|
| `BLOB_READ_WRITE_TOKEN` | Production only | Auto-set by Vercel when Blob storage is enabled | Lets the API persist submissions on Vercel |
| `ADMIN_SECRET`          | Optional | Vercel project settings, or local `.env` | Enables `/api/admin/signals`; endpoint is disabled without it |
| `VITE_API_URL`          | Local dev only | `.env` (already set) | Points the frontend at the local API server; leave unset in production |

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New Project** → import the repo.
3. Vercel auto-detects Vite for the frontend and picks up every file under
   `api/` (and `api/workman/`, `api/admin/`) as its own serverless function
   automatically. No environment variables are required to deploy — leave
   `VITE_API_URL` unset so the frontend calls `/api/...` on the same origin.
4. **Enable Vercel Blob** (Storage → Create Database → Blob) so Experiment 01
   / Experiment 02 submissions actually persist — see above. Without this,
   the app still works, but submissions won't reliably survive between
   requests in production.
5. (Optional) Set `ADMIN_SECRET` if you want to view submissions via
   `/api/admin/signals`.
6. Deploy. Still one project, one URL, frontend and API together.

`vercel.json` includes a rewrite so any non-`/api` path falls back to
`index.html` (needed for a single-page app) — unchanged from before.

## Production build (local check)

```bash
npm run build
npm run preview
```

## Screens

1. **Landing** — `ARE YOU A WORKMAN?` with an `@` handle input and
   `ENTER THE WORKSHOP` button. *(unchanged)*
2. **Processing** — a ~1 second transition: `IDENTIFYING WORKMAN…` →
   `OPENING WORKSHOP…`. *(unchanged)*
3. **Workman result** — `WELCOME, WORKMAN.` with handle, Workman ID, and
   `STATUS: ACTIVE`. *(unchanged)*
4. **Workshop** — a dashboard with the Workman's identity and three
   experiment cards. Now reflects live completion state:
   - Experiment 01 (`THE WORK`): `ACTIVE` → `COMPLETED ✓`, always clickable.
   - Experiment 02 (`THE SIGNAL`): `LOCKED` (shown as `CLASSIFIED`) until
     Experiment 01 is completed, then `UNLOCKED` and clickable, then
     `COMPLETED ✓` once submitted.
   - Experiment 03: remains `COMING SOON` / `STANDBY`, not built yet.
5. **Task view** *(new, shared by both experiments)* — `TASK 001` / `TASK 002`
   with a short prompt, a text field, a submit button, a brief "receiving"
   transition, and a completion screen with a `RETURN TO WORKSHOP` button.
   Built entirely from the same classes and components as the rest of the
   app (`CornerMarks`, `.headline`, `.support-text`, `.primary-button`,
   `.workman-card`) — no new visual language was introduced.

## Persistence across refresh / return visits

The Workman's handle (not their full state) is saved in `localStorage` on
entry. On reload, the app silently re-registers with that handle — which
deterministically returns the same Workman ID — and fetches the real
completion state from `/api/workman/state`. Nothing about identity or
completion is trusted from local storage itself; it's only a pointer back
into the existing handle/ID system, not a second identity system.

## Design direction

Industrial, editorial, minimal. Black / off-black / white / off-white / grey,
with a single restrained accent color. Monospace for system labels and
coordinates, a strong display font for headlines. No gradients, no neon,
no generic Web3 visual language. *(unchanged — the new task screens and
updated experiment cards reuse this system exactly.)*

## Notes

- There is intentionally no wallet connection, blockchain call, or real
  identity/eligibility verification anywhere in this project.
- Errors are only shown for empty input, input that doesn't look like a
  valid handle, or an empty/too-long task response — never for "not
  eligible," since there is no eligibility concept here.
- Experiment 03 is intentionally not built yet — it remains `COMING SOON` /
  `STANDBY`.
