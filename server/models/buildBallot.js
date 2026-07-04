import { providers } from '../providers/index.js'
import { zipToState } from '../lib/zipToState.js'
import { SEED_BALLOT } from '../../src/data/seedBallot.js'

// Best-effort real ballot assembly: for each seed race, try a live provider
// first; if it returns nothing usable, silently keep the seed race so the UI
// never shows an empty office. Only federal Senate/House races have a real
// "who's actually running" source (FEC) - state/county providers only expose
// current officeholders, not challengers, so those stay on seed data. See
// docs/DATA_SOURCES.md and CLAUDE.md open-decisions for why this is the
// accepted best-effort scope.

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

async function toBallotCandidate(fecCandidate, office, state, warnings) {
  const research = await providers.openrouter.researchCandidateStances({
    name: fecCandidate.name,
    party: fecCandidate.party,
    office,
    state,
  })
  const r = research.ok ? research.data : null
  if (!research.ok) warnings.push(research)

  return {
    candidateId: `fec-${fecCandidate.id}`,
    name: fecCandidate.name,
    party: normalizeParty(fecCandidate.party),
    incumbent: Boolean(fecCandidate.incumbent),
    bio: r?.bio || '',
    stances: Array.isArray(r?.stances) ? r.stances : [],
    record: r?.record || '',
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
  const candidates = [...byName.values()].slice(0, MAX_CANDIDATES_PER_RACE)
  if (candidates.length < 2) return { race: seedRace, live: false }

  const built = await Promise.all(candidates.map((c) => toBallotCandidate(c, seedRace.office, state, warnings)))
  return {
    race: { ...seedRace, candidates: built },
    live: true,
  }
}

// Attempt live data for one race; always returns a usable race (falls back
// to the seed race on any failure or insufficient live data).
async function buildRace(seedRace, state, warnings) {
  if (seedRace.office === 'U.S. Senate' && state) {
    return buildFederalSenateRace(state, seedRace, warnings)
  }
  // State/county races: no live "who's on the ballot" source exists yet
  // (Open States returns sitting officeholders, not challengers). Stay on seed.
  return { race: seedRace, live: false }
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
  const warnings = []
  const raceSources = {}

  const races = await Promise.all(
    SEED_BALLOT.races.map(async (seedRace) => {
      const { race, live } = await buildRace(seedRace, state, warnings)
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
