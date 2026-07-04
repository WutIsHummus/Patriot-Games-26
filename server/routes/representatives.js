import { Router } from 'express'
import { providers } from '../providers/index.js'

const router = Router()

router.get('/:id', async (req, res) => {
  const { id } = req.params
  const { source } = req.query

  if (source !== 'fec' && source !== 'openstates') {
    return res.status(400).json({ ok: false, error: { message: 'source query param must be "fec" or "openstates"' } })
  }

  const baseResult =
    source === 'fec'
      ? await providers.fec.getCandidateById(id)
      : await providers.openstates.getLegislatorById(id)

  if (!baseResult.ok) {
    return res.status(baseResult.error?.status || 502).json({ ok: false, warnings: [baseResult] })
  }

  const warnings = []
  let bio = null
  const bioResult = await providers.ballotpedia.getCandidateBio({ name: baseResult.data.name })
  if (bioResult.ok) {
    bio = bioResult.data
  } else if (!bioResult.unavailable) {
    warnings.push(bioResult)
  }

  res.json({
    ok: true,
    representative: {
      ...baseResult.data,
      bio: bio?.bio ?? null,
      contact: bio?.contact ?? null,
      socialMedia: bio?.socialMedia ?? null,
    },
    warnings,
  })
})

router.get('/:id/finance', async (req, res) => {
  const { id } = req.params
  const { source } = req.query

  if (source !== 'fec') {
    return res.status(400).json({ ok: false, error: { message: 'finance lookup only supports source=fec' } })
  }

  const result = await providers.fec.getCandidateFinance(id)
  if (!result.ok) {
    return res.status(result.error?.status || 502).json({ ok: false, warnings: [result] })
  }
  res.json({ ok: true, finance: result.data })
})

export default router
