# HOODS WORKS — THE WORKMEN

A minimal, industrial-feeling mini web experience.

**Flow:** Enter your X handle → WELCOME, WORKMAN → Workman ID → ENTER THE WORKSHOP.

No wallet connection. No blockchain. No NFT minting. No real eligibility check —
every valid handle becomes an active Workman with a deterministic ID.

This project is a single deployable unit: a React + Vite frontend with one
Vercel serverless function (`/api/workman`). No separate backend host needed.

## Project structure

```
hoods-works/
├── api/
│   ├── workman.js           the serverless function (POST /api/workman)
│   ├── _workman-logic.js    shared handle-cleaning / ID logic (not a route — leading _ excludes it)
│   └── dev-server.js        local-only Express server so `npm run dev` works without the Vercel CLI
├── src/
│   ├── components/          Landing, Processing, WorkmanResult, Workshop
│   ├── App.jsx               view-state flow: landing → processing → result → workshop
│   ├── api.js                 fetch wrapper, same-origin in production
│   └── index.css / App.css   design system + screen styles
├── vercel.json               SPA rewrite so client-side routing/refresh works
└── package.json
```

## Requirements

- Node.js 18+
- npm

## Local development

```bash
npm install
npm run dev
```

This runs the Vite dev server (`http://localhost:5173`) **and** a small local
Express server (`http://localhost:4000`) together, so `/api/workman` works
locally exactly like it will on Vercel. The frontend is pointed at the local
API via `VITE_API_URL` in `.env`.

The local API server (`api/dev-server.js`) is dev-only. It is not deployed —
on Vercel, `api/workman.js` is served directly as a serverless function.

## API

```
POST /api/workman
Body:     { "handle": "@seunoguntade" }
Response: { "handle": "seunoguntade", "workmanId": "38990", "status": "ACTIVE" }
```

Handle rules:
- Whitespace is trimmed, a leading `@` is stripped, and the handle is lowercased.
- Must be 1–15 characters of letters, numbers, or underscores (standard X handle shape).
- Every handle that passes that shape check is accepted — there is no eligibility
  list, no X/Twitter API call, and no follower or NFT check.
- The Workman ID is a deterministic 5-digit number derived from a hash of the
  cleaned handle, so the same handle always returns the same ID. Nothing is
  persisted — there's no database, since the ID doesn't need to be stored to
  be reproducible.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New Project** → import the repo.
3. Vercel auto-detects Vite for the frontend and picks up `api/workman.js` as
   a serverless function automatically. No environment variables are required
   for production — leave `VITE_API_URL` unset so the frontend calls `/api/workman`
   on the same origin.
4. Deploy. That's it — one project, one URL, frontend and API together.

`vercel.json` includes a rewrite so any non-`/api` path falls back to
`index.html` (needed for a single-page app).

## Production build (local check)

```bash
npm run build
npm run preview
```

## Screens

1. **Landing** — `ARE YOU A WORKMAN?` with an `@` handle input and
   `ENTER THE WORKSHOP` button.
2. **Processing** — a ~1 second transition: `IDENTIFYING WORKMAN…` →
   `OPENING WORKSHOP…`. Purely visual, no real verification happens here.
3. **Workman result** — `WELCOME, WORKMAN.` with handle, Workman ID, and
   `STATUS: ACTIVE`.
4. **Workshop** — a dashboard with the Workman's identity and three
   experiment cards (`ACTIVE`, `LOCKED`, `STANDBY`).

## Design direction

Industrial, editorial, minimal. Black / off-black / white / off-white / grey,
with a single restrained accent color. Monospace for system labels and
coordinates, a strong display font for headlines. No gradients, no neon,
no generic Web3 visual language.

## Notes

- There is intentionally no wallet connection, blockchain call, or real
  identity/eligibility verification anywhere in this project.
- Errors are only shown for empty input or input that doesn't look like a
  valid handle — never for "not eligible," since there is no eligibility
  concept here.
