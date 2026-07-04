import { providers } from '../providers/index.js'
import { zipToState } from '../lib/zipToState.js'
import { SEED_BALLOT } from '../../src/data/seedBallot.js'

// Best-effort real ballot assembly: for each seed race, try a live source
// first; if it returns nothing usable, silently keep the seed race so the UI
// never shows an empty office. Federal Senate races use FEC (authoritative
// filings). State/county races have no candidate API (Open States only lists
// sitting officeholders), so those use AI web research to discover verified
// declared candidates - falling back to seed when fewer than two real
// candidates can be verified. See docs/DATA_SOURCES.md.

function raceKey(office, district) {
  return `${office}::${district || ''}`
}

function normalizeParty(p) {
  const s = String(p || '').toUpperCase()
  if (s.includes('DEM')) return 'Democratic'
  if (s.includes('REP')) return 'Republican'
  if (s.includes('IND')) return 'Independent'
  if (s.includes('LIB')) return 'Libertarian'
  if (s.includes('GREEN')) return 'Green'
  return p || 'Unaffiliated'
}

const MAX_CANDIDATES_PER_RACE = 6

// Sitting member's Congress.gov record - real bills sponsored/cosponsored
// (only available for incumbents; challengers have no federal legislative
// record) plus their official photo, keyed off the same name match.
async function getCongressRecord(fecCandidate, state, warnings) {
  if (!fecCandidate.incumbent || !state) return { legislativeRecord: [], photoUrl: null }

  const membersResult = await providers.congress.findMembersByState({ state })
  if (!membersResult.ok) {
    warnings.push(membersResult)
    return { legislativeRecord: [], photoUrl: null }
  }
  const member = providers.congress.matchMemberByName(membersResult.data, fecCandidate.name)
  if (!member) return { legislativeRecord: [], photoUrl: null }

  const legResult = await providers.congress.getMemberLegislation(member.bioguideId)
  if (!legResult.ok) {
    warnings.push(legResult)
    return { legislativeRecord: [], photoUrl: member.photoUrl || null }
  }
  return { legislativeRecord: legResult.data, photoUrl: member.photoUrl || null }
}

async function toBallotCandidate(fecCandidate, office, state, warnings) {
  const { legislativeRecord, photoUrl } = await getCongressRecord(fecCandidate, state, warnings)

  const research = await providers.openrouter.researchCandidateStances({
    name: fecCandidate.name,
    party: fecCandidate.party,
    office,
    state,
    legislativeRecord,
  })
  const r = research.ok ? research.data : null
  if (!research.ok) warnings.push(research)

  return {
    candidateId: `fec-${fecCandidate.id}`,
    name: fecCandidate.name,
    party: normalizeParty(fecCandidate.party),
    incumbent: Boolean(fecCandidate.incumbent),
    photoUrl,
    bio: r?.bio || '',
    stances: Array.isArray(r?.stances) ? r.stances : [],
    record: r?.record || '',
    legislativeRecord,
    sources: r?.sources || [],
  }
}

async function buildFederalSenateRace(state, seedRace, warnings) {
  const fecResult = await providers.fec.getCandidatesByOffice({ office: 'S', state, cycle: '2026' })
  if (!fecResult.ok || !fecResult.data?.length) {
    if (!fecResult.ok) warnings.push(fecResult)
    return { race: seedRace, live: false }
  }

  const byName = new Map()
  for (const c of fecResult.data) {
    if (!byName.has(c.name)) byName.set(c.name, c)
  }
  // FEC returns candidates in an arbitrary (roughly alphabetical) order, so a
  // plain slice can silently drop the incumbent among 50+ filings. Sort
  // incumbents first so the sitting senator is always in the shortlist.
  const candidates = [...byName.values()]
    .sort((a, b) => Number(b.incumbent) - Number(a.incumbent))
    .slice(0, MAX_CANDIDATES_PER_RACE)
  if (candidates.length < 2) return { race: seedRace, live: false }

  const built = await Promise.all(candidates.map((c) => toBallotCandidate(c, seedRace.office, state, warnings)))
  return {
    race: { ...seedRace, candidates: built },
    live: true,
  }
}

// Slug for stable candidateIds on researched (non-FEC) candidates.
function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// State/county races: no candidate API exists, so use AI web research to
// discover verified declared candidates, then research each one's stances.
async function buildResearchedRace(seedRace, state, county, warnings) {
  const discovery = await providers.openrouter.researchRaceCandidates({
    office: seedRace.office,
    state,
    district: seedRace.district,
    county: seedRace.level === 'county' ? county : undefined,
    electionDay: SEED_BALLOT.electionDay,
  })
  if (!discovery.ok) {
    warnings.push(discovery)
    return { race: seedRace, live: false }
  }

  const found = (discovery.data?.candidates || [])
    .filter((c) => c?.name)
    .slice(0, MAX_CANDIDATES_PER_RACE)
  if (found.length < 2) return { race: seedRace, live: false }

  const built = await Promise.all(
    found.map(async (c) => {
      const research = await providers.openrouter.researchCandidateStances({
        name: c.name,
        party: c.party,
        office: seedRace.office,
        state,
      })
      const r = research.ok ? research.data : null
      if (!research.ok) warnings.push(research)
      return {
        candidateId: `web-${slugify(c.name)}`,
        name: c.name,
        party: normalizeParty(c.party),
        incumbent: Boolean(c.incumbent),
        bio: r?.bio || '',
        stances: Array.isArray(r?.stances) ? r.stances : [],
        record: r?.record || '',
        sources: [...new Set([...(discovery.data?.sources || []), ...(r?.sources || [])])],
      }
    }),
  )

  return { race: { ...seedRace, candidates: built }, live: true }
}

// Attempt live data for one race; always returns a usable race (falls back
// to the seed race on any failure or insufficient live data).
async function buildRace(seedRace, state, county, warnings) {
  if (!state) return { race: seedRace, live: false }
  if (seedRace.office === 'U.S. Senate') {
    return buildFederalSenateRace(state, seedRace, warnings)
  }
  return buildResearchedRace(seedRace, state, county, warnings)
}

/**
 * Assemble a best-effort real ballot for a location, falling back to seed
 * data per-race when no live provider covers that office.
 *
 * @param {object} location - { zip, state, county }
 * @returns {Promise<{ ballot: object, raceSources: Record<string, 'live'|'seed'>, warnings: object[] }>}
 */
export async function buildBallot({ location } = {}) {
  const state = location?.state || zipToState(location?.zip) || null
  const county = location?.county || null
  const warnings = []
  const raceSources = {}

  const races = await Promise.all(
    SEED_BALLOT.races.map(async (seedRace) => {
      const { race, live } = await buildRace(seedRace, state, county, warnings)
      raceSources[raceKey(race.office, race.district)] = live ? 'live' : 'seed'
      return race
    }),
  )

  return {
    ballot: { ...SEED_BALLOT, races },
    raceSources,
    warnings,
  }
}
