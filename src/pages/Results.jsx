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
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <Badge tone="indigo" className="mb-3">
            Your political profile
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900">Here's where you stand</h1>
          {location && (
            <p className="mt-2 text-sm text-slate-500">
              Based on your answers · {location.county} County, {location.state} {location.zip}
            </p>
          )}
        </div>

        <Card className="p-6 sm:p-8">
          <p className="text-lg leading-relaxed text-slate-700">{summary}</p>
        </Card>

        <Card className="mt-6 space-y-8 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">The big picture</h2>
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
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-800">Local focus</span>
              <span className="text-xs text-slate-500">
                {Math.round((axes?.localFocus ?? 0) * 100)}% local
              </span>
            </div>
            <Progress value={(axes?.localFocus ?? 0) * 100} />
            <p className="mt-1 text-xs text-slate-500">
              How much local issues weigh in your decisions vs. national ones.
            </p>
          </div>
        </Card>

        {issuePreferences.length > 0 && (
          <Card className="mt-6 p-6 sm:p-8">
            <h2 className="mb-1 text-lg font-semibold text-slate-900">Your issues, your words</h2>
            <p className="mb-5 text-sm text-slate-500">
              Alignment isn't one axis — these individual stances carry through to candidate
              matching even when they cut against your overall profile.
            </p>
            <ul className="space-y-3">
              {issuePreferences.map((pref, i) => (
                <li
                  key={`${pref.issue}-${i}`}
                  className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-800">{pref.issue}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{pref.stance}</p>
                  </div>
                  <Badge tone={pref.weight >= 0.8 ? 'indigo' : 'slate'} className="shrink-0">
                    {pref.weight >= 0.8 ? 'Top priority' : 'Matters'}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
