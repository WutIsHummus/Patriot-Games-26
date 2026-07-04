import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout.jsx'
import { Button, Card, Badge, PartyBadge, ScoreRing, Spinner } from '../components/ui.jsx'
import { getProfile, getLocation } from '../lib/session.js'
import { SEED_BALLOT, SEED_LOCATION } from '../data/seedBallot.js'
import { matchBallotLocally } from '../lib/localEngine.js'

const LEVEL_LABELS = { federal: 'Federal', state: 'State', county: 'County' }

function DataQualityBadge({ quality }) {
  if (quality === 'high') return <Badge tone="green">Solid data</Badge>
  if (quality === 'medium') return <Badge tone="amber">Some data</Badge>
  return <Badge tone="red">Limited data</Badge>
}

function CandidateCompareCard({ option, highlight }) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-5 ${
        highlight ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{option.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <PartyBadge party={option.party} />
            {option.incumbent && <Badge>Incumbent</Badge>}
          </div>
        </div>
        <ScoreRing score={option.score} size={56} />
      </div>
      {option.bio && <p className="mb-3 text-sm leading-relaxed text-slate-600">{option.bio}</p>}
      <div className="mt-auto space-y-2 text-sm">
        {option.alignments?.slice(0, 2).map((a, i) => (
          <p key={`a-${i}`} className="flex gap-2 text-emerald-700">
            <span aria-hidden>✓</span>
            <span>
              <span className="font-medium">{a.issue}:</span> {a.explanation}
            </span>
          </p>
        ))}
        {option.conflicts?.slice(0, 1).map((c, i) => (
          <p key={`c-${i}`} className="flex gap-2 text-rose-700">
            <span aria-hidden>✕</span>
            <span>
              <span className="font-medium">{c.issue}:</span> {c.explanation}
            </span>
          </p>
        ))}
      </div>
      <div className="mt-3">
        <DataQualityBadge quality={option.dataQuality} />
      </div>
    </div>
  )
}

function DeepDive({ option }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="font-semibold text-slate-900">{option.name}</p>
        <PartyBadge party={option.party} />
        {option.incumbent && <Badge>Incumbent</Badge>}
        <span className="ml-auto text-sm font-bold text-slate-700">{option.score}/100 fit</span>
      </div>
      {option.record && (
        <p className="mb-3 text-sm leading-relaxed text-slate-600">
          <span className="font-medium text-slate-800">Track record: </span>
          {option.record}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Where you agree
          </p>
          {option.alignments?.length ? (
            <ul className="space-y-1.5 text-sm text-slate-700">
              {option.alignments.map((a, i) => (
                <li key={i}>
                  <span className="font-medium">{a.issue}:</span> {a.explanation}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Nothing clear in the data.</p>
          )}
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-700">
            Where you differ
          </p>
          {option.conflicts?.length ? (
            <ul className="space-y-1.5 text-sm text-slate-700">
              {option.conflicts.map((c, i) => (
                <li key={i}>
                  <span className="font-medium">{c.issue}:</span> {c.explanation}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No clear conflicts in the data.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function LiveDataBadge({ live }) {
  if (live == null) return null
  return live ? <Badge tone="green">Live candidates</Badge> : <Badge tone="slate">Sample data</Badge>
}

function RaceSection({ race }) {
  const [expanded, setExpanded] = useState(false)
  const goodIds = new Set(race.goodOptionIds || [])
  const goodOptions = race.options.filter((o) => goodIds.has(o.candidateId))
  const others = race.options.filter((o) => !goodIds.has(o.candidateId))
  const single = goodOptions.length === 1 && race.options.length === 1

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-slate-900">{race.office}</h2>
        <Badge tone="slate">{LEVEL_LABELS[race.level] || race.level}</Badge>
        {race.district && <span className="text-sm text-slate-500">{race.district}</span>}
        <LiveDataBadge live={race.live} />
      </div>
      <p className="mb-5 text-sm text-slate-500">
        {single
          ? 'Only one candidate is on the ballot for this race.'
          : goodOptions.length > 1
            ? `${goodOptions.length} candidates fit your views well — compare them and decide.`
            : 'One candidate stands out for your views, but every option is below.'}
      </p>

      <div className={`grid gap-4 ${goodOptions.length > 1 ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:max-w-md'}`}>
        {goodOptions.map((o) => (
          <CandidateCompareCard key={o.candidateId} option={o} highlight={goodOptions.length > 1} />
        ))}
      </div>

      {others.length > 0 && !expanded && (
        <p className="mt-4 text-sm text-slate-500">
          Also on the ballot: {others.map((o) => `${o.name} (${o.party})`).join(', ')}
        </p>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        {expanded ? '− Hide the full comparison' : '+ Compare all candidates in depth'}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {race.options.map((o) => (
            <DeepDive key={o.candidateId} option={o} />
          ))}
        </div>
      )}
    </Card>
  )
}

export function Ballot() {
  const profile = getProfile()
  const location = getLocation() || SEED_LOCATION
  const [races, setRaces] = useState(null)
  const [usedFallback, setUsedFallback] = useState(false)

  useEffect(() => {
    if (!profile) return
    let cancelled = false

    async function load() {
      // Prefer the server-side agent (LLM); fall back to the local matcher.
      try {
        const res = await fetch('/api/agent/ballot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location, profile }),
        })
        const data = await res.json()
        if (!cancelled && data.ok && data.races?.length) {
          setRaces(normalizeAgentRaces(data.races, data.raceSources))
          return
        }
      } catch {
        // fall through
      }
      if (!cancelled) {
        setRaces(matchBallotLocally(profile, SEED_BALLOT))
        setUsedFallback(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!profile) return <Navigate to="/quiz" replace />

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-10 text-center">
          <Badge tone="indigo" className="mb-3">
            {SEED_BALLOT.electionName}
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900">Your ballot, compared</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            For each office we highlight the candidates who best fit your views — usually more than
            one — and show where they agree and differ with you. The pick is yours.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {location.county ? `${location.county} County, ` : ''}
            {location.state} {location.zip}
            {usedFallback && ' · quick-match mode (AI matcher unavailable)'}
          </p>
        </div>

        {!races ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <Spinner className="h-8 w-8" />
            <p className="text-slate-600">Comparing candidates against your profile…</p>
          </div>
        ) : (
          <div className="space-y-8">
            {races.map((race) => (
              <RaceSection key={race.office + (race.district || '')} race={race} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/quiz">
            <Button variant="secondary">Retake the quiz</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

// The server agent returns topPick/notableAlternative/options; the UI never
// surfaces a single pick, so fold everything into options + goodOptionIds
// (top pick, notable alternative, and anyone within 12 points of the leader).
function normalizeAgentRaces(agentRaces, raceSources) {
  return agentRaces.map((race) => {
    const options = [...(race.options || [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    const leader = options[0]?.score ?? 0
    const goodIds = new Set(
      options.filter((o) => leader - (o.score ?? 0) <= 12).map((o) => o.candidateId),
    )
    if (race.topPick?.candidateId) goodIds.add(race.topPick.candidateId)
    if (race.notableAlternative?.candidateId) goodIds.add(race.notableAlternative.candidateId)
    if (goodIds.size < 2 && options.length > 1) {
      options.slice(0, 2).forEach((o) => goodIds.add(o.candidateId))
    }
    const sourceKey = `${race.office}::${race.district || ''}`
    return {
      office: race.office,
      level: race.level,
      district: race.district,
      live: raceSources ? raceSources[sourceKey] === 'live' : null,
      goodOptionIds: [...goodIds],
      options,
    }
  })
}
