// Statement-based quiz. Each question is rated 1–7 (strongly disagree → strongly agree).

export const RANK_LABELS = [
  'Strongly disagree',
  'Disagree',
  'Somewhat disagree',
  'Neutral',
  'Somewhat agree',
  'Agree',
  'Strongly agree',
]

export const QUIZ_SCALE = { min: 1, max: 7 }

export const QUIZ_QUESTIONS = [
  {
    id: 'economy-affordability',
    topic: 'Economy/affordability',
    type: 'rank',
    question:
      'The government should prioritize policies that lower the cost of living, even if that means other priorities get less funding.',
  },
  {
    id: 'immigration',
    topic: 'Immigration',
    type: 'rank',
    question:
      'Immigration enforcement should be a top priority, even if it means stricter and more visible action against undocumented immigrants.',
  },
  {
    id: 'iran-war',
    topic: 'Iran war/foreign policy',
    type: 'rank',
    question:
      'U.S. military involvement in Iran was justified and should continue if needed.',
  },
  {
    id: 'tariffs',
    topic: 'Tariffs',
    type: 'rank',
    question:
      'Tariffs on imported goods are worth the cost to consumers if they protect American industries.',
  },
  {
    id: 'medicaid',
    topic: 'Healthcare/Medicaid',
    type: 'rank',
    question:
      'Medicaid should be fully funded, even if it means cuts elsewhere.',
  },
  {
    id: 'election-integrity',
    topic: 'Election integrity/democracy',
    type: 'rank',
    question:
      'Ensuring election security should be a higher priority than making voting more accessible.',
  },
  {
    id: 'redistricting',
    topic: 'Redistricting/gerrymandering',
    type: 'rank',
    question:
      'Congressional district lines should be drawn by independent commissions rather than state legislatures.',
  },
  {
    id: 'ai-politics',
    topic: 'AI in politics/governance',
    type: 'rank',
    question:
      'The government should regulate the use of AI in political campaigns and advertising.',
  },
  {
    id: 'crime',
    topic: 'Crime',
    type: 'rank',
    question:
      'Reducing crime should be a top priority, even if it requires expanding police funding and authority.',
  },
  {
    id: 'housing-affordability',
    topic: 'Housing affordability',
    type: 'rank',
    question:
      'The government should intervene more directly to make housing more affordable.',
  },
  {
    id: 'ai-data-centers',
    topic: 'AI data centers',
    type: 'rank',
    question:
      'The government should prioritize building and supporting AI data centers, even if it affects local energy costs and water use.',
  },
  {
    id: 'open-priorities',
    topic: 'Your priorities',
    type: 'open',
    question:
      'What other issues or policies matter most to you when choosing a candidate? (comma seperated)',
    placeholder: 'e.g. lower gas prices, ending wars, school funding',
  },
]
