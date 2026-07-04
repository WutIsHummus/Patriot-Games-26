import { ProviderError } from './errors.js'

const DEFAULT_TIMEOUT_MS = 8000

export async function fetchJson(provider, url, opts = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res
  try {
    res = await fetch(url, { ...opts, signal: controller.signal })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ProviderError(provider, `Request timed out after ${timeoutMs}ms`, 504)
    }
    throw new ProviderError(provider, err.message || 'Network error', 502)
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    let bodyText = ''
    try {
      bodyText = await res.text()
    } catch {
      // ignore body read failure
    }
    throw new ProviderError(provider, `Upstream ${res.status}: ${bodyText.slice(0, 300)}`, res.status)
  }

  try {
    return await res.json()
  } catch (err) {
    throw new ProviderError(provider, `Failed to parse JSON response: ${err.message}`, 502)
  }
}
