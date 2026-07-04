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

// POST /api/scoring/candidates  { profile, candidates: [...], election? }
// -> { ok, matches: [...], cache }
router.post('/candidates', async (req, res) => {
  const { profile, candidates, election } = req.body || {}
  const result = await providers.openrouter.scoreCandidates({ profile, candidates, election })
  if (!result.ok) {
    return res.status(result.error?.status || 502).json({ ok: false, warnings: [result] })
  }
  res.json({ ok: true, matches: result.data.matches || [], cache: result.cache })
})

export default router
