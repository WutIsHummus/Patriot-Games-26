# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: AI Voter–Candidate Matching Platform

Hackathon prompt: **"Build an AI tool that helps American democracy work better."**

We are building an AI platform that helps voters find politicians who align with their beliefs.

### Product flow

1. **SMS login** — voters authenticate via SMS (phone number + code). Chosen for zero friction.
2. **Personalized political quiz** — the quiz is AI-curated per user based on:
   - The user's location (surfaces local problems/issues)
   - General issues in their community (included only when relevant)
   - The latest controversial news, national and local
   The quiz measures the user's political beliefs and their stances on current issues.
3. **Election lookup** — after the quiz, use an elections API to find upcoming elections near the user's location.
4. **Scoring** — score the user on a political scale, but also preserve their individual issue preferences from the quiz (alignment is not just one axis).
5. **Per-election short quizzes** — an election may hinge on current/local problems where the user's general political alignment is too vague to match well. In that case, offer an optional short quiz for that election. Only prompt when it genuinely matters, and only if the user opts in.
6. **Curated candidate list** — after quizzing, the voter gets a curated list of candidates, organized per office/title, with more information about each candidate. The goal is to inform, not decide: voters pick for themselves at the end.
   - **Never recommend a single candidate.** The AI narrows the field to a few good options per office — not one. A single candidate is shown only when there genuinely aren't multiple good matches (e.g., an uncontested race).
   - When there are multiple good options, present an **at-a-glance comparison** (key stances, alignment highlights, where they differ), with an optional **deeper comparison** the voter can drill into if needed.
   - The output is always a comparison that supports an educated decision — never a "vote for this person" answer.

### Key product principles

- Quizzes are retakeable at any time.
- Low friction everywhere (SMS auth, opt-in extras, short quizzes).
- The AI curates and informs; the final choice always belongs to the voter. It never pushes one specific candidate — it narrows to a few good options and compares them (at a glance, deeper on demand), unless only one good option truly exists.
- Location-awareness drives both quiz content (local issues) and election discovery.

### Data-source status & demo strategy

See `docs/DATA_SOURCES.md`. Key facts: Google Civic Elections endpoints are alive (only the Representatives API was shut down in April 2025), but `voterinfo` is only populated near supported elections; no provider supplies candidate policy stances, so matching input comes from AI-researched or seeded stance data; the demo runs on real-but-curated seed data served in the same normalized shapes, with live providers preferred when they return data.

### Open decisions (not yet settled)

- **SMS auth implementation** — provider/stack not chosen yet (Supabase OTP, Firebase Phone Auth, Twilio Verify, or faked for demo).
- **Quiz engine** — how questions are generated (fully AI-generated vs. fixed bank vs. hybrid) and how scoring axes are defined.
- **Candidate position data for matching** — how we score candidates on the same axes as the user quiz (AI-researched profiles, precomputed issue vectors, or both).

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the Vite dev server only
- `npm run server` — start the Express API only (port 3001, watch mode)
- `npm run dev:all` — run both concurrently (normal dev workflow)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — run Oxlint (config in `.oxlintrc.json`)

There is no test runner configured in this project.

## Architecture

React + Vite + Tailwind CSS SPA, plus an Express backend in `server/` for external civic data.

### Backend (`server/`) — see `docs/BACKEND_PLAN.md` for full details

Express API on port 3001 that proxies and normalizes multiple civic-data providers (Google Civic for elections, FEC + Open States for candidates, Ballotpedia optional/best-effort), keeping API keys server-side. Key facts:

- Vite proxies `/api` → Express (configured in `vite.config.js`), so the frontend always fetches relative paths like `/api/candidates?...`.
- Provider functions (`server/providers/`) never throw — they return `{ ok: true, data, source }` or `{ ok: false, source, error }`. Routes merge providers and put per-provider failures in a `warnings` array; only all-providers-failed returns a 502.
- Responses are cached in a local SQLite file (`better-sqlite3`, `server/data/`, gitignored) with per-datatype TTLs defined in `server/config.js`. On Vercel this cache is ephemeral (see `docs/VERCEL_DEPLOYMENT.md`).
- Main routes: `GET /api/elections`, `GET /api/elections/:id/contests`, `GET /api/candidates`, `GET /api/representatives/:id` (+ `/finance`), `GET /api/health`.
- Server env vars (`GOOGLE_CIVIC_API_KEY`, `FEC_API_KEY`, `OPENSTATES_API_KEY`, `BALLOTPEDIA_API_KEY`, `PORT`) have **no** `VITE_` prefix — they must never reach the browser.

Quiz, scoring, and SMS auth are not part of this backend slice yet.

### Frontend (`src/`)

- `src/main.jsx` — entry point; wraps the app in `BrowserRouter` and mounts to `#root`.
- `src/App.jsx` — central route table using `react-router-dom`'s `<Routes>`. Add new routes here.
- `src/pages/` — route-level page components. Add new pages here and wire them into `App.jsx`.
- `src/index.css` — imports Tailwind (`@import "tailwindcss"`) and sets global body/html styles. Tailwind is integrated via the `@tailwindcss/vite` plugin (no separate PostCSS/Tailwind config file), configured in `vite.config.js`.
- Environment variables must be prefixed with `VITE_` to be exposed to client code (Vite convention). Copy `.env.example` to `.env` for local config.
