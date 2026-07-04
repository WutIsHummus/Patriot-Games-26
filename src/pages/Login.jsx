import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout.jsx'
import { Button, Card, Input } from '../components/ui.jsx'

export function Login() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'code'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSendCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })
      const data = await res.json()
      if (!data.ok) {
        setError(data.error?.message || 'Could not send code')
        return
      }
      setStep('code')
    } catch {
      setError('Could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code }),
      })
      const data = await res.json()
      if (!data.ok) {
        setError(data.error?.message || 'Incorrect code')
        return
      }
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/quiz')
    } catch {
      setError('Could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 24px',
        }}
      >
        <Card stripe style={{ width: '100%', maxWidth: 420, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                margin: '8px auto 16px',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--blue-800)',
                color: '#fff',
                font: '700 16px/1 var(--font-sans)',
              }}
            >
              BB
              <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'var(--stripe-duo)' }} />
            </div>
            <h1 style={{ font: 'var(--weight-display) var(--text-xl) / 1.3 var(--font-display)' }}>
              Welcome to BallotBuddy
            </h1>
            <p style={{ margin: '8px 0 0', font: '430 var(--text-sm) / 1.55 var(--font-sans)', color: 'var(--text-muted)' }}>
              {step === 'phone'
                ? 'Sign in with your phone number to get started.'
                : `Enter the code we sent to ${phoneNumber}.`}
            </p>
          </div>
          {step === 'phone' ? (
            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Phone number"
                type="tel"
                inputMode="numeric"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                error={error}
                required
              />
              <Button type="submit" size="lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending…' : 'Send code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Verification code"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                mono
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={error}
                required
              />
              <Button type="submit" size="lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Verifying…' : 'Verify & sign in'}
              </Button>
              <Button variant="ghost" size="sm" type="button" onClick={() => setStep('phone')}>
                Use a different number
              </Button>
            </form>
          )}
          <p
            style={{
              margin: '24px 0 0',
              textAlign: 'center',
              font: '430 var(--text-xs) / 1.5 var(--font-sans)',
              color: 'var(--text-faint)',
            }}
          >
            Your number is only used to save your quiz results. No spam, ever.
          </p>
        </Card>
      </div>
    </Layout>
  )
}
