import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout.jsx'
import { Button, Card, Badge } from '../components/ui.jsx'
import { getUser, getProfile } from '../lib/session.js'

const STEPS = [
  { title: 'Quick quiz', body: 'Tuned to your town & the news' },
  { title: 'Your profile', body: 'Your views, mapped honestly' },
  { title: 'Compare & choose', body: 'Best matches, side by side' },
]

export function Home() {
  const user = getUser()
  const profile = getProfile()

  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6">
          <Badge tone="indigo" className="mb-6">
            November 3, 2026 General Election
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Your ballot, <span className="text-indigo-600">explained.</span> Your choice,{' '}
            <span className="text-indigo-600">always.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            BallotBuddy learns what you believe, then compares the candidates on your local ballot
            against it — side by side, in plain language. We never tell you who to vote for. We
            narrow it down so you can decide with confidence.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to={user ? '/quiz' : '/login'}>
              <Button size="lg">{profile ? 'Retake the quiz' : 'Get started'}</Button>
            </Link>
            {profile && (
              <Link to="/ballot">
                <Button variant="secondary" size="lg">
                  View my ballot
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Card className="flex flex-col divide-y divide-slate-100 sm:flex-row sm:divide-x sm:divide-y-0">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-1 items-center gap-4 p-5 sm:p-6">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.body}</p>
              </div>
            </div>
          ))}
        </Card>

      </section>
    </Layout>
  )
}
