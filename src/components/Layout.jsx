import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Fragment } from 'react'
import { getUser, clearUser } from '../lib/session.js'

// Header + footer from the BallotBuddy design system. The stepper is progress
// feedback for the quiz→profile→ballot flow, never navigation; it only shows
// while the voter is inside the flow.
const FLOW_STEPS = [
  { to: '/quiz', label: 'Quiz' },
  { to: '/results', label: 'My Profile' },
  { to: '/ballot', label: 'My Ballot' },
]

export function Layout({ children }) {
  const user = getUser()
  const location = useLocation()
  const navigate = useNavigate()
  const activeIndex = FLOW_STEPS.findIndex((s) => s.to === location.pathname)

  function handleSignOut() {
    clearUser()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="bb-header">
        <div className="bb-header__stripe" aria-hidden="true" />
        <div className="bb-header__inner">
          <Link to="/" className="bb-header__brand">
            <span className="bb-header__bb">BB</span>
            <span className="bb-header__word">BallotBuddy</span>
          </Link>
          {activeIndex >= 0 ? (
            <div className="bb-header__steps" aria-label="Your progress">
              {FLOW_STEPS.map((step, i) => {
                const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'upcoming'
                return (
                  <Fragment key={step.to}>
                    {i > 0 ? <span className="bb-header__conn" aria-hidden="true" /> : null}
                    <span className={`bb-header__step bb-header__step--${state}`}>
                      <span className="bb-header__dot">{state === 'done' ? '✓' : i + 1}</span>
                      <span className="bb-header__steplabel">{step.label}</span>
                    </span>
                  </Fragment>
                )
              })}
            </div>
          ) : null}
          <div className="bb-header__side">
            {user ? (
              <>
                <span className="bb-header__phone">{user.phoneNumber}</span>
                <button className="bb-header__btn" onClick={handleSignOut}>
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="bb-header__btn bb-header__btn--primary" style={{ textDecoration: 'none' }}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
      {/* Home anchors its own navy statement panel instead (design-kit app shell). */}
      {location.pathname !== '/' && (
        <footer
          style={{
            borderTop: '1px solid var(--border-default)',
            background: 'var(--white)',
            padding: 'var(--space-6) 0',
          }}
        >
          <div className="bb-container" style={{ textAlign: 'center' }}>
            <div
              aria-hidden="true"
              style={{ color: 'var(--blue-300)', fontSize: 10, letterSpacing: '0.6em', textIndent: '0.6em', marginBottom: 10 }}
            >
              ★ ★ ★
            </div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', lineHeight: 1.6, color: 'var(--text-faint)' }}>
              BallotBuddy is a nonpartisan voter guide. It compares candidates against your views —
              the final choice is always yours.
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
