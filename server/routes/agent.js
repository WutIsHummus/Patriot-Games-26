import { Router } from 'express'
import { recommendBallot } from '../models/agent.js'
import { buildBallot } from '../models/buildBallot.js'
import { sendSms } from '../lib/sms.js'
import { normalizePhone } from '../db/users.js'

const router = Router()

// Demo guard: same allowlist as auth.js - only this number ever gets texted.
const ALLOWED_PHONE = '7133072507'

function toE164(phone) {
  const digits = normalizePhone(phone || '')
  if (digits !== ALLOWED_PHONE) return null
  return `+1${digits}`
}

// POST /api/agent/ballot  { location: { zip, state, county }, profile, ballot? }
// -> { ok, races: [...], cache, raceSources, warnings }
// profile = output of /api/scoring/quiz. If ballot is omitted, it's assembled
// server-side (best-effort real candidates per race, falling back to seed
// data where no live provider covers that office - see buildBallot.js). Each
// race returns a shortlist (2-3 good fits, never a single pick unless the
// race leaves no choice), an at-a-glance comparison, and all options. See
// server/models/context.md for shapes.
router.post('/ballot', async (req, res) => {
  const { location, profile, notifyPhone } = req.body || {}
  let { ballot } = req.body || {}
  let raceSources
  let buildWarnings = []

  if (!ballot) {
    const built = await buildBallot({ location })
    ballot = built.ballot
    raceSources = built.raceSources
    buildWarnings = built.warnings
  }

  const result = await recommendBallot({ location, profile, ballot })
  if (!result.ok) {
    return res.status(result.error?.status || 502).json({ ok: false, warnings: [...buildWarnings, result] })
  }

  // The scoring model's output shape has no photoUrl field (see context.md);
  // attach it here from the input ballot instead of trusting the model to
  // echo it back unchanged.
  const photosByCandidateId = new Map()
  for (const race of ballot.races || []) {
    for (const candidate of race.candidates || []) {
      if (candidate.photoUrl) photosByCandidateId.set(candidate.candidateId, candidate.photoUrl)
    }
  }
  const races = (result.data.races || []).map((race) => ({
    ...race,
    options: (race.options || []).map((option) => ({
      ...option,
      photoUrl: photosByCandidateId.get(option.candidateId) || null,
    })),
  }))
  // Matching can take a minute; text the voter when their results are ready.
  // Fire-and-forget: an SMS failure never blocks or fails the response.
  const e164 = toE164(notifyPhone)
  if (e164 && !result.cache?.hit) {
    const raceCount = (result.data.races || []).length
    sendSms(
      e164,
      `Your ballot is ready! We compared candidates in ${raceCount} race${raceCount === 1 ? '' : 's'} against your views. Open the app to see your matches.`,
    ).then((r) => {
      if (!r.sent) console.warn('Ballot-ready SMS not sent:', r.error)
    })
  }

  res.json({
    ok: true,
    races,
    cache: result.cache,
    raceSources,
    warnings: buildWarnings,
  })
})

export default router
