import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout.jsx'
import { Button, Card, Badge, PartyBadge, ScoreRing, Spinner } from '../components/ui.jsx'
import { getProfile, getLocation, getUser } from '../lib/session.js'
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
    <div className={`bb-cand ${highlight ? 'bb-cand--highlight' : ''}`}>
      <div className="bb-cand__top">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {option.photoUrl && (
            <img
              src={option.photoUrl}
              alt=""
              style={{ width: 44, height: 44, flex: 'none', borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div>
            <p className="bb-cand__name">{option.name}</p>
            <div className="bb-cand__tags">
              <PartyBadge party={option.party} />
              {option.incumbent && <Badge>Incumbent</Badge>}
            </div>
          </div>
        </div>
        <ScoreRing score={option.score} size={56} />
      </div>
      {option.bio && <p className="bb-cand__bio">{option.bio}</p>}
      <div className="bb-cand__points">
        {option.alignments?.slice(0, 2).map((a, i) => (
          <p key={`a-${i}`} className="bb-cand__point" style={{ color: 'var(--agree)' }}>
            <span className="bb-cand__glyph" aria-hidden="true">✓</span>
            <span>
              <span className="bb-cand__issue">{a.issue}:</span> {a.explanation}
            </span>
          </p>
        ))}
        {option.conflicts?.slice(0, 1).map((c, i) => (
          <p key={`c-${i}`} className="bb-cand__point" style={{ color: 'var(--differ)' }}>
            <span className="bb-cand__glyph" aria-hidden="true">✕</span>
            <span>
              <span className="bb-cand__issue">{c.issue}:</span> {c.explanation}
            </span>
          </p>
        ))}
      </div>
      <div className="bb-cand__foot">
        <DataQualityBadge quality={option.dataQuality} />
      </div>
    </div>
  )
}

function DeepDive({ option }) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        background: 'var(--white)',
        padding: 20,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {option.photoUrl && (
          <img
            src={option.photoUrl}
            alt=""
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        <p style={{ margin: 0, font: 'var(--weight-semibold) var(--text-base) / 1.3 var(--font-sans)', color: 'var(--text-heading)' }}>
          {option.name}
        </p>
        <PartyBadge party={option.party} />
        {option.incumbent && <Badge>Incumbent</Badge>}
        <span style={{ marginLeft: 'auto', font: '600 var(--text-sm) / 1.4 var(--font-mono)', color: 'var(--text-heading)' }}>
          {option.score}/100 fit
        </span>
      </div>
      {option.record && (
        <p style={{ margin: '0 0 14px', font: '430 var(--text-sm) / 1.6 var(--font-sans)', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>Track record: </span>
          {option.record}
        </p>
      )}
      <div className="bb-deepdive-grid">
        <div>
          <p
            style={{
              margin: '0 0 8px',
              font: 'var(--weight-semibold) var(--text-xs) / 1.4 var(--font-sans)',
              letterSpacing: 'var(--tracking-eyebrow)',
              textTransform: 'uppercase',
              color: 'var(--agree)',
            }}
          >
            ✓ Where you agree
          </p>
          {option.alignments?.length ? (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {option.alignments.map((a, i) => (
                <li key={i} style={{ font: '430 var(--text-sm) / 1.55 var(--font-sans)', color: 'var(--text-body)' }}>
                  <span style={{ fontWeight: 'var(--weight-semibold)' }}>{a.issue}:</span> {a.explanation}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, font: '430 var(--text-sm) / 1.5 var(--font-sans)', color: 'var(--text-faint)' }}>
              Nothing clear in the data.
            </p>
          )}
        </div>
        <div>
          <p
            style={{
              margin: '0 0 8px',
              font: 'var(--weight-semibold) var(--text-xs) / 1.4 var(--font-sans)',
              letterSpacing: 'var(--tracking-eyebrow)',
              textTransform: 'uppercase',
              color: 'var(--differ)',
            }}
          >
            ✕ Where you differ
          </p>
          {option.conflicts?.length ? (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {option.conflicts.map((c, i) => (
                <li key={i} style={{ font: '430 var(--text-sm) / 1.55 var(--font-sans)', color: 'var(--text-body)' }}>
                  <span style={{ fontWeight: 'var(--weight-semibold)' }}>{c.issue}:</span> {c.explanation}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, font: '430 var(--text-sm) / 1.5 var(--font-sans)', color: 'var(--text-faint)' }}>
              No clear conflicts in the data.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function LiveDataBadge({ live }) {
  if (live == null) return null
  return live ? <Badge tone="green">Live candidates</Badge> : <Badge tone="neutral">Sample data</Badge>
}

function RaceSection({ race }) {
  const [expanded, setExpanded] = useState(false)
  const goodIds = new Set(race.goodOptionIds || [])
  const goodOptions = race.options.filter((o) => goodIds.has(o.candidateId))
  const others = race.options.filter((o) => !goodIds.has(o.candidateId))
  const single = goodOptions.length === 1 && race.options.length === 1

  return (
    <Card style={{ padding: 32 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <h2 style={{ font: 'var(--weight-display) var(--text-xl) / 1.3 var(--font-display)' }}>{race.office}</h2>
        <Badge>{LEVEL_LABELS[race.level] || race.level}</Badge>
        {race.district && (
          <span style={{ font: '430 var(--text-sm) / 1.4 var(--font-sans)', color: 'var(--text-muted)' }}>
            {race.district}
          </span>
        )}
        <LiveDataBadge live={race.live} />
      </div>
      <p style={{ margin: '0 0 20px', font: '430 var(--text-sm) / 1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
        {single
          ? 'Only one candidate is on the ballot for this race.'
          : goodOptions.length > 1
            ? `${goodOptions.length} candidates fit your views well — compare them and decide.`
            : 'One candidate stands out for your views, but every option is below.'}
      </p>

      <div
        className={`bb-cand-grid ${goodOptions.length > 1 ? 'bb-cand-grid--multi' : 'bb-cand-grid--single'}`}
        style={goodOptions.length > 1 ? { '--cand-cols': Math.min(goodOptions.length, 3) } : undefined}
      >
        {goodOptions.map((o) => (
          <CandidateCompareCard key={o.candidateId} option={o} highlight={goodOptions.length > 1} />
        ))}
      </div>

      {others.length > 0 && !expanded && (
        <p style={{ margin: '16px 0 0', font: '430 var(--text-sm) / 1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
          Also on the ballot: {others.map((o) => `${o.name} (${o.party})`).join(', ')}
        </p>
      )}

      <Button variant="outline" size="sm" style={{ marginTop: 20 }} onClick={() => setExpanded(!expanded)}>
        {expanded ? '− Hide the full comparison' : '+ Compare all candidates in depth'}
      </Button>

      {expanded && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          body: JSON.stringify({ location, profile, notifyPhone: getUser()?.phoneNumber }),
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
      <div style={{ maxWidth: 'var(--container-max)', width: '100%', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Badge tone="blue" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            NOVEMBER 3, 2026 · GENERAL ELECTION
          </Badge>
          <h1
            style={{
              margin: '14px 0 0',
              font: 'var(--weight-display) var(--text-3xl) / 1.15 var(--font-display)',
              letterSpacing: 'var(--tracking-display)',
            }}
          >
            Your ballot, compared
          </h1>
          <p
            style={{
              margin: '12px auto 0',
              maxWidth: 620,
              font: '430 var(--text-base) / 1.6 var(--font-sans)',
              color: 'var(--text-secondary)',
            }}
          >
            For each office we highlight the candidates who best fit your views — usually more than
            one — and show where they agree and differ with you. The pick is yours.
          </p>
          <p style={{ margin: '8px 0 0', font: '400 var(--text-sm) / 1.5 var(--font-mono)', color: 'var(--text-muted)' }}>
            {location.county ? `${location.county} County, ` : ''}
            {location.state} {location.zip}
            {usedFallback && ' · quick-match mode (AI matcher unavailable)'}
          </p>
        </div>

        <Card stripe style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '24px 24px 20px', marginBottom: 32 }}>
          <span
            aria-hidden="true"
            style={{
              flex: 'none',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'var(--blue-800)',
              color: '#fff',
              fontSize: 14,
            }}
          >
            ⚖
          </span>
          <div>
            <p style={{ margin: 0, font: 'var(--weight-semibold) var(--text-base) / 1.4 var(--font-sans)', color: 'var(--text-heading)' }}>
              Informed, not influenced
            </p>
            <p style={{ margin: '2px 0 0', font: '430 var(--text-sm) / 1.55 var(--font-sans)', color: 'var(--text-secondary)' }}>
              When several candidates fit your views, we show all of them — where they agree with
              you, where they don't, and how solid the data is. You'll only see one name when a
              race genuinely has one good option.
            </p>
          </div>
        </Card>

        {!races ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '96px 0' }}>
            <Spinner size={32} />
            <p style={{ font: '430 var(--text-base) / 1.5 var(--font-sans)', color: 'var(--text-secondary)' }}>
              Comparing candidates against your profile…
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {races.map((race) => (
              <RaceSection key={race.office + (race.district || '')} race={race} />
            ))}
          </div>
        )}

        <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/results">
            <Button variant="ghost">← Back to my profile</Button>
          </Link>
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
