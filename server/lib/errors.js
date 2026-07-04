export class ProviderError extends Error {
  constructor(provider, message, status) {
    super(message)
    this.name = 'ProviderError'
    this.provider = provider
    this.status = status ?? 502
  }
}

export function normalizeError(provider, err) {
  return {
    ok: false,
    source: provider,
    error: {
      message: err?.message || 'Unknown provider error',
      status: err?.status ?? 502,
    },
  }
}
