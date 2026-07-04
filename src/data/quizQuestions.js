// Demo quiz bank. In the full product these are AI-curated per user from
// location + local issues + current news (see CLAUDE.md); the shape here is
// the same one the generator will produce, so the UI won't change.

export const QUIZ_QUESTIONS = [
  {
    id: 'economy-role',
    topic: 'Economy',
    question: 'What role should the government play in the economy?',
    options: [
      { value: 'strong-intervention', label: 'Actively regulate markets and expand public programs' },
      { value: 'some-intervention', label: 'Set guardrails, but mostly let markets work' },
      { value: 'minimal', label: 'Reduce regulation and taxes wherever possible' },
      { value: 'unsure', label: "I'm not sure / it depends" },
    ],
  },
  {
    id: 'housing-costs',
    topic: 'Local: Housing',
    question: 'Housing costs in your area have risen sharply. What is the best response?',
    options: [
      { value: 'build-public', label: 'Public investment in affordable housing' },
      { value: 'zoning-reform', label: 'Loosen zoning so builders can add supply' },
      { value: 'market', label: 'Let the market adjust — avoid intervention' },
      { value: 'renter-protection', label: 'Stronger renter protections and rent stabilization' },
    ],
  },
  {
    id: 'immigration',
    topic: 'Immigration',
    question: 'Which comes closest to your view on immigration policy?',
    options: [
      { value: 'pathways', label: 'Expand legal pathways and protect long-term residents' },
      { value: 'balanced', label: 'Secure the border and expand legal immigration' },
      { value: 'enforcement', label: 'Prioritize enforcement and reduce overall immigration' },
      { value: 'unsure', label: "I'm not sure / it depends" },
    ],
  },
  {
    id: 'energy-grid',
    topic: 'Local: Energy',
    question: 'After recent grid failures, how should your state secure its power grid?',
    options: [
      { value: 'renewables', label: 'Accelerate renewables plus storage investment' },
      { value: 'all-of-above', label: 'All of the above: gas, nuclear, and renewables' },
      { value: 'fossil-reliability', label: 'Prioritize reliable gas and coal capacity' },
      { value: 'market-grid', label: 'Deregulate further and let prices drive investment' },
    ],
  },
  {
    id: 'abortion',
    topic: 'Social policy',
    question: 'Which comes closest to your view on abortion access?',
    options: [
      { value: 'protect', label: 'Should be legal and protected in most cases' },
      { value: 'limits', label: 'Legal with some limits (e.g., late-term restrictions)' },
      { value: 'restrict', label: 'Should be restricted in most cases' },
      { value: 'no-answer', label: 'Prefer not to answer' },
    ],
  },
  {
    id: 'public-safety',
    topic: 'Local: Public safety',
    question: 'What is the most effective way to improve public safety in your community?',
    options: [
      { value: 'community-programs', label: 'Invest in mental-health and community programs' },
      { value: 'both', label: 'Both more officers and more community programs' },
      { value: 'more-police', label: 'More police funding and tougher sentencing' },
      { value: 'unsure', label: "I'm not sure / it depends" },
    ],
  },
  {
    id: 'education',
    topic: 'Education',
    question: 'Where should public education funding go?',
    options: [
      { value: 'public-schools', label: 'Raise teacher pay and fund neighborhood public schools' },
      { value: 'mix', label: 'Fund public schools but allow charter growth' },
      { value: 'school-choice', label: 'Vouchers/ESAs so funding follows the student' },
      { value: 'local-control', label: 'Leave it to local districts to decide' },
    ],
  },
  {
    id: 'climate',
    topic: 'Climate',
    question: 'How urgent is government action on climate change?',
    options: [
      { value: 'urgent', label: 'Very urgent — aggressive targets now' },
      { value: 'steady', label: 'Important, but transition gradually' },
      { value: 'overblown', label: 'Concerns are overblown — protect jobs and energy costs first' },
      { value: 'unsure', label: "I'm not sure / it depends" },
    ],
  },
  {
    id: 'property-tax',
    topic: 'Local: Taxes',
    question: 'Property taxes fund most local services. What should your county do?',
    options: [
      { value: 'keep-services', label: 'Keep rates steady to protect schools and services' },
      { value: 'targeted-relief', label: 'Targeted relief for seniors and low-income homeowners' },
      { value: 'cut', label: 'Cut rates across the board' },
      { value: 'unsure', label: "I'm not sure / it depends" },
    ],
  },
  {
    id: 'priority',
    topic: 'Your priorities',
    question: 'Which issue matters most to you when choosing a candidate?',
    options: [
      { value: 'economy', label: 'Economy, jobs, and cost of living' },
      { value: 'housing', label: 'Housing affordability' },
      { value: 'rights', label: 'Civil rights and personal freedoms' },
      { value: 'safety', label: 'Public safety and border security' },
    ],
  },
]
