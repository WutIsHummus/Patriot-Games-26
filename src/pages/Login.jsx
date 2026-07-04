import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })
      const data = await res.json()
      if (!data.ok) {
        setError(data.error?.message || 'Login failed')
        return
      }
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch {
      setError('Could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-500">
          Demo login — enter your phone number, no code required.
        </p>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="(555) 123-4567"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-slate-900 text-white py-2 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Continue'}
        </button>
      </form>
    </main>
  )
}
