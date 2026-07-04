import { fetchJson } from '../lib/httpClient.js'
import { normalizeError } from '../lib/errors.js'
import { wrap, buildKey } from '../db/cache.js'
import { KEYS, TTL, hasKey } from '../config.js'

const PROVIDER = 'civic'
const BASE_URL = 'https://www.googleapis.com/civicinfo/v2'

function normalizeElection(e) {
  return {
    id: e.id,
    name: e.name,
    electionDay: e.electionDay,
    ocdDivisionId: e.ocdDivisionId,
  }
}

function normalizeContest(c) {
  return {
    office: c.office,
    level: c.level?.[0] || null,
    district: c.district?.name || null,
    candidates: (c.candidates || []).map((cand) => ({
      name: cand.name,
      party: cand.party || null,
      website: cand.candidateUrl || null,
      photoUrl: cand.photoUrl || null,
    })),
  }
}

export async function getElections() {
  if (!hasKey(PROVIDER)) {
    return { ok: false, source: PROVIDER, error: { message: 'GOOGLE_CIVIC_API_KEY not configured', status: 501 } }
  }

  const key = buildKey(PROVIDER, 'getElections', {})
  return wrap(key, PROVIDER, TTL.ELECTIONS, async () => {
    try {
      const url = `${BASE_URL}/elections?key=${encodeURIComponent(KEYS.civic)}`
      const json = await fetchJson(PROVIDER, url)
      return {
        ok: true,
        source: PROVIDER,
        data: (json.elections || []).map(normalizeElection),
      }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}

export async function getVoterInfo({ address, electionId } = {}) {
  if (!hasKey(PROVIDER)) {
    return { ok: false, source: PROVIDER, error: { message: 'GOOGLE_CIVIC_API_KEY not configured', status: 501 } }
  }
  if (!address) {
    return { ok: false, source: PROVIDER, error: { message: 'address is required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'getVoterInfo', { address, electionId })
  return wrap(key, PROVIDER, TTL.VOTER_INFO, async () => {
    try {
      const params = new URLSearchParams({ key: KEYS.civic, address })
      if (electionId) params.set('electionId', electionId)
      const url = `${BASE_URL}/voterinfo?${params.toString()}`
      const json = await fetchJson(PROVIDER, url)
      return {
        ok: true,
        source: PROVIDER,
        data: {
          election: json.election ? normalizeElection(json.election) : null,
          pollingLocations: json.pollingLocations || [],
          contests: (json.contests || []).map(normalizeContest),
        },
      }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}
