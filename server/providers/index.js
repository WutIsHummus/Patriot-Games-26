import * as civic from './civic.js'
import * as fec from './fec.js'
import * as openstates from './openstates.js'
import * as ballotpedia from './ballotpedia.js'

export const providers = { civic, fec, openstates, ballotpedia }
export const PROVIDER_NAMES = Object.keys(providers)
