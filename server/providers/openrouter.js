import { createHash } from 'node:crypto'
import { fetchJson } from '../lib/httpClient.js'
import { normalizeError, ProviderError } from '../lib/errors.js'
import { parseLlmJson } from '../lib/llmJson.js'
import { wrap, buildKey } from '../db/cache.js'
import { KEYS, TTL, hasKey, OPENROUTER_MODEL } from '../config.js'

const PROVIDER = 'openrouter'
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'
const LLM_TIMEOUT_MS = 60000
const RESEARCH_TIMEOUT_MS = 45000

// Cache keys must stay short and deterministic; quiz answers and candidate
// lists are large objects, so key on a hash of the canonical JSON.
function hashParams(params) {
  return createHash('sha256').update(JSON.stringify(params)).digest('hex').slice(0, 32)
}

async function chatJson(systemPrompt, userPayload, { webSearch = false, timeoutMs = LLM_TIMEOUT_MS } = {}) {
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
        temperature: 0,
        response_format: { type: 'json_object' },
        ...(webSearch ? { tools: [{ type: 'openrouter:web_search' }] } : {}),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userPayload) },
        ],
      }),
    },
    timeoutMs,
  )

  const content = json.choices?.[0]?.message?.content
  if (!content) {
    throw new ProviderError(PROVIDER, 'Empty completion from OpenRouter', 502)
  }
  try {
    return parseLlmJson(content)
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

function notConfigured() {
  return { ok: false, source: PROVIDER, error: { message: 'OPENROUTER_API_KEY not configured', status: 501 } }
}

const CANDIDATE_RESEARCH_PROMPT = `You are a nonpartisan research assistant for a voter guide app.
You will be given a real political candidate's name, party, and the office they are running for.
Search the web for their actual, current public positions and record. Produce a JSON object with exactly this shape:
{
  "bio": string,
  "stances": [ { "issue": string, "position": string } ],
  "record": string,
  "sources": [ string ]
}
- bio: 1-2 neutral sentences describing who they are.
- stances: 3-6 of their real, specific public positions on issues relevant to the office (not generic party talking points). Base this only on what you find; if you cannot verify a stance, omit it rather than guessing.
- record: 1-2 sentences on relevant voting record or professional record, if any is found. If the input includes a "legislativeRecord" array of real bills they sponsored/cosponsored, treat those as ground truth and prioritize them over anything found via web search when writing this field.
- sources: URLs you used.
- If you cannot find reliable information distinguishing this real person, return { "bio": "", "stances": [], "record": "", "sources": [] }.
Never invent positions. Return only the JSON object.`

const RACE_DISCOVERY_PROMPT = `You are a nonpartisan research assistant for a voter guide app.
You will be given an office, a state, an optional district, and an election date.
Search the web to find who is actually running (declared/filed candidates) for that office in that election. Produce a JSON object with exactly this shape:
{
  "candidates": [ { "name": string, "party": string, "incumbent": boolean } ],
  "sources": [ string ]
}
- Include only real people you can verify are declared or filed candidates for this specific race. Never guess or fill in plausible names.
- party: "Democratic", "Republican", "Independent", "Libertarian", "Green", or the actual party name.
- sources: URLs you used.
- If you cannot verify at least two real candidates for this race, return { "candidates": [], "sources": [] }.
Return only the JSON object.`

export async function researchRaceCandidates({ office, state, district, county, electionDay } = {}) {
  if (!hasKey(PROVIDER)) return notConfigured()
  if (!office || !state) {
    return { ok: false, source: PROVIDER, error: { message: 'office and state are required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'researchRaceCandidates', {
    hash: hashParams({ office, state, district, county, electionDay, model: OPENROUTER_MODEL }),
  })
  return wrap(key, PROVIDER, TTL.CANDIDATE_RESEARCH, async () => {
    try {
      const data = await chatJson(
        RACE_DISCOVERY_PROMPT,
        { office, state, district, county, electionDay },
        { webSearch: true, timeoutMs: RESEARCH_TIMEOUT_MS },
      )
      return { ok: true, source: PROVIDER, data }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
}

export async function researchCandidateStances({ name, party, office, state, legislativeRecord } = {}) {
  if (!hasKey(PROVIDER)) return notConfigured()
  if (!name || !office) {
    return { ok: false, source: PROVIDER, error: { message: 'name and office are required', status: 400 } }
  }

  const key = buildKey(PROVIDER, 'researchCandidateStances', {
    hash: hashParams({ name, party, office, state, legislativeRecord, model: OPENROUTER_MODEL }),
  })
  return wrap(key, PROVIDER, TTL.CANDIDATE_RESEARCH, async () => {
    try {
      const data = await chatJson(
        CANDIDATE_RESEARCH_PROMPT,
        { name, party, office, state, legislativeRecord },
        { webSearch: true, timeoutMs: RESEARCH_TIMEOUT_MS },
      )
      return { ok: true, source: PROVIDER, data }
    } catch (err) {
      return normalizeError(PROVIDER, err)
    }
  })
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
