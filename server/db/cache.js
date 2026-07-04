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
const statsStmt = db.prepare(`
  SELECT provider, COUNT(*) as count, MIN(expires_at) as soonestExpiry, MAX(expires_at) as latestExpiry
  FROM cache
  WHERE expires_at >= ?
  GROUP BY provider
`)
const countAllStmt = db.prepare('SELECT COUNT(*) as count FROM cache')

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

// Same as get(), but also returns cache metadata so callers can show
// hit/miss + age in API responses during a demo.
export function getWithMeta(key) {
  const row = getStmt.get(key)
  if (!row) return { hit: false, value: null }
  if (row.expires_at < Date.now()) {
    deleteStmt.run(key)
    return { hit: false, value: null }
  }
  try {
    return { hit: true, value: JSON.parse(row.payload), expiresAt: row.expires_at }
  } catch {
    deleteStmt.run(key)
    return { hit: false, value: null }
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
  const { hit, value, expiresAt } = getWithMeta(key)
  if (hit) {
    return { ...value, cache: { hit: true, expiresInMs: expiresAt - Date.now() } }
  }

  const fresh = await fetcherFn()
  if (fresh?.ok) set(key, provider, fresh, ttlSeconds)
  return { ...fresh, cache: { hit: false } }
}

export function purgeExpired() {
  purgeStmt.run(Date.now())
}

export function getStats() {
  purgeExpired()
  const now = Date.now()
  const byProvider = statsStmt.all(now)
  const { count: totalEntries } = countAllStmt.get()
  return {
    totalEntries,
    byProvider: byProvider.map((r) => ({
      provider: r.provider,
      count: r.count,
      soonestExpiryMs: r.soonestExpiry - now,
      latestExpiryMs: r.latestExpiry - now,
    })),
  }
}
