import { fetchJson } from '../lib/httpClient.js'
import { normalizeError } from '../lib/errors.js'
import { wrap, buildKey } from '../db/cache.js'
import { KEYS, TTL, hasKey } from '../config.js'

const PROVIDER = 'openstates'
const BASE_URL = 'https://v3.openstates.org'

function normalizePerson(p) {
  return {
    id: p.id,
    name: p.name,
    party: p.party || null,
    office: p.current_role?.title || null,
    level: 'state',
    incumbent: true,
    photoUrl: p.image || null,
    website: p.links?.[0]?.url || null,
    sources: ['openstates'],
  }
}

export async function getLegislatorsByLocation({ lat, lng } = {}) {
  if (!hasKey(PROVIDER)) {
    return { ok: false, source: PROVIDER, error: { message: 'OPENSTATES_API_KEY not configured', status: 501 } }
  }
  if (!lat || !lng) {
    return { ok: false, source: PROVIDER, error: { message: 'lat and lng are required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'getLegislatorsByLocation', { lat, lng })
  return wrap(key, PROVIDER, TTL.LEGISLATORS, async () => {
    try {
      const params = new URLSearchParams({ lat, lng })
      const url = `${BASE_URL}/people.geo?${params.toString()}`
      const json = await fetchJson(PROVIDER, url, { headers: { 'X-API-KEY': KEYS.openstates } })
      return {
        ok: true,
        source: PROVIDER,
        data: (json.results || []).map(normalizePerson),
      }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}

export async function getStateCandidatesByOffice({ state, chamber, district } = {}) {
  if (!hasKey(PROVIDER)) {
    return { ok: false, source: PROVIDER, error: { message: 'OPENSTATES_API_KEY not configured', status: 501 } }
  }
  if (!state) {
    return { ok: false, source: PROVIDER, error: { message: 'state is required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'getStateCandidatesByOffice', { state, chamber, district })
  return wrap(key, PROVIDER, TTL.CANDIDATES, async () => {
    try {
      const params = new URLSearchParams({ jurisdiction: state, per_page: '50' })
      if (chamber) params.set('org_classification', chamber)
      if (district) params.set('district', district)
      const url = `${BASE_URL}/people?${params.toString()}`
      const json = await fetchJson(PROVIDER, url, { headers: { 'X-API-KEY': KEYS.openstates } })
      return {
        ok: true,
        source: PROVIDER,
        data: (json.results || []).map(normalizePerson),
      }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}

export async function getLegislatorById(openstatesId) {
  if (!hasKey(PROVIDER)) {
    return { ok: false, source: PROVIDER, error: { message: 'OPENSTATES_API_KEY not configured', status: 501 } }
  }
  if (!openstatesId) {
    return { ok: false, source: PROVIDER, error: { message: 'openstatesId is required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'getLegislatorById', { openstatesId })
  return wrap(key, PROVIDER, TTL.LEGISLATORS, async () => {
    try {
      const url = `${BASE_URL}/people/${encodeURIComponent(openstatesId)}`
      const json = await fetchJson(PROVIDER, url, { headers: { 'X-API-KEY': KEYS.openstates } })
      return { ok: true, source: PROVIDER, data: normalizePerson(json) }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}
