// Sends server/models/testPrompt.txt (a JSON payload: location + profile +
// ballot) through the running API server.
// Usage: npm run server (in another terminal), then npm run test:agent
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_URL = process.env.API_URL || 'http://localhost:3001/api/agent/ballot'

const raw = readFileSync(join(__dirname, '../server/models/testPrompt.txt'), 'utf8').trim()

if (!raw) {
  console.error('testPrompt.txt is empty. Add a JSON payload to test with.')
  process.exit(1)
}

let payload
try {
  payload = JSON.parse(raw)
} catch (err) {
  console.error(`testPrompt.txt is not valid JSON: ${err.message}`)
  process.exit(1)
}

console.log('Payload:', JSON.stringify(payload, null, 2))
console.log('---')

const response = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})

const data = await response.json().catch(() => ({}))

if (!response.ok || !data.ok) {
  const message = data.warnings?.[0]?.error?.message ?? data.error?.message
  console.error(message ?? `Request failed (${response.status})`)
  process.exit(1)
}

console.log('Cache:', JSON.stringify(data.cache))
console.log('Races:', JSON.stringify(data.races, null, 2))
