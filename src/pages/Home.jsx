import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout.jsx'
import { Button, Card, Badge } from '../components/ui.jsx'
import { getUser, getProfile } from '../lib/session.js'

const STEPS = [
  { n: '1', title: 'Quick quiz', body: 'Tuned to your town & the news' },
  { n: '2', title: 'Your profile', body: 'Your views, mapped honestly' },
  { n: '3', title: 'Compare & choose', body: 'Best matches, side by side' },
]

export function Home() {
  const user = getUser()
  const profile = getProfile()

  return (
    <Layout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <section style={{ textAlign: 'center', padding: '72px 24px 56px' }}>
          <Badge tone="blue" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
            NOVEMBER 3, 2026 · GENERAL ELECTION
          </Badge>
          <h1
            style={{
              margin: '24px auto 0',
              maxWidth: 760,
              font: 'var(--weight-display) var(--text-4xl) / var(--leading-tight) var(--font-display)',
              letterSpacing: 'var(--tracking-display)',
              color: 'var(--text-heading)',
            }}
          >
            Your ballot, <span style={{ color: 'var(--primary)' }}>explained.</span>
            <br />
            Your choice, <span style={{ color: 'var(--accent)' }}>always.</span>
          </h1>
          <div className="bb-stripe bb-stripe--flag" style={{ width: 96, margin: '28px auto 0' }} />
          <p
            style={{
              margin: '24px auto 0',
              maxWidth: 620,
              font: 'var(--type-body)',
              color: 'var(--text-secondary)',
            }}
          >
            BallotBuddy learns what you believe, then compares the candidates on your local ballot
            against it — side by side, in plain language. We never tell you who to vote for. We
            narrow it down so you can decide with confidence.
          </p>
          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to={user ? '/quiz' : '/login'}>
              <Button size="lg">Get started</Button>
            </Link>
            {profile ? (
              <Link to="/ballot">
                <Button variant="secondary" size="lg">
                  View my ballot
                </Button>
              </Link>
            ) : null}
          </div>
        </section>

        <section style={{ maxWidth: 'var(--container-max)', width: '100%', margin: '0 auto', padding: '0 24px 48px' }}>
          <Card className="bb-steps-strip">
            {STEPS.map((step) => (
              <div key={step.n} className="bb-steps-strip__item">
                <span
                  style={{
                    flex: 'none',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'var(--blue-800)',
                    color: '#fff',
                    font: '600 14px/1 var(--font-mono)',
                  }}
                >
                  {step.n}
                </span>
                <div>
                  <h3 style={{ font: 'var(--weight-semibold) var(--text-base) / 1.3 var(--font-sans)' }}>{step.title}</h3>
                  <p style={{ margin: '2px 0 0', font: '430 var(--text-sm) / 1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </section>

        <section
          style={{ marginTop: 'auto', maxWidth: 'var(--container-max)', width: '100%', margin: 'auto auto 0', padding: '0 24px' }}
        >
          <Card
            tone="navy"
            style={{ padding: '28px 32px 32px', textAlign: 'center', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          >
            <div
              aria-hidden="true"
              style={{ color: 'var(--blue-300)', fontSize: 11, letterSpacing: '0.6em', textIndent: '0.6em', marginBottom: 12 }}
            >
              ★ ★ ★
            </div>
            <h2 style={{ font: 'var(--weight-display) var(--text-xl) / 1.3 var(--font-display)', color: 'var(--text-inverse)' }}>
              Informed, not influenced.
            </h2>
            <p
              style={{
                margin: '10px auto 0',
                maxWidth: 520,
                font: '430 var(--text-base) / 1.6 var(--font-sans)',
                color: 'var(--text-inverse-muted)',
              }}
            >
              When several candidates fit your views, we show them all — never just one. A
              nonpartisan guide; the final choice is always yours.
            </p>
          </Card>
        </section>
      </div>
    </Layout>
  )
}
