import { Router } from 'express'
import twilio from 'twilio'
import { findOrCreateUser, normalizePhone } from '../db/users.js'
import { TWILIO, hasTwilio } from '../config.js'

const router = Router()

const client = hasTwilio() ? twilio(TWILIO.accountSid, TWILIO.authToken) : null

// Demo guard: only this number is allowed to receive real SMS codes.
const ALLOWED_PHONE = '7133072507'

function toE164(phone) {
  const digits = normalizePhone(phone)
  return digits.length === 10 ? `+1${digits}` : null
}

// POST /api/auth/send-code  { phoneNumber }
router.post('/send-code', async (req, res) => {
  const e164 = toE164(req.body?.phoneNumber)
  if (!e164) {
    return res.status(400).json({ ok: false, error: { message: 'A valid 10-digit phone number is required' } })
  }
  if (normalizePhone(req.body?.phoneNumber) !== ALLOWED_PHONE) {
    return res.status(403).json({ ok: false, error: { message: 'This demo only accepts a specific phone number' } })
  }

  if (!client) {
    // Demo fallback: no Twilio configured, pretend a code was sent.
    return res.json({ ok: true, sent: true, demo: true })
  }

  try {
    await client.verify.v2.services(TWILIO.verifyServiceSid).verifications.create({
      to: e164,
      channel: 'sms',
    })
    res.json({ ok: true, sent: true })
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: { message: err.message || 'Failed to send code' } })
  }
})

// POST /api/auth/verify-code  { phoneNumber, code }
router.post('/verify-code', async (req, res) => {
  const { phoneNumber, code } = req.body || {}
  const e164 = toE164(phoneNumber)
  if (!e164 || !code) {
    return res.status(400).json({ ok: false, error: { message: 'phoneNumber and code are required' } })
  }

  if (!client) {
    // Demo fallback: no Twilio configured, any code logs in.
    const user = findOrCreateUser(phoneNumber)
    return res.json({ ok: true, user: { id: user.id, phoneNumber: user.phone_number }, demo: true })
  }

  try {
    const check = await client.verify.v2.services(TWILIO.verifyServiceSid).verificationChecks.create({
      to: e164,
      code,
    })
    if (check.status !== 'approved') {
      return res.status(401).json({ ok: false, error: { message: 'Incorrect or expired code' } })
    }
    const user = findOrCreateUser(phoneNumber)
    res.json({ ok: true, user: { id: user.id, phoneNumber: user.phone_number } })
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: { message: err.message || 'Failed to verify code' } })
  }
})

export default router
