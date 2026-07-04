import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '../..')

dotenv.config({ path: join(projectRoot, '.env') })

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const { OPENROUTER_API_KEY: fileKey, OPENROUTER_MODEL: fileModel } = await import(
  './apiKey.js'
).catch(() => ({}))

const OPENROUTER_API_KEY = fileKey || process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL =
  fileModel || process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5'

const context = readFileSync(join(__dirname, 'context.md'), 'utf8').trim()
const prompt = readFileSync(join(__dirname, 'testPrompt.txt'), 'utf8').trim()

if (!prompt) {
  console.error('testPrompt.txt is empty. Add a prompt to test with.')
  process.exit(1)
}

if (!OPENROUTER_API_KEY) {
  console.error(
    'Missing OPENROUTER_API_KEY. Add it to src/models/apiKey.js or .env.',
  )
  process.exit(1)
}

console.log('Context:', `${context.slice(0, 80)}...`)
console.log('Prompt:', prompt)
console.log('---')

const response = await fetch(OPENROUTER_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'http://localhost',
    'X-OpenRouter-Title': 'Hackathon',
  },
  body: JSON.stringify({
    model: OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: context },
      { role: 'user', content: prompt },
    ],
  }),
})

if (!response.ok) {
  const error = await response.json().catch(() => ({}))
  console.error(error.error?.message ?? `Request failed (${response.status})`)
  process.exit(1)
}

const data = await response.json()
const reply = data.choices[0]?.message?.content ?? ''

console.log('Reply:', reply)
