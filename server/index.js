import app from './app.js'
import { PORT } from './config.js'

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})
