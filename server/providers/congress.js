import { fetchJson } from '../lib/httpClient.js'
import { normalizeError } from '../lib/errors.js'
import { wrap, buildKey } from '../db/cache.js'
import { KEYS, TTL, hasKey } from '../config.js'

const PROVIDER = 'congress'
const BASE_URL = 'https://api.congress.gov/v3'
const LEGISLATION_LIMIT = 5

function notConfigured() {
  return { ok: false, source: PROVIDER, error: { message: 'CONGRESS_API_KEY not configured', status: 501 } }
}

function normalizeNamePart(s) {
  return String(s || '').toLowerCase().replace(/[^a-z ]/g, '').trim()
}

// FEC and Congress.gov both format member names as "Last, First ...", but
// casing/middle-name/suffix conventions differ, so match on last name plus
// first-initial rather than requiring an exact string match.
export function namesMatch(fecName, memberName) {
  const [fecLast, fecFirst] = String(fecName || '').split(',').map(normalizeNamePart)
  const [memLast, memFirst] = String(memberName || '').split(',').map(normalizeNamePart)
  if (!fecLast || !memLast || fecLast !== memLast) return false
  if (!fecFirst || !memFirst) return true
  return memFirst[0] === fecFirst[0]
}

export function matchMemberByName(members, fecName) {
  return members.find((m) => namesMatch(fecName, m.name)) || null
}

/**
 * Current federal legislators for a state (House + Senate), with bioguide
 * IDs used to look up their sponsored/cosponsored legislation.
 */
export async function findMembersByState({ state } = {}) {
  if (!hasKey(PROVIDER)) return notConfigured()
  if (!state) {
    return { ok: false, source: PROVIDER, error: { message: 'state is required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'findMembersByState', { state })
  return wrap(key, PROVIDER, TTL.LEGISLATORS, async () => {
    try {
      const params = new URLSearchParams({
        currentMember: 'true',
        limit: '250',
        format: 'json',
        api_key: KEYS.congress,
      })
      const url = `${BASE_URL}/member/${encodeURIComponent(state)}?${params.toString()}`
      const json = await fetchJson(PROVIDER, url)
      const members = (json.members || []).map((m) => ({
        bioguideId: m.bioguideId,
        name: m.name,
        partyName: m.partyName || null,
        state: m.state || state,
        photoUrl: m.depiction?.imageUrl || null,
      }))
      return { ok: true, source: PROVIDER, data: members }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}

// The API mixes amendments into sponsored/cosponsored legislation lists;
// amendments carry no title/bill-type, so drop them and keep actual bills.
function normalizeBill(item, role) {
  if (!item.type || !item.title) return null
  return {
    role,
    billId: `${item.type}${item.number}`,
    congress: item.congress ?? null,
    title: item.title,
    latestAction: item.latestAction?.text || null,
    latestActionDate: item.latestAction?.actionDate || null,
    url: item.url || null,
  }
}

// Fetch enough raw entries that, after amendments are filtered out, `limit`
// real bills remain per sponsor/cosponsor list.
const FETCH_MULTIPLIER = 5

/**
 * Real bills a sitting member has sponsored or cosponsored, most recent
 * first - used as grounded "voting record" evidence (see context.md's
 * matching rules) instead of relying on an LLM's memory of their record.
 */
export async function getMemberLegislation(bioguideId, { limit = LEGISLATION_LIMIT } = {}) {
  if (!hasKey(PROVIDER)) return notConfigured()
  if (!bioguideId) {
    return { ok: false, source: PROVIDER, error: { message: 'bioguideId is required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'getMemberLegislation', { bioguideId, limit })
  return wrap(key, PROVIDER, TTL.LEGISLATORS, async () => {
    try {
      const fetchLimit = limit * FETCH_MULTIPLIER
      const qs = new URLSearchParams({ limit: String(fetchLimit), format: 'json', api_key: KEYS.congress }).toString()
      const [sponsoredJson, cosponsoredJson] = await Promise.all([
        fetchJson(PROVIDER, `${BASE_URL}/member/${bioguideId}/sponsored-legislation?${qs}`),
        fetchJson(PROVIDER, `${BASE_URL}/member/${bioguideId}/cosponsored-legislation?${qs}`),
      ])
      const sponsored = (sponsoredJson.sponsoredLegislation || [])
        .map((b) => normalizeBill(b, 'sponsor'))
        .filter(Boolean)
        .slice(0, limit)
      const cosponsored = (cosponsoredJson.cosponsoredLegislation || [])
        .map((b) => normalizeBill(b, 'cosponsor'))
        .filter(Boolean)
        .slice(0, limit)
      return { ok: true, source: PROVIDER, data: [...sponsored, ...cosponsored] }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}
