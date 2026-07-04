import twilio from 'twilio'
import { TWILIO, hasTwilio } from '../config.js'

const client = hasTwilio() ? twilio(TWILIO.accountSid, TWILIO.authToken) : null

// Verify handles auth codes; plain outbound SMS needs a from-number. Prefer
// TWILIO_FROM_NUMBER, otherwise discover the account's first phone number
// once and reuse it.
let fromNumberPromise = null
async function getFromNumber() {
  if (TWILIO.fromNumber) return TWILIO.fromNumber
  if (!client) return null
  if (!fromNumberPromise) {
    fromNumberPromise = client.incomingPhoneNumbers
      .list({ limit: 1 })
      .then((nums) => nums[0]?.phoneNumber || null)
      .catch(() => null)
  }
  return fromNumberPromise
}

/**
 * Best-effort SMS. Never throws; returns { sent, error? } so callers can
 * treat notification failure as non-fatal.
 */
export async function sendSms(to, body) {
  if (!client) return { sent: false, error: 'Twilio not configured' }
  const from = await getFromNumber()
  if (!from) return { sent: false, error: 'No Twilio phone number available to send from' }
  try {
    await client.messages.create({ to, from, body })
    return { sent: true }
  } catch (err) {
    return { sent: false, error: err.message || 'SMS send failed' }
  }
}
