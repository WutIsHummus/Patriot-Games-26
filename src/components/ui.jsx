// Small shadcn-inspired component kit. Plain Tailwind, no runtime deps.

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/20',
    secondary: 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    outline: 'border border-indigo-300 text-indigo-700 hover:bg-indigo-50',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

export function Card({ className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
      {...props}
    />
  )
}

const PARTY_STYLES = {
  democratic: 'bg-blue-50 text-blue-700 border-blue-200',
  republican: 'bg-red-50 text-red-700 border-red-200',
  independent: 'bg-violet-50 text-violet-700 border-violet-200',
  libertarian: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export function Badge({ tone = 'slate', className = '', children }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone] || tones.slate} ${className}`}
    >
      {children}
    </span>
  )
}

export function PartyBadge({ party }) {
  const key = (party || '').toLowerCase()
  const style = PARTY_STYLES[key] || 'bg-slate-100 text-slate-700 border-slate-200'
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {party || 'No party listed'}
    </span>
  )
}

export function Progress({ value, className = '' }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// Circular match-score indicator, 0-100.
export function ScoreRing({ score, size = 64 }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, score))
  const color = clamped >= 70 ? '#059669' : clamped >= 45 ? '#d97706' : '#dc2626'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-800">{Math.round(clamped)}</span>
    </div>
  )
}

// Horizontal axis meter for -1..1 scales (economic, social).
export function AxisMeter({ label, leftLabel, rightLabel, value }) {
  const pct = ((Math.min(1, Math.max(-1, value)) + 1) / 2) * 100
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-800">{label}</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-gradient-to-r from-indigo-200 via-slate-200 to-rose-200">
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-800 shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

export function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 ${className}`}
    />
  )
}
