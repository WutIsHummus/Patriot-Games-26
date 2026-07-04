import systemContext from './context.md?raw'
import { OPENROUTER_API_KEY, OPENROUTER_MODEL } from './apiKey.js'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

/**
 * Build the messages array for the chat API from conversation history.
 */
export function buildMessages(history = []) {
  return [
    { role: 'system', content: systemContext.trim() },
    ...history.map(({ role, content }) => ({ role, content })),
  ]
}

/**
 * Send a user message and return the assistant reply.
 *
 * @param {string} userMessage - The latest message from the visitor
 * @param {Array<{ role: 'user' | 'assistant', content: string }>} history - Prior turns
 * @returns {Promise<string>} Assistant reply text
 */
export async function sendMessage(userMessage, history = []) {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      'Missing OPENROUTER_API_KEY. Add your key in src/models/apiKey.js (see apiKey.example.js).',
    )
  }

  const messages = buildMessages([
    ...history,
    { role: 'user', content: userMessage },
  ])

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-OpenRouter-Title': 'Hackathon',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.error?.message ?? `Request failed with status ${response.status}`,
    )
  }

  const data = await response.json()
  return data.choices[0]?.message?.content ?? ''
}

/**
 * Create a simple in-memory chat session that tracks history.
 */
export function createAgentSession() {
  const history = []

  return {
    getHistory: () => [...history],

    clear: () => {
      history.length = 0
    },

    send: async (userMessage) => {
      const reply = await sendMessage(userMessage, history)
      history.push({ role: 'user', content: userMessage })
      history.push({ role: 'assistant', content: reply })
      return reply
    },
  }
}

export { systemContext }
