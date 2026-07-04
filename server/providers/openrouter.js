import { createHash } from 'node:crypto'
import { fetchJson } from '../lib/httpClient.js'
import { normalizeError, ProviderError } from '../lib/errors.js'
import { wrap, buildKey } from '../db/cache.js'
import { KEYS, TTL, hasKey, OPENROUTER_MODEL } from '../config.js'

const PROVIDER = 'openrouter'
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'
const LLM_TIMEOUT_MS = 60000

// Cache keys must stay short and deterministic; quiz answers and candidate
// lists are large objects, so key on a hash of the canonical JSON.
function hashParams(params) {
  return createHash('sha256').update(JSON.stringify(params)).digest('hex').slice(0, 32)
}

async function chatJson(systemPrompt, userPayload) {
  const json = await fetchJson(
    PROVIDER,
    BASE_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KEYS.openrouter}`,
        'X-OpenRouter-Title': 'Hackathon Civic Scoring',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userPayload) },
        ],
      }),
    },
    LLM_TIMEOUT_MS,
  )

  const content = json.choices?.[0]?.message?.content
  if (!content) {
    throw new ProviderError(PROVIDER, 'Empty completion from OpenRouter', 502)
  }
  try {
    return JSON.parse(content)
  } catch {
    throw new ProviderError(PROVIDER, 'Model returned non-JSON content', 502)
  }
}

const QUIZ_SCORING_PROMPT = `You are a nonpartisan political-alignment scorer for a voter guide app.
Given a user's quiz answers, produce a JSON object with exactly this shape:
{
  "axes": { "economic": <-1..1>, "social": <-1..1>, "localFocus": <0..1> },
  "issuePreferences": [ { "issue": string, "stance": string, "weight": <0..1> } ],
  "summary": string
}
- economic: -1 = strongly left/interventionist, 1 = strongly right/free-market.
- social: -1 = strongly progressive, 1 = strongly traditional.
- localFocus: how much the user weighs local issues over national ones.
- issuePreferences: the user's individual issue stances with importance weights, preserved even when they cut against the overall axes.
- summary: 2-3 neutral sentences describing the user's political profile. Never advocate.
Return only the JSON object.`

const CANDIDATE_SCORING_PROMPT = `You are a nonpartisan candidate-match scorer for a voter guide app.
You receive a user's political profile (axes + weighted issue preferences) and a list of candidates with whatever stance information is available.
Produce a JSON object with exactly this shape:
{
  "matches": [
    {
      "candidateId": string,
      "name": string,
      "score": <0..100>,
      "alignments": [ { "issue": string, "explanation": string } ],
      "conflicts": [ { "issue": string, "explanation": string } ],
      "dataQuality": "high" | "medium" | "low"
    }
  ]
}
- Score every candidate in the input, sorted best match first.
- Base scores only on the provided stance data; when stance data is thin, keep the score near 50 and set dataQuality low rather than guessing from party alone (party may inform but not determine).
- alignments/conflicts: concrete, cited to the provided data, neutral wording.
- Never tell the user who to vote for; describe fit, both ways.
Return only the JSON object.`

function notConfigured() {
  return { ok: false, source: PROVIDER, error: { message: 'OPENROUTER_API_KEY not configured', status: 501 } }
}

export async function scoreQuiz({ answers } = {}) {
  if (!hasKey(PROVIDER)) return notConfigured()
  if (!Array.isArray(answers) || answers.length === 0) {
    return { ok: false, source: PROVIDER, error: { message: 'answers array is required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'scoreQuiz', { hash: hashParams({ answers, model: OPENROUTER_MODEL }) })
  return wrap(key, PROVIDER, TTL.SCORING, async () => {
    try {
      const data = await chatJson(QUIZ_SCORING_PROMPT, { answers })
      return { ok: true, source: PROVIDER, data }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}

export async function scoreCandidates({ profile, candidates, election } = {}) {
  if (!hasKey(PROVIDER)) return notConfigured()
  if (!profile || typeof profile !== 'object') {
    return { ok: false, source: PROVIDER, error: { message: 'profile object is required', status: 400 } }
  }
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return { ok: false, source: PROVIDER, error: { message: 'candidates array is required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'scoreCandidates', {
    hash: hashParams({ profile, candidates, election, model: OPENROUTER_MODEL }),
  })
  return wrap(key, PROVIDER, TTL.SCORING, async () => {
    try {
      const data = await chatJson(CANDIDATE_SCORING_PROMPT, { profile, candidates, election })
      return { ok: true, source: PROVIDER, data }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}
