import { Router } from 'express'
import { findOrCreateUser } from '../db/users.js'

const router = Router()

// Demo-only "SMS" login: no code is actually sent, we just save the phone
// number and log the user in. Swap for real OTP (Twilio Verify etc.) later.
router.post('/login', (req, res) => {
  const { phoneNumber } = req.body || {}
  const user = findOrCreateUser(phoneNumber)

  if (!user) {
    return res.status(400).json({ ok: false, error: { message: 'A valid 10-digit phone number is required' } })
  }

  res.json({ ok: true, user: { id: user.id, phoneNumber: user.phone_number } })
})

export default router
