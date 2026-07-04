import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout.jsx'
import { Button, Card, Badge } from '../components/ui.jsx'
import { getUser, getProfile } from '../lib/session.js'

const STEPS = [
  {
    title: 'Take a quick quiz',
    body: 'Questions tuned to your location and the issues that matter in your community right now.',
  },
  {
    title: 'See your political profile',
    body: 'Where you land on the big axes — plus the individual issues you care about, preserved as-is.',
  },
  {
    title: 'Compare your ballot',
    body: 'Every race near you, with a few good matches per office compared side by side. You decide.',
  },
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
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Card key={step.title} className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {i + 1}
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{step.body}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-slate-900 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white">Informed, not influenced.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            When several candidates fit your views, we show you all of them — where they agree with
            you, where they don't, and how solid the data is. One-candidate answers only happen
            when a race genuinely has one good option.
          </p>
        </Card>
      </section>
    </Layout>
  )
}
