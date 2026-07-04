import { Router } from 'express'
import { recommendBallot } from '../models/agent.js'

const router = Router()

// POST /api/agent/ballot  { location: { zip, state, county }, profile, ballot }
// -> { ok, races: [...], cache }
// profile = output of /api/scoring/quiz; ballot = races + candidates from the
// civic-data endpoints or seed data. Each race returns a shortlist (2-3 good
// fits, never a single pick unless the race leaves no choice), an at-a-glance
// comparison, and all options. See server/models/context.md for shapes.
router.post('/ballot', async (req, res) => {
  const { location, profile, ballot } = req.body || {}
  const result = await recommendBallot({ location, profile, ballot })
  if (!result.ok) {
    return res.status(result.error?.status || 502).json({ ok: false, warnings: [result] })
  }
  res.json({ ok: true, races: result.data.races || [], cache: result.cache })
})

export default router
