// Client-side fallback for quiz scoring and ballot matching so the UI works
// end-to-end without API keys. When the server LLM endpoints respond, they
// take precedence (same output shapes as /api/scoring/quiz and /api/agent/ballot).

const ANSWER_WEIGHTS = {
  // questionId: { answerValue: { economic, social, localFocus } } — each in -1..1
  'economy-role': {
    'strong-intervention': { economic: -0.9 },
    'some-intervention': { economic: -0.2 },
    minimal: { economic: 0.9 },
  },
  'housing-costs': {
    'build-public': { economic: -0.7, localFocus: 0.6 },
    'zoning-reform': { economic: 0.2, localFocus: 0.6 },
    market: { economic: 0.8, localFocus: 0.3 },
    'renter-protection': { economic: -0.8, localFocus: 0.6 },
  },
  immigration: {
    pathways: { social: -0.8 },
    balanced: { social: 0.1 },
    enforcement: { social: 0.8 },
  },
  'energy-grid': {
    renewables: { economic: -0.4, social: -0.5, localFocus: 0.5 },
    'all-of-above': { economic: 0.1, localFocus: 0.5 },
    'fossil-reliability': { economic: 0.5, social: 0.5, localFocus: 0.5 },
    'market-grid': { economic: 0.9, localFocus: 0.4 },
  },
  abortion: {
    protect: { social: -0.9 },
    limits: { social: 0.1 },
    restrict: { social: 0.9 },
  },
  'public-safety': {
    'community-programs': { social: -0.7, localFocus: 0.6 },
    both: { social: 0, localFocus: 0.6 },
    'more-police': { social: 0.8, localFocus: 0.5 },
  },
  education: {
    'public-schools': { economic: -0.6, social: -0.3 },
    mix: { economic: 0, social: 0 },
    'school-choice': { economic: 0.7, social: 0.5 },
    'local-control': { economic: 0.3, social: 0.3, localFocus: 0.5 },
  },
  climate: {
    urgent: { economic: -0.5, social: -0.7 },
    steady: { economic: 0, social: 0 },
    overblown: { economic: 0.6, social: 0.7 },
  },
  'property-tax': {
    'keep-services': { economic: -0.6, localFocus: 0.7 },
    'targeted-relief': { economic: -0.2, localFocus: 0.7 },
    cut: { economic: 0.8, localFocus: 0.6 },
  },
}

const PRIORITY_ISSUES = {
  economy: { issue: 'Economy', stance: 'Cost of living and jobs come first', weight: 0.9 },
  housing: { issue: 'Housing', stance: 'Housing affordability is the top priority', weight: 0.9 },
  rights: { issue: 'Civil rights', stance: 'Personal freedoms and civil rights come first', weight: 0.9 },
  safety: { issue: 'Public safety', stance: 'Safety and border security come first', weight: 0.9 },
}

// answers: [{ questionId, topic, question, answer, answerLabel }]
export function scoreQuizLocally(answers) {
  let economic = 0
  let social = 0
  let localFocus = 0
  let econN = 0
  let socialN = 0
  let localN = 0
  const issuePreferences = []

  for (const a of answers) {
    const w = ANSWER_WEIGHTS[a.questionId]?.[a.answer]
    if (w) {
      if (w.economic !== undefined) {
        economic += w.economic
        econN++
      }
      if (w.social !== undefined) {
        social += w.social
        socialN++
      }
      if (w.localFocus !== undefined) {
        localFocus += w.localFocus
        localN++
      }
      issuePreferences.push({
        issue: a.topic.replace(/^Local: /, ''),
        stance: a.answerLabel,
        weight: a.topic.startsWith('Local') ? 0.7 : 0.6,
      })
    }
    if (a.questionId === 'priority' && PRIORITY_ISSUES[a.answer]) {
      issuePreferences.unshift(PRIORITY_ISSUES[a.answer])
    }
  }

  const axes = {
    economic: econN ? economic / econN : 0,
    social: socialN ? social / socialN : 0,
    localFocus: localN ? localFocus / localN : 0.4,
  }

  const econDesc = axes.economic < -0.25 ? 'left-leaning on economics' : axes.economic > 0.25 ? 'market-oriented on economics' : 'economically moderate'
  const socialDesc = axes.social < -0.25 ? 'socially progressive' : axes.social > 0.25 ? 'socially traditional' : 'socially moderate'
  const summary = `You come across as ${econDesc} and ${socialDesc}. ${
    axes.localFocus > 0.5 ? 'Local issues weigh heavily in your choices.' : 'You weigh national and local issues about evenly.'
  } Your top priority: ${issuePreferences[0]?.issue?.toLowerCase() || 'not specified'}.`

  return { axes, issuePreferences: issuePreferences.slice(0, 6), summary }
}

