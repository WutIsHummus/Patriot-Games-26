import { Link, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout.jsx'
import { Button, Card, Badge, AxisMeter, Progress } from '../components/ui.jsx'
import { getProfile, getLocation } from '../lib/session.js'

export function Results() {
  const profile = getProfile()
  const location = getLocation()

  if (!profile) return <Navigate to="/quiz" replace />

  const { axes, issuePreferences = [], summary } = profile

  return (
    <Layout>
      <div style={{ maxWidth: 760, width: '100%', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Badge tone="blue">Your political profile</Badge>
          <h1
            style={{
              margin: '14px 0 0',
              font: 'var(--weight-display) var(--text-3xl) / 1.15 var(--font-display)',
              letterSpacing: 'var(--tracking-display)',
            }}
          >
            Here's where you stand
          </h1>
          {location && (
            <p style={{ margin: '10px 0 0', font: '400 var(--text-sm) / 1.5 var(--font-mono)', color: 'var(--text-muted)' }}>
              Based on your answers · {location.county ? `${location.county} County, ` : ''}
              {location.state} {location.zip}
            </p>
          )}
        </div>

        <Card stripe style={{ padding: 32 }}>
          <p style={{ margin: 0, font: '430 var(--text-md) / 1.65 var(--font-sans)', color: 'var(--text-body)' }}>
            {summary}
          </p>
        </Card>

        <Card style={{ marginTop: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
          <h2 style={{ font: 'var(--weight-semibold) var(--text-lg) / 1.3 var(--font-sans)' }}>The big picture</h2>
          <AxisMeter
            label="Economic"
            leftLabel="More government role"
            rightLabel="More market-driven"
            value={axes?.economic ?? 0}
          />
          <AxisMeter
            label="Social"
            leftLabel="Progressive"
            rightLabel="Traditional"
            value={axes?.social ?? 0}
          />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ font: 'var(--weight-semibold) var(--text-base) / 1.4 var(--font-sans)', color: 'var(--text-heading)' }}>
                Local focus
              </span>
              <span style={{ font: '400 var(--text-xs) / 1.4 var(--font-mono)', color: 'var(--text-muted)' }}>
                {Math.round((axes?.localFocus ?? 0) * 100)}% local
              </span>
            </div>
            <Progress value={(axes?.localFocus ?? 0) * 100} />
            <p style={{ margin: '6px 0 0', font: '430 var(--text-xs) / 1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
              How much local issues weigh in your decisions vs. national ones.
            </p>
          </div>
        </Card>

        {issuePreferences.length > 0 && (
          <Card style={{ marginTop: 24, padding: 32 }}>
            <h2 style={{ font: 'var(--weight-semibold) var(--text-lg) / 1.3 var(--font-sans)' }}>
              Your issues, your words
            </h2>
            <p style={{ margin: '4px 0 20px', font: '430 var(--text-sm) / 1.55 var(--font-sans)', color: 'var(--text-muted)' }}>
              Alignment isn't one axis — these individual stances carry through to candidate
              matching even when they cut against your overall profile.
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {issuePreferences.map((pref, i) => (
                <li
                  key={`${pref.issue}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-sunken)',
                    padding: 16,
                  }}
                >
                  <div>
                    <p style={{ margin: 0, font: 'var(--weight-semibold) var(--text-base) / 1.4 var(--font-sans)', color: 'var(--text-heading)' }}>
                      {pref.issue}
                    </p>
                    <p style={{ margin: '2px 0 0', font: '430 var(--text-sm) / 1.5 var(--font-sans)', color: 'var(--text-secondary)' }}>
                      {pref.stance}
                    </p>
                  </div>
                  <Badge tone={pref.weight >= 0.8 ? 'blue' : 'neutral'} style={{ flex: 'none' }}>
                    {pref.weight >= 0.8 ? 'Top priority' : 'Matters'}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/ballot">
            <Button size="lg">See my ballot matches →</Button>
          </Link>
          <Link to="/quiz">
            <Button variant="secondary" size="lg">
              Retake quiz
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
