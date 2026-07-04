import db from './index.js'

const getStmt = db.prepare('SELECT payload, expires_at FROM cache WHERE cache_key = ?')
const deleteStmt = db.prepare('DELETE FROM cache WHERE cache_key = ?')
const setStmt = db.prepare(`
  INSERT INTO cache (cache_key, provider, payload, created_at, expires_at)
  VALUES (@key, @provider, @payload, @createdAt, @expiresAt)
  ON CONFLICT(cache_key) DO UPDATE SET
    provider = excluded.provider,
    payload = excluded.payload,
    created_at = excluded.created_at,
    expires_at = excluded.expires_at
`)
const purgeStmt = db.prepare('DELETE FROM cache WHERE expires_at < ?')

export function buildKey(provider, fn, params = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, k) => {
      acc[k] = params[k]
      return acc
    }, {})
  return `${provider}:${fn}:${JSON.stringify(sortedParams)}`
}

export function get(key) {
  const row = getStmt.get(key)
  if (!row) return null
  if (row.expires_at < Date.now()) {
    deleteStmt.run(key)
    return null
  }
  try {
    return JSON.parse(row.payload)
  } catch {
    deleteStmt.run(key)
    return null
  }
}

export function set(key, provider, payload, ttlSeconds) {
  const now = Date.now()
  setStmt.run({
    key,
    provider,
    payload: JSON.stringify(payload),
    createdAt: now,
    expiresAt: now + ttlSeconds * 1000,
  })
}

export async function wrap(key, provider, ttlSeconds, fetcherFn) {
  const cached = get(key)
  if (cached) return cached

  const fresh = await fetcherFn()
  if (fresh?.ok) set(key, provider, fresh, ttlSeconds)
  return fresh
}

export function purgeExpired() {
  purgeStmt.run(Date.now())
}