// Candidate stance keywords → axis positions used for cosine-ish matching.
const STANCE_SIGNALS = [
  { pattern: /minimum wage|child tax credit|teacher pay|affordable housing|land bank|renter/i, economic: -0.7 },
  { pattern: /tax cut|deregulation|no-new-revenue|voucher|education savings/i, economic: 0.7 },
  { pattern: /renewable|winterization|climate|codifying access|legal pathways|mental-health/i, social: -0.6 },
  { pattern: /border enforcement|restriction|mandatory minimum|parental rights|police funding|sheriff/i, social: 0.6 },
  { pattern: /zoning|permitting|homestead|flood|grid|county|transit/i, localFocus: 0.5 },
]

function candidateAxes(candidate) {
  const text = [
    ...(candidate.stances || []).map((s) => `${s.issue} ${s.position}`),
    candidate.record || '',
  ].join(' ')
  let economic = 0
  let social = 0
  let localFocus = 0
  for (const sig of STANCE_SIGNALS) {
    if (sig.pattern.test(text)) {
      economic += sig.economic || 0
      social += sig.social || 0
      localFocus += sig.localFocus || 0
    }
  }
  return {
    economic: Math.max(-1, Math.min(1, economic)),
    social: Math.max(-1, Math.min(1, social)),
    localFocus: Math.max(0, Math.min(1, localFocus)),
  }
}

function matchScore(profileAxes, cAxes, dataQuality) {
  const dEcon = Math.abs(profileAxes.economic - cAxes.economic)
  const dSocial = Math.abs(profileAxes.social - cAxes.social)
  const raw = 100 - (dEcon * 30 + dSocial * 30)
  // Thin data pulls scores toward 50 rather than guessing.
  const scale = dataQuality === 'low' ? 0.4 : dataQuality === 'medium' ? 0.75 : 1
  return Math.round(50 + (raw - 50) * scale)
}

function buildOption(candidate, profile) {
  const stanceCount = (candidate.stances || []).length
  const dataQuality = stanceCount >= 4 ? 'high' : stanceCount >= 2 ? 'medium' : 'low'
  const cAxes = candidateAxes(candidate)
  const score = matchScore(profile.axes, cAxes, dataQuality)

  const prefIssues = new Set(profile.issuePreferences.map((p) => p.issue.toLowerCase()))
  const alignments = []
  const conflicts = []
  for (const s of candidate.stances || []) {
    const relevant = prefIssues.has(s.issue.toLowerCase())
    const sAxes = candidateAxes({ stances: [s] })
    const agrees =
      Math.abs(profile.axes.economic - sAxes.economic) + Math.abs(profile.axes.social - sAxes.social) < 1.2
    const entry = { issue: s.issue, explanation: s.position }
    if (agrees) alignments.push(entry)
    else conflicts.push(entry)
    if (relevant && agrees) entry.explanation += ' (matches one of your top issues)'
  }

  return {
    candidateId: candidate.candidateId,
    name: candidate.name,
    party: candidate.party,
    incumbent: candidate.incumbent,
    bio: candidate.bio,
    record: candidate.record,
    score,
    alignments: alignments.slice(0, 3),
    conflicts: conflicts.slice(0, 3),
    dataQuality,
  }
}

// Same shape as POST /api/agent/ballot -> races. Narrows to good options per
// race — never a single "vote for this" answer (see CLAUDE.md principles).
export function matchBallotLocally(profile, ballot) {
  return ballot.races.map((race) => {
    const options = race.candidates
      .map((c) => buildOption(c, profile))
      .sort((a, b) => b.score - a.score)

    // "Good options" = within 12 points of the leader, minimum 2 when the race
    // is contested so the voter always compares rather than being handed one name.
    const leader = options[0]
    let goodOptions = options.filter((o) => leader.score - o.score <= 12)
    if (goodOptions.length < 2 && options.length > 1) goodOptions = options.slice(0, 2)

    return {
      office: race.office,
      level: race.level,
      district: race.district,
      goodOptionIds: goodOptions.map((o) => o.candidateId),
      options,
    }
  })
}
