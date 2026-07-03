import systemContext from './context.md?raw'

const DEFAULT_MODEL = 'gpt-4o-mini'

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
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      'Missing VITE_OPENAI_API_KEY. Add it to your .env file (see .env.example).',
    )
  }

  const messages = buildMessages([
    ...history,
    { role: 'user', content: userMessage },
  ])

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_OPENAI_MODEL ?? DEFAULT_MODEL,
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
