import db from './index.js'

const insertStmt = db.prepare(
  'INSERT INTO users (phone_number, created_at) VALUES (?, ?) ON CONFLICT(phone_number) DO NOTHING',
)
const getStmt = db.prepare('SELECT id, phone_number, created_at FROM users WHERE phone_number = ?')

// Demo-only normalization: strip everything but digits, keep last 10.
// Not real phone validation — good enough to dedupe formatting variants.
export function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  return digits.slice(-10)
}

export function findOrCreateUser(rawPhone) {
  const phone = normalizePhone(rawPhone)
  if (phone.length !== 10) return null

  insertStmt.run(phone, Date.now())
  return getStmt.get(phone)
}
