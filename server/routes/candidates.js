import { Router } from 'express'
import { providers } from '../providers/index.js'

const router = Router()

function dedupe(candidates) {
  const byKey = new Map()
  for (const c of candidates) {
    const key = `${c.name.trim().toLowerCase()}|${(c.office || '').trim().toLowerCase()}`
    const existing = byKey.get(key)
    if (existing) {
      existing.sources = [...new Set([...existing.sources, ...c.sources])]
    } else {
      byKey.set(key, { ...c })
    }
  }
  return [...byKey.values()]
}

router.get('/', async (req, res) => {
  const { office, level, state, district, cycle } = req.query
  const warnings = []
  const results = []

  if (!level || level === 'federal') {
    const fecResult = await providers.fec.getCandidatesByOffice({ office, state, district, cycle })
    if (fecResult.ok) {
      results.push(...fecResult.data)
    } else {
      warnings.push(fecResult)
    }
  }

  if (!level || level === 'state') {
    const osResult = await providers.openstates.getStateCandidatesByOffice({ state, district })
    if (osResult.ok) {
      results.push(...osResult.data)
    } else {
      warnings.push(osResult)
    }
  }

  if (results.length === 0 && warnings.length > 0) {
    return res.status(502).json({ ok: false, warnings })
  }

  const candidates = dedupe(results)
  res.json({ ok: true, count: candidates.length, candidates, warnings })
})

export default router
