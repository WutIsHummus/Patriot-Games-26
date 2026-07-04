import * as civic from './civic.js'
import * as fec from './fec.js'
import * as openstates from './openstates.js'
import * as ballotpedia from './ballotpedia.js'
import * as openrouter from './openrouter.js'

export const providers = { civic, fec, openstates, ballotpedia, openrouter }
export const PROVIDER_NAMES = Object.keys(providers)
