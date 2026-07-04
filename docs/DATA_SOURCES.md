# Civic data sources: status, gaps, and demo strategy

Context for anyone (human or agent) working on the backend data layer or candidate matching. Verified 2026-07-03. Companion to `docs/BACKEND_PLAN.md` (which describes the Express proxy in `server/`).

## Google Civic API status — verified alive, with a caveat

Contrary to earlier concern, the **Elections endpoints are NOT shut down**. Only the **Representatives API** (`representativeInfoByAddress`, `representativeInfoByDivision`) was turned down, in April 2025. Google explicitly stated the Elections and Divisions APIs continue to be supported.

- `GET /civicinfo/v2/elections` — alive (anonymous probe returns key-validation error, not 404).
- `GET /civicinfo/v2/voterinfo` — alive; returns polling locations, contests, candidates for a registered address.
- `GET /civicinfo/v2/divisionsByAddress` — new endpoint added as the Representatives replacement; returns OCD-IDs for an address (useful to join against third-party datasets).

**Caveat:** `voterinfo` only returns data for elections supported by the Voting Information Project, and mostly in the window around an election. Off-cycle (like right now, July 2026, before the November midterms ramp up) it may return little or nothing for a given address. Do not assume it fails — but do not assume it's populated either. Test with a real key: none is configured yet (`.env` keys are empty).

Sources: [turndown notice](https://groups.google.com/g/google-civicinfo-api/c/9fwFn-dhktA), [Civic Info API docs](https://developers.google.com/civic-information), [voterInfoQuery docs](https://developers.google.com/civic-information/docs/v2/elections/voterInfoQuery).

## What our current providers give us (and don't)

| Provider | Gives | Missing |
|---|---|---|
| Google Civic | Election list; per-address contests + candidate name/party/website/photo; polling places | Policy positions; coverage outside VIP-supported election windows |
| FEC | Federal candidate lists (name, party, office, incumbent), campaign finance totals | Photos, websites, stances; anything non-federal |
| Open States | **Current sitting** state legislators by lat/lng or state (name, party, photo, website) | Challengers/candidates in upcoming races (`getStateCandidatesByOffice` actually returns officeholders); stances |
| Ballotpedia | Nothing in practice — short-circuits without a paid key | Everything |

**The two structural gaps:**
1. **No policy positions from any provider.** Candidate–voter matching has zero structured input. This must come from an AI enrichment layer or placeholder data (see below).
2. **Local races (mayor, city council, school board) are only covered by Civic `voterinfo`**, and only during supported election windows.

## Local ballot data options (researched)

- **[civicAPI](https://www.civicapi.org/)** — free, open, no API key, claims coverage down to school board/town council. Newest and least proven; homepage verified up, endpoint details not yet probed (follow-up task).
- **[Democracy Works Elections API](https://www.democracy.works/elections-api)** — nationwide coverage incl. municipal/school board for jurisdictions >5k people. Paid/partner access; must request a key.
- **[BallotReady API](https://organizations.ballotready.org/ballotready-api)** — the gold standard for our exact use case: candidate profiles, bios, **issue stances**, endorsements. Paid.
- **[Ballotpedia data services](https://developer.ballotpedia.org/)** — bulk data + API, annual subscription.
- **DIY:** Census geocoder (free) for address → district, joined with Open States + Civic `divisionsByAddress` OCD-IDs.

## Demo strategy (decided)

We need a working demo, not production data coverage. Approach, in order:

1. **Placeholder-but-real seed data.** Curate 1–2 real upcoming elections (real candidates, real offices, real stances researched manually or with AI once, offline) for the demo location(s), stored as JSON/SQLite seed the API serves in the same normalized shapes as live providers. The frontend cannot tell the difference, and the demo never breaks on an empty `voterinfo` response.
2. **Live providers behind it.** Keep the real provider calls; when they return data, prefer it. The `warnings` mechanism already handles partial availability.
3. **Optional AI web-search enrichment.** For candidate stances / local election discovery, an AI (Claude with web search) can research a candidate or locale live and return the same normalized shape with cited sources. Nice-to-have wow factor; the demo must not depend on it.

**Implication for candidate matching:** whoever defines the political-stance rating constraints should assume candidate positions arrive as our normalized candidate object plus a stance blob (AI-researched or seeded), NOT from a structured API field — no provider supplies stances.

## Open follow-ups

- [ ] Probe civicAPI endpoints (docs page) — could replace/augment seed data for local races.
- [ ] Get a real `GOOGLE_CIVIC_API_KEY` + `FEC_API_KEY` into `.env` and hit `/api/health`, `/api/elections` end-to-end.
- [ ] Build the seed dataset for the demo location (needs: which city/state we demo with).
- [ ] Decide the stance-blob schema jointly with the political-scale rating work (in progress by another teammate).
