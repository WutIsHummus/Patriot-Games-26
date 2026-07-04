// Coarse ZIP3-prefix -> state mapping (no external dep). Good enough to route
// "which state is this voter in" for FEC/Open States lookups; not precinct-accurate.
const ZIP3_RANGES = [
  [5, 5, 'NY'], [6, 9, 'PR'], [10, 34, 'MA'], [35, 39, 'RI'], [40, 49, 'NH'], [50, 59, 'ME'],
  [60, 69, 'VT'], [70, 89, 'CT'], [100, 149, 'NY'], [150, 196, 'PA'], [197, 199, 'DE'],
  [200, 205, 'DC'], [206, 219, 'MD'], [220, 246, 'VA'], [247, 268, 'WV'], [270, 289, 'NC'],
  [290, 299, 'SC'], [300, 319, 'GA'], [320, 349, 'FL'], [350, 369, 'AL'], [370, 385, 'TN'],
  [386, 397, 'MS'], [398, 399, 'GA'], [400, 427, 'KY'], [430, 458, 'OH'], [459, 459, 'IN'],
  [460, 479, 'IN'], [480, 499, 'MI'], [500, 528, 'IA'], [530, 549, 'WI'], [550, 567, 'MN'],
  [570, 577, 'SD'], [580, 588, 'ND'], [590, 599, 'MT'], [600, 629, 'IL'], [630, 658, 'MO'],
  [660, 679, 'KS'], [680, 693, 'NE'], [700, 714, 'LA'], [716, 729, 'AR'], [730, 749, 'OK'],
  [750, 799, 'TX'], [800, 816, 'CO'], [820, 831, 'WY'], [832, 838, 'ID'], [840, 847, 'UT'],
  [850, 865, 'AZ'], [870, 884, 'NM'], [889, 898, 'NV'], [900, 961, 'CA'], [967, 968, 'HI'],
  [970, 979, 'OR'], [980, 994, 'WA'], [995, 999, 'AK'],
]

export function zipToState(zip) {
  const z = String(zip || '').trim().slice(0, 5)
  if (!/^\d{5}$/.test(z)) return null
  const prefix = Number(z.slice(0, 3))
  for (const [lo, hi, state] of ZIP3_RANGES) {
    if (prefix >= lo && prefix <= hi) return state
  }
  return null
}
