import { Router } from 'express'
import { providers } from '../providers/index.js'

const router = Router()

// POST /api/scoring/quiz  { answers: [{ question, answer, ... }] }
// -> { ok, profile: { axes, issuePreferences, summary }, cache }
router.post('/quiz', async (req, res) => {
  const result = await providers.openrouter.scoreQuiz({ answers: req.body?.answers })
  if (!result.ok) {
    return res.status(result.error?.status || 502).json({ ok: false, warnings: [result] })
  }
  res.json({ ok: true, profile: result.data, cache: result.cache })
})

// Candidate matching lives at POST /api/agent/ballot (server/models/) — the
// single implementation of profile-vs-candidate scoring. Do not add a second.

export default router
