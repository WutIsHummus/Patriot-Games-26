import { Router } from 'express'
import { getStats } from '../db/cache.js'

const router = Router()

router.get('/stats', (req, res) => {
  res.json({ ok: true, ...getStats() })
})

export default router
