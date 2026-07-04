import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout.jsx'
import { Button, Card, Spinner } from '../components/ui.jsx'

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
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              BB
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome to BallotBuddy</h1>
            <p className="mt-2 text-sm text-slate-500">
              {step === 'phone'
                ? 'Sign in with your phone number to get started.'
                : `Enter the code we sent to ${phoneNumber}.`}
            </p>
          </div>
          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? <Spinner className="h-4 w-4" /> : null}
                {loading ? 'Sending…' : 'Send code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Verification code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? <Spinner className="h-4 w-4" /> : null}
                {loading ? 'Verifying…' : 'Verify & sign in'}
              </Button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-sm text-slate-500"
              >
                Use a different number
              </button>
            </form>
          )}
          <p className="mt-6 text-center text-xs text-slate-400">
            Your number is only used to save your quiz results. No spam, ever.
          </p>
        </Card>
      </div>
    </Layout>
  )
}
