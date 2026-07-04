import { fetchJson } from '../lib/httpClient.js'
import { normalizeError } from '../lib/errors.js'
import { wrap, buildKey } from '../db/cache.js'
import { KEYS, TTL, hasKey } from '../config.js'

const PROVIDER = 'ballotpedia'
const BASE_URL = 'https://api.ballotpedia.org/v1'

// Ballotpedia has no free tier. If no key is configured we short-circuit
// without making a network call so this provider never blocks the app.
export async function getCandidateBio({ name, state } = {}) {
  if (!hasKey(PROVIDER)) {
    return { ok: false, source: PROVIDER, unavailable: true, error: { message: 'BALLOTPEDIA_API_KEY not configured', status: 501 } }
  }
  if (!name) {
    return { ok: false, source: PROVIDER, error: { message: 'name is required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'getCandidateBio', { name, state })
  return wrap(key, PROVIDER, TTL.BIO, async () => {
    try {
      const params = new URLSearchParams({ token: KEYS.ballotpedia, name })
      if (state) params.set('state', state)
      const url = `${BASE_URL}/candidates?${params.toString()}`
      const json = await fetchJson(PROVIDER, url)
      const result = json.results?.[0] || json.data?.[0]
      if (!result) {
        return { ok: false, source: PROVIDER, error: { message: 'Bio not found', status: 404 } }
      }
      return {
        ok: true,
        source: PROVIDER,
        data: {
          bio: result.biography || result.bio || null,
          contact: result.contact || null,
          socialMedia: result.social_media || null,
        },
      }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}
