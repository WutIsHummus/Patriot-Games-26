// BallotBuddy design-system components, ported from the Claude Design handoff
// (ballotbuddy-design-system/project/components). Styles live in src/index.css
// as .bb-* classes; these components only compose markup and tokens.

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button className={`bb-btn bb-btn--${variant} bb-btn--${size} ${className}`} {...props} />
  )
}

export function Card({ tone = 'default', stripe = false, className = '', children, ...props }) {
  return (
    <div
      className={`bb-card ${tone !== 'default' ? `bb-card--${tone}` : ''} ${stripe ? 'bb-card--stripe' : ''} ${className}`}
      {...props}
    >
      {stripe ? <div className="bb-card__stripe" aria-hidden="true" /> : null}
      {children}
    </div>
  )
}

const BADGE_TONES = {
  neutral: { color: 'var(--gray-600)', background: 'var(--gray-100)', borderColor: 'var(--gray-200)' },
  blue:    { color: 'var(--blue-700)', background: 'var(--blue-50)', borderColor: 'var(--blue-100)' },
  green:   { color: 'var(--green-700)', background: 'var(--green-50)', borderColor: 'var(--green-100)' },
  amber:   { color: 'var(--amber-700)', background: 'var(--amber-50)', borderColor: 'var(--amber-100)' },
  red:     { color: 'var(--red-700)', background: 'var(--red-50)', borderColor: 'var(--red-100)' },
  navy:    { color: 'var(--text-inverse)', background: 'var(--blue-800)', borderColor: 'var(--blue-800)' },
  // Legacy aliases from the pre-design-system UI
  indigo:  { color: 'var(--blue-700)', background: 'var(--blue-50)', borderColor: 'var(--blue-100)' },
  slate:   { color: 'var(--gray-600)', background: 'var(--gray-100)', borderColor: 'var(--gray-200)' },
}

export function Badge({ tone = 'neutral', className = '', style, children, ...props }) {
  const t = BADGE_TONES[tone] || BADGE_TONES.neutral
  return (
    <span className={`bb-badge ${className}`} style={{ ...t, ...style }} {...props}>
      {children}
    </span>
  )
}

const PARTY_STYLES = {
  democratic:  { color: 'var(--party-dem)', background: 'var(--party-dem-bg)' },
  republican:  { color: 'var(--party-rep)', background: 'var(--party-rep-bg)' },
  independent: { color: 'var(--party-ind)', background: 'var(--party-ind-bg)' },
  libertarian: { color: 'var(--party-lib)', background: 'var(--party-lib-bg)' },
  green:       { color: 'var(--party-grn)', background: 'var(--party-grn-bg)' },
}

export function PartyBadge({ party, className = '', style, ...props }) {
  const key = (party || '').toLowerCase()
  const t = PARTY_STYLES[key] || { color: 'var(--party-other)', background: 'var(--party-other-bg)' }
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--radius-full)',
        border: '1px solid rgba(16, 28, 56, 0.10)',
        padding: '3px 10px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-medium)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...t,
        ...style,
      }}
      {...props}
    >
      {party || 'No party listed'}
    </span>
  )
}

export function Progress({ value = 0, className = '', style, ...props }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      className={className}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        height: 8,
        width: '100%',
        overflow: 'hidden',
        borderRadius: 'var(--radius-full)',
        background: 'var(--gray-200)',
        ...style,
      }}
      {...props}
    >
      <div
        style={{
          height: '100%',
          width: `${clamped}%`,
          borderRadius: 'var(--radius-full)',
          background: 'var(--primary)',
          transition: 'width var(--duration-slow) var(--ease-out)',
        }}
      />
    </div>
  )
}

export function ScoreRing({ score = 0, size = 64, className = '', style, ...props }) {
  const stroke = 6
  const radius = (size - stroke - 2) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, score))
  const color =
    clamped >= 70 ? 'var(--score-high)' : clamped >= 45 ? 'var(--score-mid)' : 'var(--score-low)'
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flex: 'none',
        ...style,
      }}
      {...props}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--gray-200)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          style={{ transition: 'stroke-dashoffset var(--duration-slow) var(--ease-out)' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          fontSize: Math.max(12, size * 0.24),
          color: 'var(--text-heading)',
          letterSpacing: '-0.02em',
        }}
      >
        {Math.round(clamped)}
      </span>
    </div>
  )
}

export function AxisMeter({ label, leftLabel, rightLabel, value = 0, className = '', style, ...props }) {
  const pct = ((Math.min(1, Math.max(-1, value)) + 1) / 2) * 100
  return (
    <div className={className} style={style} {...props}>
      {label ? (
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--text-heading)',
            }}
          >
            {label}
          </span>
        </div>
      ) : null}
      <div
        style={{
          position: 'relative',
          height: 10,
          borderRadius: 'var(--radius-full)',
          background:
            'linear-gradient(90deg, var(--blue-200) 0%, var(--gray-100) 50%, var(--red-100) 100%)',
          border: '1px solid rgba(16, 28, 56, 0.06)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: -3,
            bottom: -3,
            width: 1,
            background: 'var(--gray-300)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${pct}%`,
            width: 18,
            height: 18,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: 'var(--blue-900)',
            border: '2.5px solid #fff',
            boxShadow: '0 1px 3px rgba(15, 31, 66, 0.3)',
            transition: 'left var(--duration-slow) var(--ease-out)',
          }}
        />
      </div>
      <div
        style={{
          marginTop: 6,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
        }}
      >
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

export function Spinner({ size = 20, className = '', style, ...props }) {
  return (
    <span
      className={`bb-spinner ${className}`}
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size, borderWidth: Math.max(2, size / 10), ...style }}
      {...props}
    />
  )
}

export function Input({ label, hint, error, mono = false, id, className = '', style, ...props }) {
  const inputId = id || (label ? `bb-in-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined)
  return (
    <div className={className} style={style}>
      {label ? (
        <label className="bb-input-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`bb-input ${mono ? 'bb-input--mono' : ''} ${error ? 'bb-input--error' : ''}`}
        {...props}
      />
      {error ? <p className="bb-input-error">{error}</p> : hint ? <p className="bb-input-hint">{hint}</p> : null}
    </div>
  )
}

export function QuizOption({ selected = false, className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`bb-quizopt ${selected ? 'bb-quizopt--selected' : ''} ${className}`}
      aria-pressed={selected}
      {...props}
    >
      <span>{children}</span>
      <span className="bb-quizopt__check" aria-hidden="true">✓</span>
    </button>
  )
}
