import app from './app.js'
import { PORT } from './config.js'

app.listen(PORT, '127.0.0.1', () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})
