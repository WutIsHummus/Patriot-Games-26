// Client-side fallback for quiz scoring and ballot matching so the UI works
// end-to-end without API keys. When the server LLM endpoints respond, they
// take precedence (same output shapes as /api/scoring/quiz and /api/agent/ballot).

// Rank 1–7 maps to agreement: 1 = strongly disagree, 7 = strongly agree.
function rankToAgreement(rank) {
  return (Number(rank) - 4) / 3
}

function rankToWeight(rank) {
  return (Math.abs(Number(rank) - 4) + 3) / 6
}

// Direction of agreement on each statement → political axes (-1..1 per axis).
const QUESTION_AXES = {
  'economy-affordability': { economic: -1 },
  immigration: { social: 1 },
  'iran-war': { social: 1 },
  tariffs: { economic: 1 },
  medicaid: { economic: -1 },
  'election-integrity': { social: 1 },
  redistricting: { social: -1 },
  'ai-politics': { social: -1 },
  crime: { social: 1 },
  'housing-affordability': { economic: -1, localFocus: 1 },
}

// answers: [{ questionId, topic, question, answer (1-7), answerLabel }]
export function scoreQuizLocally(answers) {
  let economic = 0
  let social = 0
  let localFocus = 0
  let econN = 0
  let socialN = 0
  let localN = 0
  const issuePreferences = []

  for (const a of answers) {
    const rank = Number(a.answer)
    if (!Number.isFinite(rank) || rank < 1 || rank > 7) continue

    const agreement = rankToAgreement(rank)
    const axes = QUESTION_AXES[a.questionId]
    if (axes) {
      if (axes.economic !== undefined) {
        economic += agreement * axes.economic
        econN++
      }
      if (axes.social !== undefined) {
        social += agreement * axes.social
        socialN++
      }
      if (axes.localFocus !== undefined) {
        localFocus += ((agreement + 1) / 2) * axes.localFocus
        localN++
      }
    }

    issuePreferences.push({
      issue: a.topic,
      stance: `${a.answerLabel} (${rank}/7)`,
      weight: rankToWeight(rank),
    })
  }

  issuePreferences.sort((a, b) => b.weight - a.weight)

  const profileAxes = {
    economic: econN ? economic / econN : 0,
    social: socialN ? social / socialN : 0,
    localFocus: localN ? localFocus / localN : 0.4,
  }

  const econDesc =
    profileAxes.economic < -0.25
      ? 'left-leaning on economics'
      : profileAxes.economic > 0.25
        ? 'market-oriented on economics'
        : 'economically moderate'
  const socialDesc =
    profileAxes.social < -0.25
      ? 'socially progressive'
      : profileAxes.social > 0.25
        ? 'socially traditional'
        : 'socially moderate'
  const summary = `You come across as ${econDesc} and ${socialDesc}. ${
    profileAxes.localFocus > 0.5
      ? 'Local issues weigh heavily in your choices.'
      : 'You weigh national and local issues about evenly.'
  } Your strongest ratings: ${issuePreferences
    .slice(0, 3)
    .map((p) => p.issue.toLowerCase())
    .join(', ')}.`

  return {
    axes: profileAxes,
    issuePreferences: issuePreferences.slice(0, 10),
    summary,
  }
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
