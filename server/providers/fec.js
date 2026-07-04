import { fetchJson } from '../lib/httpClient.js'
import { normalizeError } from '../lib/errors.js'
import { wrap, buildKey } from '../db/cache.js'
import { KEYS, TTL, hasKey } from '../config.js'

const PROVIDER = 'fec'
const BASE_URL = 'https://api.open.fec.gov/v1'

function normalizeCandidate(c) {
  return {
    id: c.candidate_id,
    name: c.name,
    party: c.party_full || c.party || null,
    office: c.office_full || c.office || null,
    level: 'federal',
    incumbent: c.incumbent_challenge_full === 'Incumbent',
    photoUrl: null,
    website: null,
    sources: ['fec'],
  }
}

export async function getCandidatesByOffice({ office, state, district, cycle } = {}) {
  if (!hasKey(PROVIDER)) {
    return { ok: false, source: PROVIDER, error: { message: 'FEC_API_KEY not configured', status: 501 } }
  }
  if (!office) {
    return { ok: false, source: PROVIDER, error: { message: 'office is required (H, S, or P)', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'getCandidatesByOffice', { office, state, district, cycle })
  return wrap(key, PROVIDER, TTL.CANDIDATES, async () => {
    try {
      const params = new URLSearchParams({ api_key: KEYS.fec, office, per_page: '50' })
      if (state) params.set('state', state)
      if (district) params.set('district', district)
      if (cycle) params.set('cycle', cycle)
      const url = `${BASE_URL}/candidates/?${params.toString()}`
      const json = await fetchJson(PROVIDER, url)
      return {
        ok: true,
        source: PROVIDER,
        data: (json.results || []).map(normalizeCandidate),
      }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}

export async function getCandidateById(candidateId) {
  if (!hasKey(PROVIDER)) {
    return { ok: false, source: PROVIDER, error: { message: 'FEC_API_KEY not configured', status: 501 } }
  }
  if (!candidateId) {
    return { ok: false, source: PROVIDER, error: { message: 'candidateId is required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'getCandidateById', { candidateId })
  return wrap(key, PROVIDER, TTL.CANDIDATES, async () => {
    try {
      const url = `${BASE_URL}/candidate/${encodeURIComponent(candidateId)}/?api_key=${encodeURIComponent(KEYS.fec)}`
      const json = await fetchJson(PROVIDER, url)
      const result = json.results?.[0]
      if (!result) {
        return { ok: false, source: PROVIDER, error: { message: 'Candidate not found', status: 404 } }
      }
      return { ok: true, source: PROVIDER, data: normalizeCandidate(result) }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}

export async function getCandidateFinance(candidateId) {
  if (!hasKey(PROVIDER)) {
    return { ok: false, source: PROVIDER, error: { message: 'FEC_API_KEY not configured', status: 501 } }
  }
  if (!candidateId) {
    return { ok: false, source: PROVIDER, error: { message: 'candidateId is required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'getCandidateFinance', { candidateId })
  return wrap(key, PROVIDER, TTL.FINANCE, async () => {
    try {
      const url = `${BASE_URL}/candidate/${encodeURIComponent(candidateId)}/totals/?api_key=${encodeURIComponent(KEYS.fec)}`
      const json = await fetchJson(PROVIDER, url)
      const totals = json.results?.[0]
      if (!totals) {
        return { ok: false, source: PROVIDER, error: { message: 'Finance data not found', status: 404 } }
      }
      return {
        ok: true,
        source: PROVIDER,
        data: {
          totalRaised: totals.receipts ?? null,
          totalSpent: totals.disbursements ?? null,
          cashOnHand: totals.cash_on_hand_end_period ?? null,
          cycle: totals.cycle ?? null,
        },
      }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}
