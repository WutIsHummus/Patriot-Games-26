# Backend: multi-provider civic data API

## Context
The app (per `CLAUDE.md`) needs to look up elections by location and build curated candidate lists per office. That data comes from multiple external APIs (Google Civic, FEC, Open States, optionally Ballotpedia), some requiring paid/rate-limited keys that must never reach the browser. The repo started with **no backend at all** — just a Vite/React SPA. We added an Express backend that: proxies/normalizes these providers behind a stable internal API, keeps keys server-side, and caches responses in a local SQLite file (no hosted DB).

## Directory layout
```
server/
  index.js              # Express app entry (port 3001, error middleware)
  config.js             # env loading (dotenv) + TTL constants + hasKey(provider)
  db/
    index.js            # better-sqlite3 connection, schema init, mkdir data/ if missing
    cache.js            # get/set/wrap(key, provider, ttlSeconds, fetcherFn)
  lib/
    httpClient.js       # fetchJson(url, opts, timeoutMs) using native fetch, throws ProviderError on failure
    errors.js           # ProviderError class, normalizeError(provider, err)
  providers/
    civic.js             # Google Civic: getElections(), getVoterInfo({address, electionId})
    fec.js                # FEC: getCandidatesByOffice(...), getCandidateById(...), getCandidateFinance(...)
    openstates.js          # Plural/Open States: getLegislatorsByLocation(...), getStateCandidatesByOffice(...)
    ballotpedia.js          # Best-effort; short-circuits to {ok:false, unavailable:true} if no key
    index.js                # registry export { civic, fec, openstates, ballotpedia }
  routes/
    elections.js            # GET /api/elections, /api/elections/:id/contests
    candidates.js            # GET /api/candidates (aggregates fec + openstates, dedupes)
    representatives.js        # GET /api/representatives/:id, /api/representatives/:id/finance
    health.js                 # GET /api/health
  data/                        # gitignored, sqlite file lives here (created at runtime)
```

## Provider contract
Every provider function is async, wraps its call in `cache.wrap(...)`, and **never throws** — it catches and returns:
- Success: `{ ok: true, data: <normalized>, source: '<provider>' }`
- Failure: `{ ok: false, source: '<provider>', error: { message, status } }`

Normalized shapes (kept minimal, per product needs):
- Election: `{ id, name, electionDay, ocdDivisionId }`
- Candidate: `{ id, name, party, office, level, incumbent, photoUrl, website, sources: [...] }`
- Representative/bio: `{ id, name, party, office, bio, contact, socialMedia, financeSummary }`

Routes call providers directly (no generic dispatcher), merge results, and collect per-provider failures into a `warnings` array rather than failing the whole request. All-providers-failed -> `502 { ok:false, warnings }`; partial success -> `200` with data + warnings.

## SQLite cache
`better-sqlite3`, single `cache` table:
```sql
CREATE TABLE cache (
  cache_key  TEXT PRIMARY KEY,
  provider   TEXT NOT NULL,
  payload    TEXT NOT NULL,   -- JSON string
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
```
Key = `${provider}:${fn}:${JSON.stringify(sortedParams)}`. Lazy-expire on read. TTLs (constants in `config.js`): elections 6h, voter-info 1h, candidates 24h, finance 24h, bios 7d, legislators 24h.

Note: on Vercel, `server/data/*.sqlite` is ephemeral per invocation/instance (serverless filesystem is read-only except `/tmp`, and not shared across invocations) — the cache still works as a best-effort in-process/per-instance cache there, but isn't durable. See `docs/VERCEL_DEPLOYMENT.md`.

## Routes
| Method | Path | Params | Purpose |
|---|---|---|---|
| GET | `/api/elections` | `address?` | Upcoming elections (Civic) |
| GET | `/api/elections/:electionId/contests` | `address` | Contests/offices on ballot |
| GET | `/api/candidates` | `office, level, state, district, cycle` | Aggregated candidate list (FEC + Open States, optional Ballotpedia bio enrichment) |
| GET | `/api/representatives/:id` | `source=fec\|openstates` | Full bio/detail |
| GET | `/api/representatives/:id/finance` | `source=fec` | Finance summary |
| GET | `/api/health` | - | Liveness + which provider keys are configured |

Quiz/scoring/SMS-auth are out of scope here — this is only the external-data backend slice.

## Dev integration
Two dev servers, Vite proxies `/api` -> Express on port 3001 (`server.proxy` in `vite.config.js`). Frontend calls relative paths (`fetch('/api/candidates?...')`), works unchanged dev/prod.

## Dependencies/scripts
- deps: `express`, `cors`, `dotenv`, `better-sqlite3`
- devDep: `concurrently`
- scripts: `"server": "node --watch server/index.js"`, `"dev:all": "concurrently -n vite,api -c blue,green \"npm:dev\" \"npm:server\""`

## Env / gitignore
`.env.example`: `PORT`, `GOOGLE_CIVIC_API_KEY`, `FEC_API_KEY`, `OPENSTATES_API_KEY`, `BALLOTPEDIA_API_KEY` (server-side only, no `VITE_` prefix).
`.gitignore`: `server/data/*.sqlite*`.

## Error handling
`ProviderError` thrown by `httpClient.fetchJson` on non-2xx/timeout, caught inside each provider fn and normalized. Express-level error middleware in `index.js` catches anything uncaught -> `400/500 { ok:false, error:{message} }`.

## Verification
1. `npm install`, copy `.env.example` -> `.env`, fill in at least `GOOGLE_CIVIC_API_KEY` and `FEC_API_KEY`.
2. `npm run dev:all`.
3. `curl http://localhost:5173/api/health`
4. `curl "http://localhost:5173/api/elections?address=..."`
5. `curl "http://localhost:5173/api/candidates?office=...&state=...&level=federal"`

See also: `docs/VERCEL_DEPLOYMENT.md` for how this backend is adapted to run on Vercel.
