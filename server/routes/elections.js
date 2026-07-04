import { Router } from 'express'
import { providers } from '../providers/index.js'

const router = Router()

router.get('/', async (req, res) => {
  const { address } = req.query

  if (address) {
    const result = await providers.civic.getVoterInfo({ address })
    if (!result.ok) {
      return res.status(result.error?.status || 502).json({ ok: false, warnings: [result] })
    }
    return res.json({ ok: true, elections: result.data.election ? [result.data.election] : [], cache: result.cache })
  }

  const result = await providers.civic.getElections()
  if (!result.ok) {
    return res.status(result.error?.status || 502).json({ ok: false, warnings: [result] })
  }
  res.json({ ok: true, elections: result.data, cache: result.cache })
})

router.get('/:electionId/contests', async (req, res) => {
  const { address } = req.query
  const { electionId } = req.params

  if (!address) {
    return res.status(400).json({ ok: false, error: { message: 'address query param is required' } })
  }

  const result = await providers.civic.getVoterInfo({ address, electionId })
  if (!result.ok) {
    return res.status(result.error?.status || 502).json({ ok: false, warnings: [result] })
  }
  res.json({ ok: true, contests: result.data.contests, pollingLocations: result.data.pollingLocations, cache: result.cache })
})

export default router
