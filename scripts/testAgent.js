import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { OPENROUTER_API_KEY, OPENROUTER_MODEL } from '../src/models/apiKey.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const modelsDir = join(__dirname, '../src/models')

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const context = readFileSync(join(modelsDir, 'context.md'), 'utf8').trim()
const prompt = readFileSync(join(modelsDir, 'testPrompt.txt'), 'utf8').trim()

if (!prompt) {
  console.error('testPrompt.txt is empty. Add a prompt to test with.')
  process.exit(1)
}

if (!OPENROUTER_API_KEY) {
  console.error(
    'Missing OPENROUTER_API_KEY. Add your key in src/models/apiKey.js.',
  )
  process.exit(1)
}

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
