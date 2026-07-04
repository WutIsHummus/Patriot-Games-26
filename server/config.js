import 'dotenv/config'
import { fileURLToPath } from 'node:url'

export const PORT = Number(process.env.PORT) || 3001

export const KEYS = {
  civic: process.env.GOOGLE_CIVIC_API_KEY || '',
  fec: process.env.FEC_API_KEY || '',
  openstates: process.env.OPENSTATES_API_KEY || '',
  ballotpedia: process.env.BALLOTPEDIA_API_KEY || '',
}

export function hasKey(provider) {
  return Boolean(KEYS[provider])
}

export const TTL = {
  ELECTIONS: 6 * 3600,
  VOTER_INFO: 3600,
  CANDIDATES: 24 * 3600,
  FINANCE: 24 * 3600,
  BIO: 7 * 24 * 3600,
  LEGISLATORS: 24 * 3600,
}

// Vercel's filesystem is read-only except /tmp, and /tmp is not persisted
// across invocations. Locally we keep the cache in server/data.
export const DATA_DIR = process.env.VERCEL
  ? '/tmp/civic-cache'
  : fileURLToPath(new URL('./data', import.meta.url))
