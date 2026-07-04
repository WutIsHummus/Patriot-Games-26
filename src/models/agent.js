// Client for the server-side voter-guide engine (server/models/agent.js).
// The OpenRouter key and system prompt live on the server; the browser only
// talks to our own /api/agent endpoint.

/**
 * Get the curated ballot for a voter.
 *
 * @param {object} input
 * @param {object} input.location - { zip, state, county }
 * @param {object} input.profile - output of POST /api/scoring/quiz
 * @param {object} input.ballot - races + candidates (from /api/elections + /api/candidates or seed data)
 * @returns {Promise<Array>} races: per-race topPick, notableAlternative, and all options scored
 */
export async function getRecommendedBallot({ location, profile, ballot }) {
  const response = await fetch('/api/agent/ballot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, profile, ballot }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.ok) {
    const message = data.warnings?.[0]?.error?.message ?? data.error?.message
    throw new Error(message ?? `Request failed with status ${response.status}`)
  }
  return data.races
}
