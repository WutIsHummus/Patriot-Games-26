import { Router } from 'express'
import { hasKey } from '../config.js'
import { PROVIDER_NAMES } from '../providers/index.js'

const router = Router()

router.get('/', (req, res) => {
  const providers = Object.fromEntries(PROVIDER_NAMES.map((name) => [name, hasKey(name)]))
  res.json({ ok: true, providers })
})

export default router
