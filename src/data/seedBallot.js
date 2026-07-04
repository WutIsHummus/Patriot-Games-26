// Curated seed ballot for the November 3, 2026 general election (demo data,
// real offices and realistic-but-fictional candidates). Served in the same
// normalized shape the civic-data endpoints return, so live providers can be
// swapped in without UI changes. See docs/DATA_SOURCES.md.

export const SEED_LOCATION = { zip: '78701', state: 'TX', county: 'Travis' }

export const SEED_BALLOT = {
  electionName: 'November 3, 2026 General Election',
  electionDay: '2026-11-03',
  races: [
    {
      office: 'U.S. Senate',
      level: 'federal',
      district: null,
      candidates: [
        {
          candidateId: 'sen-rivera',
          name: 'Elena Rivera',
          party: 'Democratic',
          incumbent: false,
          bio: 'Former state comptroller focused on healthcare costs and grid reliability.',
          stances: [
            { issue: 'Economy', position: 'Supports raising the minimum wage and expanding child tax credits.' },
            { issue: 'Energy', position: 'Backs renewables plus storage buildout with federal grid funds.' },
            { issue: 'Immigration', position: 'Expand legal pathways; opposes family separation policies.' },
            { issue: 'Abortion', position: 'Supports codifying access protections.' },
          ],
          record: 'As comptroller, audited utility spending after the 2024 grid failures; backed a state child-care credit that passed with bipartisan support.',
        },
        {
          candidateId: 'sen-caldwell',
          name: 'Mark Caldwell',
          party: 'Republican',
          incumbent: true,
          bio: 'Two-term senator emphasizing border security and energy independence.',
          stances: [
            { issue: 'Economy', position: 'Supports corporate tax cuts and deregulation to spur growth.' },
            { issue: 'Energy', position: 'All-of-the-above: expand gas exports, permit nuclear faster.' },
            { issue: 'Immigration', position: 'Prioritizes border enforcement; supports skilled-visa expansion.' },
            { issue: 'Abortion', position: 'Supports state-level restrictions.' },
          ],
          record: 'Voted for the 2025 border security package and against the federal renewable-energy tax credit extension; co-sponsored a bipartisan semiconductor bill.',
        },
        {
          candidateId: 'sen-okafor',
          name: 'Denise Okafor',
          party: 'Independent',
          incumbent: false,
          bio: 'Austin small-business owner running on anti-corruption and housing.',
          stances: [
            { issue: 'Economy', position: 'Small-business tax relief; opposes corporate subsidies.' },
            { issue: 'Housing', position: 'Federal incentives for cities that reform restrictive zoning.' },
            { issue: 'Ethics', position: 'Ban on congressional stock trading.' },
          ],
          record: 'No prior elected office. Led a citywide coalition that passed an Austin zoning-reform ballot measure in 2024.',
        },
      ],
    },
    {
      office: 'Governor',
      level: 'state',
      district: null,
      candidates: [
        {
          candidateId: 'gov-hutchins',
          name: 'Laura Hutchins',
          party: 'Republican',
          incumbent: false,
          bio: 'State attorney general campaigning on property-tax cuts and school choice.',
          stances: [
            { issue: 'Taxes', position: 'Across-the-board property-tax rate cuts, capped appraisals.' },
            { issue: 'Education', position: 'Supports education savings accounts (vouchers).' },
            { issue: 'Public safety', position: 'More state funding for police departments.' },
            { issue: 'Energy', position: 'Prioritize gas capacity payments for grid reliability.' },
          ],
          record: 'As AG, sued the federal government over pipeline permitting delays; defended the state voucher pilot in court.',
        },
        {
          candidateId: 'gov-mendez',
          name: 'Carlos Mendez',
          party: 'Democratic',
          incumbent: false,
          bio: 'Former San Antonio mayor focused on public schools and grid reform.',
          stances: [
            { issue: 'Taxes', position: 'Targeted property-tax relief for seniors and first-time buyers.' },
            { issue: 'Education', position: 'Raise teacher pay; opposes vouchers.' },
            { issue: 'Public safety', position: 'Fund both police staffing and mental-health response teams.' },
            { issue: 'Energy', position: 'Winterization mandates and renewable-storage incentives.' },
          ],
          record: 'As mayor, passed a pre-K expansion and a police-staffing plan paired with a mental-health first-responder unit.',
        },
      ],
    },
    {
      office: 'County Judge',
      level: 'county',
      district: 'Travis County',
      candidates: [
        {
          candidateId: 'cj-brooks',
          name: 'Angela Brooks',
          party: 'Democratic',
          incumbent: true,
          bio: 'Incumbent county judge focused on housing affordability and flood infrastructure.',
          stances: [
            { issue: 'Housing', position: 'County land bank for affordable housing; permitting reform.' },
            { issue: 'Taxes', position: 'Hold the county rate flat; homestead exemption increase.' },
            { issue: 'Infrastructure', position: 'Bond package for flood-control upgrades.' },
          ],
          record: 'Led the 2025 flood-mitigation bond (passed 61%); raised the county homestead exemption to 20%.',
        },
        {
          candidateId: 'cj-tran',
          name: 'David Tran',
          party: 'Republican',
          incumbent: false,
          bio: 'Businessman running on cutting county spending and property-tax relief.',
          stances: [
            { issue: 'Housing', position: 'Streamline permitting; opposes county land purchases.' },
            { issue: 'Taxes', position: 'Cut the county tax rate to the no-new-revenue rate.' },
            { issue: 'Public safety', position: 'Increase sheriff department funding.' },
          ],
          record: 'No prior elected office. Served on the county appraisal review board for four years.',
        },
        {
          candidateId: 'cj-whitfield',
          name: 'Rosa Whitfield',
          party: 'Green',
          incumbent: false,
          bio: 'Environmental engineer running on climate resilience.',
          stances: [
            { issue: 'Infrastructure', position: 'Climate-resilience standard for all county projects.' },
            { issue: 'Housing', position: 'Density along transit corridors.' },
          ],
          record: 'No prior elected office. Consulted on the regional watershed plan.',
        },
      ],
    },
    {
      office: 'State House, District 46',
      level: 'state',
      district: 'HD-46',
      candidates: [
        {
          candidateId: 'hd46-nguyen',
          name: 'Lisa Nguyen',
          party: 'Democratic',
          incumbent: true,
          bio: 'Incumbent representative; vice-chair of the public education committee.',
          stances: [
            { issue: 'Education', position: 'Teacher pay raise tied to inflation; opposes vouchers.' },
            { issue: 'Housing', position: 'State preemption of exclusionary zoning near transit.' },
            { issue: 'Abortion', position: 'Supports restoring access.' },
          ],
          record: 'Authored the 2025 teacher-retention bonus bill (passed); voted against the voucher bill.',
        },
        {
          candidateId: 'hd46-porter',
          name: 'James Porter',
          party: 'Republican',
          incumbent: false,
          bio: 'Retired sheriff’s deputy running on public safety and parental rights.',
          stances: [
            { issue: 'Public safety', position: 'Mandatory minimums for fentanyl trafficking.' },
            { issue: 'Education', position: 'Supports vouchers and curriculum transparency.' },
            { issue: 'Taxes', position: 'State buy-down of local school property taxes.' },
          ],
          record: 'No prior elected office. 22 years in the sheriff’s department, including community-policing lead.',
        },
      ],
    },
  ],
}
