# Deploying to Vercel

This project deploys as a static Vite build plus a single serverless function that wraps the existing Express app.

## How it's wired

- `api/index.js` re-exports the Express app from `server/app.js` as a Vercel serverless function (Vercel's Node runtime supports Express apps directly as a default-exported handler).
- `vercel.json`:
  - Builds the frontend with `npm run build`, serves `dist/`.
  - Rewrites `/api/*` to the `api/index.js` function.
  - Rewrites everything else to `/index.html` (client-side routing via `react-router-dom`).
- `server/config.js` already detects `process.env.VERCEL` and points the SQLite cache at `/tmp/civic-cache` instead of `server/data`, since Vercel's filesystem is read-only outside `/tmp`.

## Important caveat: the SQLite cache is NOT durable on Vercel

- `/tmp` is ephemeral per function instance and is **not shared** across concurrent invocations or redeploys.
- In practice this means the cache still works as a short-lived, per-instance cache (helpful within a burst of requests handled by the same warm instance) but should not be relied on as a persistent store.
- This is fine for the current use case (cutting down repeat calls to rate-limited APIs like Ballotpedia within a session), but if durable caching across all users/instances becomes important later, swap the cache backend for a hosted store (e.g. Vercel KV / Upstash Redis) behind the same `get/set/wrap` interface in `server/db/cache.js` — no route or provider code would need to change.

## Known risk: `better-sqlite3` is a native module

`better-sqlite3` ships a compiled binary. Vercel's Node serverless build usually rebuilds/installs native deps correctly on its own Linux build image, so a normal deploy should work — but if you see a runtime error like `invalid ELF header` or `was compiled against a different Node.js version`, that's this. Fixes, in order of preference:
1. Just redeploy — Vercel installs dependencies fresh on its own build image, so a binary built locally on Windows is not what ships; this only breaks if something is caching a Windows-built binary (e.g. a committed `node_modules`, which is already gitignored here).
2. Pin the Vercel project's Node version (Settings → General → Node.js Version) to match what you test with locally.
3. If it still fails, swap the cache store for something with no native binary (e.g. Vercel KV/Upstash) — see the durability note above; the `get/set/wrap` interface in `server/db/cache.js` is the only thing that would need to change.

## One-time setup

1. Push this repo to GitHub (or wherever Vercel pulls from) and import it in the Vercel dashboard, or run `vercel` from the project root with the Vercel CLI.
2. In the Vercel project's **Settings → Environment Variables**, add (Production + Preview as needed):
   - `GOOGLE_CIVIC_API_KEY`
   - `FEC_API_KEY`
   - `OPENSTATES_API_KEY`
   - `BALLOTPEDIA_API_KEY` (optional)
   - Do **not** add a `VITE_`-prefixed version of any of these — that would bundle them into client JS.
3. Deploy. Vercel runs `npm install` then `npm run build` per `vercel.json`.

## Verifying after deploy

```
curl https://<your-app>.vercel.app/api/health
```
Should return `{ "ok": true, "providers": { ... } }` reflecting which keys are set in the Vercel project.
