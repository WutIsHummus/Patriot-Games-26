import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { fetchJson } from '../lib/httpClient.js'
import { normalizeError, ProviderError } from '../lib/errors.js'
import { parseLlmJson } from '../lib/llmJson.js'
import { wrap, buildKey } from '../db/cache.js'
import { KEYS, TTL, hasKey, OPENROUTER_MODEL } from '../config.js'

const PROVIDER = 'openrouter'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const LLM_TIMEOUT_MS = 90000

const systemContext = readFileSync(
  fileURLToPath(new URL('./context.md', import.meta.url)),
  'utf8',
).trim()

function hashParams(params) {
  return createHash('sha256').update(JSON.stringify(params)).digest('hex').slice(0, 32)
}

/**
 * Produce the curated ballot: every race scored against the voter's profile,
 * per the contract in context.md. One-shot structured call, cached.
 *
 * @param {object} input
 * @param {object} input.location - { zip, state, county }
 * @param {object} input.profile - output of /api/scoring/quiz
 * @param {object} input.ballot - races + candidates with stance data
 * @returns {Promise<object>} provider result: { ok, data: { races }, cache } or { ok: false, error }
 */
export async function recommendBallot({ location, profile, ballot } = {}) {
  if (!hasKey(PROVIDER)) {
    return { ok: false, source: PROVIDER, error: { message: 'OPENROUTER_API_KEY not configured', status: 501 } }
  }
  if (!profile || typeof profile !== 'object') {
    return { ok: false, source: PROVIDER, error: { message: 'profile object is required', status: 400 } }
  }
  if (!ballot || typeof ballot !== 'object') {
    return { ok: false, source: PROVIDER, error: { message: 'ballot object is required', status: 400 } }
  }

  // systemContext is part of the key so editing context.md invalidates old entries.
  const key = buildKey(PROVIDER, 'recommendBallot', {
    hash: hashParams({ location, profile, ballot, model: OPENROUTER_MODEL, systemContext }),
  })
  return wrap(key, PROVIDER, TTL.SCORING, async () => {
    try {
      const json = await fetchJson(
        PROVIDER,
        OPENROUTER_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${KEYS.openrouter}`,
            'X-OpenRouter-Title': 'Hackathon Voter Guide',
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemContext },
              { role: 'user', content: JSON.stringify({ location, profile, ballot }) },
            ],
          }),
        },
        LLM_TIMEOUT_MS,
      )

      const content = json.choices?.[0]?.message?.content
      if (!content) {
        throw new ProviderError(PROVIDER, 'Empty completion from OpenRouter', 502)
      }
      let data
      try {
        data = parseLlmJson(content)
      } catch {
        throw new ProviderError(PROVIDER, 'Model returned non-JSON content', 502)
      }
      return { ok: true, source: PROVIDER, data }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}

export { systemContext }
