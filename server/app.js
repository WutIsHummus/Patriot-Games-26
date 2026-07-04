import express from 'express'
import cors from 'cors'
import healthRoute from './routes/health.js'
import electionsRoute from './routes/elections.js'
import candidatesRoute from './routes/candidates.js'
import representativesRoute from './routes/representatives.js'
import cacheRoute from './routes/cache.js'
import scoringRoute from './routes/scoring.js'
import authRoute from './routes/auth.js'
import agentRoute from './routes/agent.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRoute)
app.use('/api/elections', electionsRoute)
app.use('/api/candidates', candidatesRoute)
app.use('/api/representatives', representativesRoute)
app.use('/api/cache', cacheRoute)
app.use('/api/scoring', scoringRoute)
app.use('/api/auth', authRoute)
app.use('/api/agent', agentRoute)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ ok: false, error: { message: err.message || 'Internal server error' } })
})

export default app
