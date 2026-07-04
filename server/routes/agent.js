import { Router } from 'express'
import { recommendBallot } from '../models/agent.js'
import { buildBallot } from '../models/buildBallot.js'

const router = Router()

// POST /api/agent/ballot  { location: { zip, state, county }, profile, ballot? }
// -> { ok, races: [...], cache, raceSources, warnings }
// profile = output of /api/scoring/quiz. If ballot is omitted, it's assembled
// server-side (best-effort real candidates per race, falling back to seed
// data where no live provider covers that office - see buildBallot.js). Each
// race returns a shortlist (2-3 good fits, never a single pick unless the
// race leaves no choice), an at-a-glance comparison, and all options. See
// server/models/context.md for shapes.
router.post('/ballot', async (req, res) => {
  const { location, profile } = req.body || {}
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
  res.json({
    ok: true,
    races: result.data.races || [],
    cache: result.cache,
    raceSources,
    warnings: buildWarnings,
  })
})

export default router
