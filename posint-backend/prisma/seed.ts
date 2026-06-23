import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────
// HELPER — create sub-records only if none exist yet
// ─────────────────────────────────────────────────────────────
async function pol(id: string, d: {
  career?: any[]
  committees?: any[]
  assets?: any[]
  projects?: any[]
  votes?: any[]
  social?: any[]
  stats?: object
}) {
  if (d.career?.length && !(await prisma.careerEvent.count({ where: { politicianId: id } })))
    await prisma.careerEvent.createMany({ data: d.career.map(c => ({ ...c, politicianId: id })) })

  if (d.committees?.length && !(await prisma.committeeAssignment.count({ where: { politicianId: id } })))
    await prisma.committeeAssignment.createMany({ data: d.committees.map(c => ({ ...c, politicianId: id })) })

  if (d.assets?.length && !(await prisma.assetDeclaration.count({ where: { politicianId: id } })))
    await prisma.assetDeclaration.createMany({ data: d.assets.map(a => ({ ...a, politicianId: id })) })

  if (d.projects?.length && !(await prisma.constituencyProject.count({ where: { politicianId: id } })))
    await prisma.constituencyProject.createMany({ data: d.projects.map(p => ({ ...p, politicianId: id })) })

  if (d.votes?.length && !(await prisma.votingRecord.count({ where: { politicianId: id } })))
    await prisma.votingRecord.createMany({ data: d.votes.map(v => ({ ...v, politicianId: id })) })

  if (d.social?.length && !(await prisma.socialMention.count({ where: { politicianId: id } })))
    await prisma.socialMention.createMany({ data: d.social.map(s => ({ ...s, politicianId: id })) })

  if (d.stats)
    await prisma.politicianSocialStats.upsert({
      where: { politicianId: id }, update: {},
      create: { politicianId: id, ...d.stats },
    })
}

async function main() {
  console.log('🌱  POSINT Nigeria — seeding database…\n')

  // ═══════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════
  const adminHash = await bcrypt.hash('Admin@123!', 12)
  const editorHash = await bcrypt.hash('Editor@123!', 12)
  await prisma.user.upsert({ where: { email: 'admin@posint.ng' }, update: {}, create: { email: 'admin@posint.ng', passwordHash: adminHash, displayName: 'POSINT Admin', role: 'ADMIN' } })
  await prisma.user.upsert({ where: { email: 'editor@posint.ng' }, update: {}, create: { email: 'editor@posint.ng', passwordHash: editorHash, displayName: 'POSINT Editor', role: 'EDITOR' } })
  console.log('✅  Users')

  // ═══════════════════════════════════════════════════════════
  // DATA SOURCES
  // ═══════════════════════════════════════════════════════════
  for (const s of [
    { name: 'National Assembly (NASS)', url: 'https://nass.gov.ng', type: 'scraper', description: 'Bills, motions, plenary proceedings, voting records' },
    { name: 'INEC Election Results Portal', url: 'https://www.inecnigeria.org', type: 'scraper', description: 'Official election results and candidate data' },
    { name: 'EFCC Press Releases', url: 'https://efcc.gov.ng/news', type: 'rss', description: 'EFCC case updates, convictions, press releases' },
    { name: 'ICPC Updates', url: 'https://icpc.gov.ng/news', type: 'rss', description: 'ICPC investigation and case news' },
    { name: 'Code of Conduct Bureau', url: 'https://ccb.gov.ng', type: 'manual', description: 'Public officer asset declarations' },
    { name: 'BudgIT Nigeria', url: 'https://budgit.org', type: 'api', description: 'Budget tracking and constituency project data' },
    { name: 'Premium Times Nigeria', url: 'https://premiumtimesng.com', type: 'rss', description: 'Investigative journalism and political news' },
    { name: 'Punch Newspapers', url: 'https://punchng.com', type: 'rss', description: 'Nigerian political news and analysis' },
    { name: 'Vanguard Nigeria', url: 'https://vanguardngr.com', type: 'rss', description: 'Political reporting and features' },
    { name: 'TheCable Nigeria', url: 'https://www.thecable.ng', type: 'rss', description: 'In-depth political reporting and verification' },
  ]) { await prisma.dataSource.upsert({ where: { name: s.name }, update: {}, create: s }) }
  console.log('✅  Data sources')

  // ═══════════════════════════════════════════════════════════
  // PARTIES
  // ═══════════════════════════════════════════════════════════
  const apc = await prisma.politicalParty.upsert({ where: { abbreviation: 'APC' }, update: {}, create: { name: 'All Progressives Congress', abbreviation: 'APC', slug: 'apc', color: '#2563EB', foundedYear: 2013, ideology: 'Big-tent conservatism, Progressivism, Economic liberalism', chairman: 'Abdullahi Ganduje', headquarters: '40 Blantyre Street, Wuse II, Abuja', websiteUrl: 'https://apc.com.ng', seatsTotal: 263, senateSeats: 59, houseSeats: 178, governors: 21 } })
  const pdp = await prisma.politicalParty.upsert({ where: { abbreviation: 'PDP' }, update: {}, create: { name: 'Peoples Democratic Party', abbreviation: 'PDP', slug: 'pdp', color: '#DC2626', foundedYear: 1998, ideology: 'Social democracy, Liberalism, Pan-Africanism', chairman: 'Iliya Damagun', headquarters: 'Wadata Plaza, Ralph Shodeinde Street, Abuja', websiteUrl: 'https://pdpnigeria.org', seatsTotal: 157, senateSeats: 36, houseSeats: 105, governors: 13 } })
  const lp  = await prisma.politicalParty.upsert({ where: { abbreviation: 'LP'   }, update: {}, create: { name: 'Labour Party', abbreviation: 'LP', slug: 'lp', color: '#16A34A', foundedYear: 2002, ideology: 'Social democracy, Labour rights, Progressive nationalism', chairman: 'Julius Abure', headquarters: 'Area 8, Garki, Abuja', seatsTotal: 45, senateSeats: 8, houseSeats: 35, governors: 1 } })
  const nnpp = await prisma.politicalParty.upsert({ where: { abbreviation: 'NNPP' }, update: {}, create: { name: 'New Nigeria Peoples Party', abbreviation: 'NNPP', slug: 'nnpp', color: '#F97316', foundedYear: 2001, ideology: 'Progressive populism, Grassroots democracy', chairman: 'Agbo Major', headquarters: 'Kano, Kano State', seatsTotal: 21, senateSeats: 2, houseSeats: 19, governors: 1 } })
  const apga = await prisma.politicalParty.upsert({ where: { abbreviation: 'APGA' }, update: {}, create: { name: 'All Progressives Grand Alliance', abbreviation: 'APGA', slug: 'apga', color: '#9333EA', foundedYear: 2002, ideology: 'Igbo nationalism, Social democracy', chairman: 'Edozie Njoku', headquarters: 'Awka, Anambra State', seatsTotal: 8, senateSeats: 1, houseSeats: 5, governors: 1 } })
  console.log('✅  Parties')

  // ═══════════════════════════════════════════════════════════
  // POLITICIANS 1–5
  // ═══════════════════════════════════════════════════════════
  console.log('Seeding politicians 1–5…')

  // ── 1. Godswill Akpabio ─────────────────────────────────────
  const akpabio = await prisma.politician.upsert({
    where: { slug: 'godswill-akpabio' }, update: {},
    create: {
      slug: 'godswill-akpabio', name: 'Godswill Akpabio', partyId: apc.id,
      position: 'Senate President', chamber: 'SENATE',
      constituency: 'Akwa Ibom North-West Senate District', state: 'Akwa Ibom', lga: 'Essien Udim',
      dateOfBirth: new Date('1962-10-09'), gender: 'Male',
      education: 'LLB (Hons), University of Calabar; BL, Nigerian Law School; MSc, University of Uyo',
      biography: 'Godswill Obot Akpabio is the 15th Senate President of Nigeria, elected June 2023. He served two terms as Governor of Akwa Ibom State (2007–2015), transforming the state with landmark infrastructure projects. He was Senator for Akwa Ibom North-West (2015–2019), then Minister of Niger Delta Affairs (2019–2023) before returning to lead the Senate. A lawyer and administrator, Akpabio is widely credited as a key architect of the Petroleum Industry Act 2021.',
      firstElected: 2007, currentTermStart: 2023, yearsInOffice: 17,
      billsSponsored: 45, attendanceRate: 91.5, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/godswill-akpabio.jpg',
      sourceUrl: 'https://nass.gov.ng/senator/akpabio',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: akpabio.id }, update: {},
    create: { politicianId: akpabio.id, email: 'senpresident@nass.gov.ng', phone: '+234-9-291-6000', officeAddress: 'Office of the Senate President, National Assembly Complex, Three Arms Zone, Abuja', website: 'https://akpabio.ng', twitterHandle: '@senakpabio', facebookUrl: 'https://facebook.com/godswillakpabio', instagramHandle: '@godswillakpabio' },
  })
  await pol(akpabio.id, {
    career: [
      { year: 1998, title: 'Speaker, Akwa Ibom State House of Assembly', description: 'Elected youngest Speaker in Akwa Ibom history at age 35', category: 'Legislative' },
      { year: 2003, title: 'Member, House of Representatives', description: 'Elected to represent Essien Udim/Ikot Ekpene federal constituency', category: 'Legislative' },
      { year: 2007, title: 'Governor of Akwa Ibom State (1st term)', description: 'Won gubernatorial election; launched Ibom Deep Seaport and Ibom Power Plant', category: 'Executive' },
      { year: 2011, title: 'Governor of Akwa Ibom State (2nd term)', description: 'Re-elected; completed 800km road network and Uyo City Stadium', category: 'Executive' },
      { year: 2015, title: 'Senator, Akwa Ibom North-West', description: 'Elected to Senate; served on Petroleum Committee and co-authored PIA', category: 'Legislative' },
      { year: 2019, title: 'Minister of Niger Delta Affairs', description: 'Appointed by President Buhari; oversaw NDDC and Niger Delta development', category: 'Executive' },
      { year: 2023, title: 'Senate President', description: 'Elected 15th Senate President of the Federal Republic of Nigeria', category: 'Legislative' },
    ],
    committees: [
      { committeeName: 'Senate Business Committee', role: 'Chairman', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
      { committeeName: 'Committee on Rules and Business', role: 'Chairman', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
      { committeeName: 'Committee on Petroleum Upstream', role: 'Ex-Officio Member', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Residential mansion in Maitama, Abuja (6-bedroom duplex with pool)', estimatedValueKobo: 300_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/akpabio-2023' },
      { category: 'Real Estate', description: 'Commercial plaza in Uyo, Akwa Ibom State', estimatedValueKobo: 150_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/akpabio-2023' },
      { category: 'Vehicles', description: 'Mercedes-Benz S-Class, Toyota Land Cruiser V8, Range Rover Autobiography', estimatedValueKobo: 35_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Bank Accounts', description: 'Fixed deposits and savings in Access Bank, First Bank, Zenith Bank', estimatedValueKobo: 120_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/akpabio-2023' },
      { category: 'Investments', description: 'Equity holdings in Dangote Cement, MTN Nigeria, Nigerian Breweries', estimatedValueKobo: 80_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Essien Udim Road Network Rehabilitation', description: 'Rehabilitation of 45km road network in Essien Udim LGA connecting rural communities', location: 'Essien Udim, Akwa Ibom', budgetKobo: 3_500_000_000_000n, status: 'COMPLETED', year: 2022, completionPct: 100, contractor: 'Julius Berger Nigeria Plc', sourceUrl: 'https://budgit.org/project/essien-udim-roads' },
      { title: 'Mkpat Enin Community Water Supply', description: 'Boreholes and water distribution network for Mkpat Enin community, 12,000 beneficiaries', location: 'Mkpat Enin, Akwa Ibom', budgetKobo: 750_000_000_000n, status: 'COMPLETED', year: 2021, completionPct: 100, contractor: 'Setraco Nigeria Ltd', sourceUrl: 'https://budgit.org/project/mkpat-enin-water' },
      { title: 'Eket–Nsit Ubium Dual Carriageway', description: '28km dual carriageway connecting Eket port area to Nsit Ubium', location: 'Eket, Akwa Ibom', budgetKobo: 5_000_000_000_000n, status: 'ONGOING', year: 2023, completionPct: 42, contractor: 'CGC Nigeria Limited', sourceUrl: 'https://budgit.org/project/eket-nsit-road' },
    ],
    votes: [
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED', sourceUrl: 'https://nass.gov.ng/bills/pia-2021' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED', sourceUrl: 'https://nass.gov.ng/bills/electoral-act-2022' },
      { billTitle: 'National Health Insurance Authority Act, 2022', vote: 'YES', sessionDate: new Date('2022-05-17'), billStatus: 'PASSED' },
      { billTitle: 'Student Loan (Access to Higher Education) Act, 2023', vote: 'YES', sessionDate: new Date('2023-04-12'), billStatus: 'PASSED' },
      { billTitle: 'Social Media (Prohibition of Falsehood) Bill, 2019', vote: 'YES', sessionDate: new Date('2019-11-05'), billStatus: 'REJECTED' },
      { billTitle: 'Local Government Autonomy (Constitution Amendment) Bill, 2024', vote: 'YES', sessionDate: new Date('2024-03-26'), billStatus: 'THIRD_READING' },
    ],
    social: [
      { platform: 'TWITTER', content: 'Senate President Akpabio defends the controversial NASS budget of ₦4.9 trillion. Many Nigerians are outraged. Is this leadership or looting?', url: 'https://twitter.com/user/status/1746001', publishedAt: new Date('2024-01-15'), sentiment: 'NEGATIVE', sentimentScore: -0.55, engagementTotal: 9800, likes: 4200, shares: 4100, comments: 1500, isByPolitician: false },
      { platform: 'TWITTER', content: '@senakpabio: Proud that the Senate has passed the Minimum Wage Amendment. Nigerian workers deserve a living wage. We listened. #NigerianSenate', url: 'https://twitter.com/senakpabio/status/1802201', publishedAt: new Date('2024-07-10'), sentiment: 'POSITIVE', sentimentScore: 0.74, engagementTotal: 14200, likes: 9100, shares: 3500, comments: 1600, isByPolitician: true },
      { platform: 'FACEBOOK', content: 'Akpabio has delivered for Akwa Ibom people like no one before. His record as governor speaks for itself — roads, power, hospitals. Proud Akwaibomian!', url: 'https://facebook.com/post/akpabio003', publishedAt: new Date('2024-03-10'), sentiment: 'POSITIVE', sentimentScore: 0.81, engagementTotal: 11400, likes: 8900, shares: 1900, comments: 600, isByPolitician: false },
      { platform: 'TWITTER', content: 'Why is the Senate President silent on the Niger Delta oil spills devastating fishing communities? He is from the region! Disappointing.', url: 'https://twitter.com/user/status/1820001', publishedAt: new Date('2024-05-18'), sentiment: 'NEGATIVE', sentimentScore: -0.61, engagementTotal: 5100, likes: 1800, shares: 2400, comments: 900, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'Senate President Akpabio commissions the upgraded Ibom International Airport. Infrastructure for the people 🛫🇳🇬 #AkwaIbom', url: 'https://instagram.com/p/akpabio05', publishedAt: new Date('2024-04-22'), sentiment: 'POSITIVE', sentimentScore: 0.69, engagementTotal: 18700, likes: 16200, shares: 1600, comments: 900, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.298, totalMentions: 48500, followerCount: 945000, engagementRate: 3.9 },
  })

  // ── 2. Tajudeen Abbas ───────────────────────────────────────
  const abbas = await prisma.politician.upsert({
    where: { slug: 'tajudeen-abbas' }, update: {},
    create: {
      slug: 'tajudeen-abbas', name: 'Tajudeen Abbas', partyId: apc.id,
      position: 'Speaker, House of Representatives', chamber: 'HOUSE_OF_REPRESENTATIVES',
      constituency: 'Zaria', state: 'Kaduna', lga: 'Zaria',
      dateOfBirth: new Date('1969-11-18'), gender: 'Male',
      education: 'BSc Economics, Ahmadu Bello University; MSc Economics, University of Ibadan; PhD, University of Ibadan',
      biography: 'Rt. Hon. Tajudeen Abbas is the Speaker of the Nigerian House of Representatives, elected in June 2023. An economist and academic, he represented Zaria federal constituency from 2011 and was re-elected in 2023. He holds a PhD in Economics from the University of Ibadan and is known for his technocratic approach to legislation, championing the Student Loan Act and the Tax Reform Bills.',
      firstElected: 2011, currentTermStart: 2023, yearsInOffice: 13,
      billsSponsored: 38, attendanceRate: 88.5, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/tajudeen-abbas.jpg',
      sourceUrl: 'https://nass.gov.ng/reps/tajudeen-abbas',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: abbas.id }, update: {},
    create: { politicianId: abbas.id, email: 'speaker@nass.gov.ng', phone: '+234-9-291-7000', officeAddress: 'Office of the Speaker, House of Representatives, National Assembly Complex, Abuja', website: 'https://tajudeenabbas.ng', twitterHandle: '@tajudeenabbas', facebookUrl: 'https://facebook.com/speakertajudeenabbas', instagramHandle: '@tajudeenabbas' },
  })
  await pol(abbas.id, {
    career: [
      { year: 2011, title: 'Member, House of Representatives (Zaria)', description: 'First elected to House of Representatives representing Zaria constituency', category: 'Legislative' },
      { year: 2015, title: 'Re-elected, House of Representatives', description: 'Re-elected; served on Finance and Economic Planning committees', category: 'Legislative' },
      { year: 2019, title: 'Re-elected, House of Representatives', description: 'Third term; chaired Committee on Appropriations', category: 'Legislative' },
      { year: 2023, title: 'Speaker, House of Representatives', description: 'Elected Speaker of the 10th House of Representatives by acclamation', category: 'Legislative' },
    ],
    committees: [
      { committeeName: 'House Business Committee', role: 'Chairman', startDate: new Date('2023-06-13'), chamber: 'HOUSE_OF_REPRESENTATIVES' },
      { committeeName: 'Committee on Finance', role: 'Ex-Officio', startDate: new Date('2023-07-01'), chamber: 'HOUSE_OF_REPRESENTATIVES' },
      { committeeName: 'Committee on Economic Planning', role: 'Ex-Officio', startDate: new Date('2023-07-01'), chamber: 'HOUSE_OF_REPRESENTATIVES' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Residential property in Asokoro, Abuja (5-bedroom)', estimatedValueKobo: 200_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/tajudeen-abbas-2023' },
      { category: 'Real Estate', description: 'Family compound and properties in Zaria, Kaduna State', estimatedValueKobo: 80_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Toyota Land Cruiser V8 and Honda Accord', estimatedValueKobo: 18_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Bank Accounts', description: 'Savings and investment accounts in UBA and Zenith Bank', estimatedValueKobo: 45_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/tajudeen-abbas-2023' },
    ],
    projects: [
      { title: 'Zaria Model Primary Schools Rehabilitation', description: 'Renovation and equipment of 25 public primary schools in Zaria LGA', location: 'Zaria, Kaduna', budgetKobo: 1_200_000_000_000n, status: 'COMPLETED', year: 2022, completionPct: 100, contractor: 'Rholavic Nig Ltd', sourceUrl: 'https://budgit.org/project/zaria-schools' },
      { title: 'Zaria–Sabon Gari Road Reconstruction', description: '12km road reconstruction linking Zaria city to Sabon Gari neighbourhood', location: 'Zaria, Kaduna', budgetKobo: 2_500_000_000_000n, status: 'ONGOING', year: 2023, completionPct: 60, contractor: 'Dantata & Sawoe Construction', sourceUrl: 'https://budgit.org/project/zaria-sabon-gari-road' },
      { title: 'Zaria General Hospital Equipment Upgrade', description: 'Supply of modern medical equipment and ICU beds to Zaria General Hospital', location: 'Zaria, Kaduna', budgetKobo: 500_000_000_000n, status: 'COMPLETED', year: 2021, completionPct: 100, contractor: 'Medpharma Nig Ltd', sourceUrl: 'https://budgit.org/project/zaria-hospital' },
    ],
    votes: [
      { billTitle: 'Student Loan (Access to Higher Education) Act, 2023', vote: 'YES', sessionDate: new Date('2023-04-12'), billStatus: 'PASSED', sourceUrl: 'https://nass.gov.ng/bills/student-loan-2023' },
      { billTitle: 'Tax Reform Bill (Joint Revenue Board Establishment) Act, 2024', vote: 'YES', sessionDate: new Date('2024-10-03'), billStatus: 'THIRD_READING' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Companies and Allied Matters Act (Amendment), 2020', vote: 'YES', sessionDate: new Date('2020-08-06'), billStatus: 'PASSED' },
      { billTitle: 'Minimum Wage (Amendment) Act, 2024', vote: 'YES', sessionDate: new Date('2024-07-11'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: '@tajudeenabbas: The Student Loan Act is a game changer for millions of Nigerian youth who deserve access to tertiary education regardless of wealth. #HouseOfReps', url: 'https://twitter.com/tajudeenabbas/status/1650001', publishedAt: new Date('2023-05-20'), sentiment: 'POSITIVE', sentimentScore: 0.78, engagementTotal: 22400, likes: 14500, shares: 6100, comments: 1800, isByPolitician: true },
      { platform: 'TWITTER', content: 'The Tax Reform Bills being pushed by the Speaker will hurt northern states unfairly. Kaduna, Kano governors were right to oppose. Rethink this!', url: 'https://twitter.com/user/status/1920001', publishedAt: new Date('2024-10-28'), sentiment: 'NEGATIVE', sentimentScore: -0.52, engagementTotal: 17800, likes: 6200, shares: 8900, comments: 2700, isByPolitician: false },
      { platform: 'FACEBOOK', content: 'Speaker Tajudeen Abbas has proven that academics can make good legislators. His approach to the budget process has been refreshingly transparent.', url: 'https://facebook.com/post/abbas001', publishedAt: new Date('2024-01-30'), sentiment: 'POSITIVE', sentimentScore: 0.71, engagementTotal: 7600, likes: 5800, shares: 1200, comments: 600, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'Speaker Abbas at the commissioning of the Zaria model schools. Education is the bedrock 📚🇳🇬 #NigeriaLeads', url: 'https://instagram.com/p/abbas002', publishedAt: new Date('2023-12-14'), sentiment: 'POSITIVE', sentimentScore: 0.66, engagementTotal: 9400, likes: 8100, shares: 800, comments: 500, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.421, totalMentions: 31200, followerCount: 620000, engagementRate: 4.1 },
  })

  // ── 3. Ali Ndume ────────────────────────────────────────────
  const ndume = await prisma.politician.upsert({
    where: { slug: 'ali-ndume' }, update: {},
    create: {
      slug: 'ali-ndume', name: 'Ali Ndume', partyId: apc.id,
      position: 'Senator', chamber: 'SENATE',
      constituency: 'Borno South', state: 'Borno', lga: 'Hawul',
      dateOfBirth: new Date('1960-09-22'), gender: 'Male',
      education: 'MSc Water Resources Engineering, University of Maiduguri; BSc Engineering, Ahmadu Bello University',
      biography: 'Senator Ali Ndume has represented Borno South since 2011, serving as Senate Majority Leader (2015–2017) and later Chief Whip. A vocal and often contrarian voice in the Senate, he has championed accountability legislation, security funding for the Northeast, and local government financial autonomy. He was briefly suspended in 2019 over allegations linked to a wanted suspect but was reinstated after investigation.',
      firstElected: 2011, currentTermStart: 2023, yearsInOffice: 13,
      billsSponsored: 42, attendanceRate: 93.5, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/ali-ndume.jpg',
      sourceUrl: 'https://nass.gov.ng/senator/ali-ndume',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: ndume.id }, update: {},
    create: { politicianId: ndume.id, email: 'sen.ndume@nass.gov.ng', phone: '+234-803-341-0000', officeAddress: 'Senate Office, National Assembly Complex, Three Arms Zone, Abuja', twitterHandle: '@ali_ndume', facebookUrl: 'https://facebook.com/senalindumeofficial' },
  })
  await pol(ndume.id, {
    career: [
      { year: 2003, title: 'Member, House of Representatives (Chibok/Damboa/Gwoza)', description: 'First elected to the House of Representatives', category: 'Legislative' },
      { year: 2011, title: 'Senator, Borno South', description: 'Elected to the Senate; joined Committee on Army', category: 'Legislative' },
      { year: 2015, title: 'Senate Majority Leader', description: 'Appointed Senate Majority Leader under Senate President Saraki', category: 'Legislative' },
      { year: 2023, title: 'Senator, Borno South (4th term)', description: 'Re-elected for a fourth Senate term; continues security and infrastructure advocacy', category: 'Legislative' },
    ],
    committees: [
      { committeeName: 'Committee on Army', role: 'Chairman', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
      { committeeName: 'Committee on Local Government and Community Development', role: 'Chairman', startDate: new Date('2019-07-01'), endDate: new Date('2023-06-30'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Residential property in Wuse, Abuja', estimatedValueKobo: 120_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/ndume-2023' },
      { category: 'Real Estate', description: 'Family compound and properties in Gwoza, Borno State', estimatedValueKobo: 60_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Farm Land', description: '200 hectares of farmland in Biu LGA, Borno State', estimatedValueKobo: 20_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Toyota Prado and two Honda SUVs', estimatedValueKobo: 12_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Chibok IDP Return Assistance Programme', description: 'Housing and livelihood support for 2,000 families displaced by Boko Haram returning to Chibok', location: 'Chibok, Borno', budgetKobo: 1_800_000_000_000n, status: 'ONGOING', year: 2022, completionPct: 55, contractor: 'Borno State MDG Programme', sourceUrl: 'https://budgit.org/project/chibok-idp' },
      { title: 'Biu–Damboa Federal Road Rehabilitation', description: 'Rehabilitation of 60km federal road damaged by Boko Haram insurgency', location: 'Biu/Damboa, Borno', budgetKobo: 4_000_000_000_000n, status: 'ONGOING', year: 2023, completionPct: 30, contractor: 'Craneburg Construction Ltd', sourceUrl: 'https://budgit.org/project/biu-damboa-road' },
    ],
    votes: [
      { billTitle: 'National Health Insurance Authority Act, 2022', vote: 'YES', sessionDate: new Date('2022-05-17'), billStatus: 'PASSED' },
      { billTitle: 'Local Government Autonomy (Constitution Amendment) Bill, 2024', vote: 'YES', sessionDate: new Date('2024-03-26'), billStatus: 'THIRD_READING' },
      { billTitle: 'Police Reform Bill, 2024', vote: 'YES', sessionDate: new Date('2024-06-12'), billStatus: 'THIRD_READING' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Social Media (Prohibition of Falsehood) Bill, 2019', vote: 'NO', sessionDate: new Date('2019-11-05'), billStatus: 'REJECTED' },
    ],
    social: [
      { platform: 'TWITTER', content: 'Senator Ndume demanding accountability from the CBN Governor live in the Senate chambers. "Where is the $3 billion?!" Nigeria needs more senators like this.', url: 'https://twitter.com/user/status/1780001', publishedAt: new Date('2024-02-20'), sentiment: 'POSITIVE', sentimentScore: 0.68, engagementTotal: 28600, likes: 19400, shares: 7200, comments: 2000, isByPolitician: false },
      { platform: 'TWITTER', content: '@ali_ndume: I will always speak truth to power even when it is uncomfortable. The people of Borno South elected me to represent them, not to be a rubber stamp.', url: 'https://twitter.com/ali_ndume/status/1795001', publishedAt: new Date('2024-03-08'), sentiment: 'POSITIVE', sentimentScore: 0.72, engagementTotal: 19800, likes: 13200, shares: 4900, comments: 1700, isByPolitician: true },
      { platform: 'FACEBOOK', content: 'Ndume is the only senator willing to challenge the establishment. Borno South is lucky to have him. Though why has the Chibok road not been fixed yet?', url: 'https://facebook.com/post/ndume001', publishedAt: new Date('2024-01-10'), sentiment: 'NEUTRAL', sentimentScore: 0.12, engagementTotal: 4500, likes: 2900, shares: 1100, comments: 500, isByPolitician: false },
      { platform: 'TWITTER', content: 'Ndume suspended again? This senator spends more time being sanctioned than legislating. Can Borno South get a more effective representative?', url: 'https://twitter.com/user/status/1890001', publishedAt: new Date('2023-11-14'), sentiment: 'NEGATIVE', sentimentScore: -0.49, engagementTotal: 11200, likes: 4100, shares: 5200, comments: 1900, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.389, totalMentions: 38900, followerCount: 510000, engagementRate: 5.2 },
  })

  // ── 4. Ike Ekweremadu ───────────────────────────────────────
  const ekweremadu = await prisma.politician.upsert({
    where: { slug: 'ike-ekweremadu' }, update: {},
    create: {
      slug: 'ike-ekweremadu', name: 'Ike Ekweremadu', partyId: pdp.id,
      position: 'Senator', chamber: 'SENATE',
      constituency: 'Enugu West', state: 'Enugu', lga: 'Aninri',
      dateOfBirth: new Date('1962-10-12'), gender: 'Male',
      education: 'LLB, University of Nigeria Nsukka; BL, Nigerian Law School; PhD Law, University of Abuja',
      biography: 'Distinguished Senator Ike Ekweremadu represented Enugu West for five consecutive terms (2003–2023), serving as Deputy Senate President from 2007 to 2019 — the longest in Nigerian history. A constitutional law expert, he sponsored landmark legislation including the Electoral Act and disability rights frameworks. In 2022 he was arrested in the UK on human trafficking and kidney harvesting charges relating to his daughter\'s kidney illness, convicted in 2023, and is serving a sentence in the UK.',
      firstElected: 2003, currentTermStart: 2019, yearsInOffice: 20,
      billsSponsored: 54, attendanceRate: 78.2, isActive: false,
      photoUrl: 'https://assets.posint.ng/politicians/ike-ekweremadu.jpg',
      sourceUrl: 'https://nass.gov.ng/senator/ekweremadu',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: ekweremadu.id }, update: {},
    create: { politicianId: ekweremadu.id, email: 'sen.ekweremadu@nass.gov.ng', officeAddress: 'Senate Office, National Assembly Complex, Abuja', website: 'https://ekweremadu.com', twitterHandle: '@iekweremadu', facebookUrl: 'https://facebook.com/ekweremadu' },
  })
  await pol(ekweremadu.id, {
    career: [
      { year: 2003, title: 'Senator, Enugu West (1st term)', description: 'First elected to Senate; joined Committee on Constitutional Law', category: 'Legislative' },
      { year: 2007, title: 'Deputy Senate President (1st term)', description: 'Elected Deputy Senate President — beginning of record tenure in the role', category: 'Legislative' },
      { year: 2011, title: 'Deputy Senate President (2nd term)', description: 'Re-elected as Deputy Senate President', category: 'Legislative' },
      { year: 2015, title: 'Deputy Senate President (3rd term)', description: 'Re-elected as Deputy Senate President; served until 2019', category: 'Legislative' },
      { year: 2022, title: 'Arrested by UK Metropolitan Police', description: 'Arrested in London for alleged human trafficking and kidney harvesting; remanded in custody', category: 'Legal' },
      { year: 2023, title: 'Convicted in UK Court', description: 'Found guilty at Southwark Crown Court; sentenced to approximately 10 years, later reduced on appeal', category: 'Legal' },
    ],
    committees: [
      { committeeName: 'Committee on Constitutional Law', role: 'Chairman', startDate: new Date('2015-07-01'), endDate: new Date('2019-06-30'), chamber: 'SENATE' },
      { committeeName: 'Committee on INEC and Electoral Matters', role: 'Member', startDate: new Date('2019-07-01'), endDate: new Date('2022-06-01'), chamber: 'SENATE' },
      { committeeName: 'Committee on Disability Matters', role: 'Chairman', startDate: new Date('2019-07-01'), endDate: new Date('2022-06-01'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Residential property in Asokoro, Abuja (7-bedroom)', estimatedValueKobo: 280_000_000_000n, yearDeclared: 2019, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/ekweremadu-2019' },
      { category: 'Real Estate', description: 'Property and land in Aninri, Enugu State', estimatedValueKobo: 90_000_000_000n, yearDeclared: 2019, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/ekweremadu-2019' },
      { category: 'Vehicles', description: 'Rolls Royce Ghost, Bentley Mulsanne, Mercedes-Benz GLS', estimatedValueKobo: 65_000_000_000n, yearDeclared: 2019, verified: false },
      { category: 'Bank Accounts', description: 'Accounts in First Bank and UBA Nigeria', estimatedValueKobo: 95_000_000_000n, yearDeclared: 2019, verified: true },
      { category: 'Investments', description: 'Shares in GT Holding, FBN Holdings, Nestle Nigeria', estimatedValueKobo: 45_000_000_000n, yearDeclared: 2019, verified: false },
    ],
    projects: [
      { title: 'Aninri–Awgu Road Dualisation', description: 'Dualisation of 35km road connecting Aninri and Awgu LGAs', location: 'Aninri/Awgu, Enugu', budgetKobo: 6_000_000_000_000n, status: 'ABANDONED', year: 2020, completionPct: 18, contractor: 'Mothercat Limited', sourceUrl: 'https://budgit.org/project/aninri-awgu-road' },
      { title: 'Enugu West Senatorial District Scholarship', description: 'Annual scholarship for 500 students from Enugu West senatorial district', location: 'Enugu West, Enugu', budgetKobo: 200_000_000_000n, status: 'ONGOING', year: 2018, completionPct: 70, contractor: 'Ekweremadu Foundation', sourceUrl: 'https://budgit.org/project/enugu-west-scholarship' },
      { title: 'Oji River Health Centre Upgrade', description: 'Construction of new maternity ward and laboratory at Oji River Health Centre', location: 'Oji River, Enugu', budgetKobo: 300_000_000_000n, status: 'COMPLETED', year: 2019, completionPct: 100, contractor: 'Triokwu Engineering Ltd', sourceUrl: 'https://budgit.org/project/oji-river-health' },
    ],
    votes: [
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
      { billTitle: 'Disability Rights Commission Bill, 2020', vote: 'YES', sessionDate: new Date('2020-09-30'), billStatus: 'SECOND_READING' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Social Media (Prohibition of Falsehood) Bill, 2019', vote: 'NO', sessionDate: new Date('2019-11-05'), billStatus: 'REJECTED' },
      { billTitle: 'National Health Insurance Authority Act, 2022', vote: 'ABSENT', sessionDate: new Date('2022-05-17'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: 'Former Deputy Senate President Ekweremadu found guilty in UK court. A tragic fall from grace for someone who served Nigeria for 20 years. The lessons are clear.', url: 'https://twitter.com/user/status/1870001', publishedAt: new Date('2023-05-05'), sentiment: 'NEGATIVE', sentimentScore: -0.71, engagementTotal: 45200, likes: 18400, shares: 21000, comments: 5800, isByPolitician: false },
      { platform: 'TWITTER', content: 'Whatever you think of Ekweremadu, his constitutional law work and the Electoral Act amendments were genuinely impactful contributions to Nigerian democracy.', url: 'https://twitter.com/user/status/1875001', publishedAt: new Date('2023-05-08'), sentiment: 'NEUTRAL', sentimentScore: 0.15, engagementTotal: 12400, likes: 7200, shares: 3900, comments: 1300, isByPolitician: false },
      { platform: 'FACEBOOK', content: 'The Ekweremadu case shows that no one is above the law. But we must also remember innocent until proven guilty and ensure a fair process.', url: 'https://facebook.com/post/ekwere001', publishedAt: new Date('2022-08-15'), sentiment: 'NEUTRAL', sentimentScore: 0.04, engagementTotal: 8900, likes: 4100, shares: 3200, comments: 1600, isByPolitician: false },
      { platform: 'TWITTER', content: 'Ekweremadu\'s foundation has sponsored over 3,000 students from Enugu West. Complex man, complex story. Nigeria is never simple.', url: 'https://twitter.com/user/status/1880001', publishedAt: new Date('2023-06-20'), sentiment: 'NEUTRAL', sentimentScore: 0.21, engagementTotal: 6100, likes: 3400, shares: 1800, comments: 900, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'Ekweremadu in court in London — the images are sad. A 5-term Deputy Senate President now in orange. Nigeria\'s political class must learn from this.', url: 'https://instagram.com/p/ekwere002', publishedAt: new Date('2023-04-18'), sentiment: 'NEGATIVE', sentimentScore: -0.58, engagementTotal: 19800, likes: 14200, shares: 3400, comments: 2200, isByPolitician: false },
    ],
    stats: { overallSentiment: -0.178, totalMentions: 89400, followerCount: 728000, engagementRate: 6.8 },
  })

  // ── 5. Orji Uzor Kalu ───────────────────────────────────────
  const kalu = await prisma.politician.upsert({
    where: { slug: 'orji-uzor-kalu' }, update: {},
    create: {
      slug: 'orji-uzor-kalu', name: 'Orji Uzor Kalu', partyId: apc.id,
      position: 'Senator / Chief Whip', chamber: 'SENATE',
      constituency: 'Abia North', state: 'Abia', lga: 'Arochukwu',
      dateOfBirth: new Date('1971-04-21'), gender: 'Male',
      education: 'BSc Business Administration, University of Maiduguri; Executive Programme, University of Pennsylvania Wharton School',
      biography: 'Chief Orji Uzor Kalu is the Senate Chief Whip and former Governor of Abia State (2003–2007). A billionaire businessman and media owner (Sun Publishing), he was convicted of N7.65 billion fraud by the EFCC in 2019 while serving as senator, but the Supreme Court vacated the conviction in 2020 on the grounds that the trial judge had already been elevated to the Court of Appeal during the verdict. He was re-elected to the Senate in 2023.',
      firstElected: 2003, currentTermStart: 2023, yearsInOffice: 12,
      billsSponsored: 29, attendanceRate: 74.8, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/orji-uzor-kalu.jpg',
      sourceUrl: 'https://nass.gov.ng/senator/orji-uzor-kalu',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: kalu.id }, update: {},
    create: { politicianId: kalu.id, email: 'sen.kalu@nass.gov.ng', phone: '+234-803-300-0000', officeAddress: 'Office of Chief Whip, Senate, National Assembly, Abuja', website: 'https://orjiuzorkalu.com', twitterHandle: '@ORJI_UZOR_KALU', facebookUrl: 'https://facebook.com/orjiuzorkaluofficial', instagramHandle: '@orjiuzorkalu' },
  })
  await pol(kalu.id, {
    career: [
      { year: 2003, title: 'Governor of Abia State', description: 'Elected Governor; served two terms; controversial administration with mixed legacy', category: 'Executive' },
      { year: 2007, title: 'Charged by EFCC', description: 'EFCC filed N7.65 billion fraud charges; remained in various legal battles for a decade', category: 'Legal' },
      { year: 2019, title: 'Senator, Abia North', description: 'Elected to Senate; convicted of N7.65bn fraud in December 2019 but Supreme Court vacated in 2020', category: 'Legislative' },
      { year: 2020, title: 'EFCC Conviction Vacated by Supreme Court', description: 'Supreme Court nullified conviction; held that judge should have first returned to High Court before delivering verdict', category: 'Legal' },
      { year: 2023, title: 'Senate Chief Whip', description: 'Re-elected Senator and appointed Senate Chief Whip of the 10th Assembly', category: 'Legislative' },
    ],
    committees: [
      { committeeName: 'Committee on Commerce, Trade and Investment', role: 'Chairman', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
      { committeeName: 'Committee on Privatisation', role: 'Member', startDate: new Date('2019-07-01'), endDate: new Date('2023-06-30'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Mansion in Abuja GRA (8-bedroom) and Lagos property portfolio', estimatedValueKobo: 850_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Investments', description: 'Majority shareholding in Sun Publishing Ltd and Slok Nigeria Ltd', estimatedValueKobo: 1_200_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Private jet, Rolls Royce Phantom, fleet of 6 luxury SUVs', estimatedValueKobo: 180_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Bank Accounts', description: 'Accounts in multiple Nigerian and international banks', estimatedValueKobo: 200_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Farm Land', description: '500 hectares of commercial farmland in Arochukwu, Abia State', estimatedValueKobo: 25_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Arochukwu–Ohafia Federal Road Rehabilitation', description: 'Reconstruction of 42km dilapidated federal road linking Arochukwu to Ohafia', location: 'Arochukwu/Ohafia, Abia', budgetKobo: 3_800_000_000_000n, status: 'ONGOING', year: 2023, completionPct: 22, contractor: 'Reynolds Construction Company', sourceUrl: 'https://budgit.org/project/arochukwu-ohafia-road' },
      { title: 'Abia North Scholarship and Empowerment Fund', description: 'Annual cash empowerment and scholarships for 1,000 Abia North youths', location: 'Abia North Senatorial District, Abia', budgetKobo: 150_000_000_000n, status: 'ONGOING', year: 2020, completionPct: 80, contractor: 'Orji Uzor Kalu Foundation', sourceUrl: 'https://budgit.org/project/abianorth-empowerment' },
    ],
    votes: [
      { billTitle: 'Companies and Allied Matters Act (Amendment), 2020', vote: 'YES', sessionDate: new Date('2020-08-06'), billStatus: 'PASSED' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
      { billTitle: 'Student Loan (Access to Higher Education) Act, 2023', vote: 'YES', sessionDate: new Date('2023-04-12'), billStatus: 'PASSED' },
      { billTitle: 'Minimum Wage (Amendment) Act, 2024', vote: 'YES', sessionDate: new Date('2024-07-11'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: 'The Supreme Court exonerated Orji Uzor Kalu. He should now resign from the Senate given the circumstances of his election while in prison.', url: 'https://twitter.com/user/status/1770001', publishedAt: new Date('2020-06-10'), sentiment: 'NEGATIVE', sentimentScore: -0.44, engagementTotal: 22400, likes: 9200, shares: 10100, comments: 3100, isByPolitician: false },
      { platform: 'TWITTER', content: '@ORJI_UZOR_KALU: I am vindicated. I always said I was innocent. Now back to working for my people in Abia North. Let the haters be silenced.', url: 'https://twitter.com/ORJI_UZOR_KALU/status/1771001', publishedAt: new Date('2020-06-12'), sentiment: 'POSITIVE', sentimentScore: 0.61, engagementTotal: 18900, likes: 12400, shares: 4500, comments: 2000, isByPolitician: true },
      { platform: 'FACEBOOK', content: 'Kalu is back doing the people\'s work as Senate Chief Whip. Abia North has always supported him. The legal battles only made him stronger.', url: 'https://facebook.com/post/kalu001', publishedAt: new Date('2023-08-15'), sentiment: 'POSITIVE', sentimentScore: 0.58, engagementTotal: 9400, likes: 7100, shares: 1600, comments: 700, isByPolitician: false },
      { platform: 'TWITTER', content: 'How can EFCC just watch Orji Uzor Kalu walk free? ₦7.65 billion of Abia people\'s money gone. The system is broken. #EndCorruption', url: 'https://twitter.com/user/status/1780001', publishedAt: new Date('2020-07-20'), sentiment: 'NEGATIVE', sentimentScore: -0.76, engagementTotal: 34100, likes: 14200, shares: 15400, comments: 4500, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'Senator Orji Uzor Kalu distributing food palliatives to Abia North constituents. Community service or political optics? 🤔', url: 'https://instagram.com/p/kalu002', publishedAt: new Date('2024-02-14'), sentiment: 'NEUTRAL', sentimentScore: -0.08, engagementTotal: 7200, likes: 4800, shares: 1500, comments: 900, isByPolitician: false },
    ],
    stats: { overallSentiment: -0.089, totalMentions: 52400, followerCount: 890000, engagementRate: 4.7 },
  })
  console.log('✅  Politicians 1–5')

  console.log('✅  Politicians 1–5')

  // ═══════════════════════════════════════════════════════════
  // POLITICIANS 6–10
  // ═══════════════════════════════════════════════════════════
  console.log('Seeding politicians 6–10…')

  // ── 6. Dino Melaye ──────────────────────────────────────────
  const melaye = await prisma.politician.upsert({
    where: { slug: 'dino-melaye' }, update: {},
    create: {
      slug: 'dino-melaye', name: 'Dino Melaye', partyId: pdp.id,
      position: 'Senator', chamber: 'SENATE',
      constituency: 'Kogi West', state: 'Kogi', lga: 'Kabba/Bunu',
      dateOfBirth: new Date('1974-01-01'), gender: 'Male',
      education: 'BSc Political Science, Ahmadu Bello University; BA Geography, ABU (second degree); attended multiple international leadership programmes',
      biography: 'Senator Dino Melaye is one of Nigeria\'s most flamboyant and controversial legislators, representing Kogi West. He served in the 8th Senate (APC, 2015–2019) and defected to PDP before the 2019 elections, losing a recall attempt and a rerun. He returned to the Senate in 2023 on the PDP ticket. Known for viral videos, luxury lifestyle displays, and outspoken criticism of government policies, he has also authored numerous bills and is a prolific speaker in the chamber.',
      firstElected: 2015, currentTermStart: 2023, yearsInOffice: 9,
      billsSponsored: 31, attendanceRate: 68.4, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/dino-melaye.jpg',
      sourceUrl: 'https://nass.gov.ng/senator/dino-melaye',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: melaye.id }, update: {},
    create: { politicianId: melaye.id, email: 'sen.melaye@nass.gov.ng', officeAddress: 'Senate Office, National Assembly Complex, Abuja', twitterHandle: '@dino_melaye', facebookUrl: 'https://facebook.com/dinomelayeofficial', instagramHandle: '@dino_melaye' },
  })
  await pol(melaye.id, {
    career: [
      { year: 2011, title: 'Member, House of Representatives (Kabba/Bunu/Ijumu)', description: 'First elected to the House of Representatives', category: 'Legislative' },
      { year: 2015, title: 'Senator, Kogi West (APC)', description: 'Elected to the Senate under APC; became prominent voice in 8th Assembly', category: 'Legislative' },
      { year: 2019, title: 'Defects to PDP; Loses Senate Seat', description: 'Defected from APC to PDP; lost rerun election to Smart Adeyemi; result later annulled', category: 'Party' },
      { year: 2023, title: 'Senator, Kogi West (PDP)', description: 'Re-elected to Senate under PDP ticket for 10th Assembly', category: 'Legislative' },
    ],
    committees: [
      { committeeName: 'Committee on Federal Capital Territory', role: 'Member', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
      { committeeName: 'Committee on Information and National Orientation', role: 'Member', startDate: new Date('2015-08-01'), endDate: new Date('2019-06-30'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Mansion in Kogi State and Abuja apartment', estimatedValueKobo: 180_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Collection of over 15 luxury vehicles including Ferraris, Porsche, Bentleys', estimatedValueKobo: 210_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Bank Accounts', description: 'Accounts in multiple Nigerian banks', estimatedValueKobo: 55_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Investments', description: 'Stake in entertainment and media businesses', estimatedValueKobo: 40_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Kabba–Okene Federal Road Emergency Repairs', description: 'Emergency pothole patching and drainage repairs on 50km federal road', location: 'Kabba, Kogi', budgetKobo: 800_000_000_000n, status: 'COMPLETED', year: 2018, completionPct: 100, contractor: 'State Roads Agency', sourceUrl: 'https://budgit.org/project/kabba-okene-road' },
      { title: 'Kogi West Constituency Empowerment – Farming Kits', description: 'Distribution of irrigation pumps, seeds and fertiliser to 3,000 small-scale farmers', location: 'Kogi West Senatorial District', budgetKobo: 250_000_000_000n, status: 'COMPLETED', year: 2017, completionPct: 100, contractor: 'Dino Foundation', sourceUrl: 'https://budgit.org/project/kogiwest-farm' },
    ],
    votes: [
      { billTitle: 'Social Media (Prohibition of Falsehood) Bill, 2019', vote: 'NO', sessionDate: new Date('2019-11-05'), billStatus: 'REJECTED' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
      { billTitle: 'Local Government Autonomy (Constitution Amendment) Bill, 2024', vote: 'YES', sessionDate: new Date('2024-03-26'), billStatus: 'THIRD_READING' },
      { billTitle: 'Minimum Wage (Amendment) Act, 2024', vote: 'YES', sessionDate: new Date('2024-07-11'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: '@dino_melaye: They said I\'m controversial. I say I\'m CONSISTENT. I have never changed my values. What you see is what you get. #DinoMelaye', url: 'https://twitter.com/dino_melaye/status/1820001', publishedAt: new Date('2024-03-22'), sentiment: 'POSITIVE', sentimentScore: 0.58, engagementTotal: 38400, likes: 26700, shares: 8500, comments: 3200, isByPolitician: true },
      { platform: 'TWITTER', content: 'Dino Melaye shows off new Lamborghini while Kogi State has no functional public hospital. The audacity is breathtaking. #EndNigeria', url: 'https://twitter.com/user/status/1840001', publishedAt: new Date('2024-04-10'), sentiment: 'NEGATIVE', sentimentScore: -0.72, engagementTotal: 52100, likes: 22400, shares: 24000, comments: 5700, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'Senator Dino Melaye with his car collection! 🔥 Say what you want about him, this man lives his best life 😂🇳🇬', url: 'https://instagram.com/p/dino001', publishedAt: new Date('2024-01-30'), sentiment: 'NEUTRAL', sentimentScore: 0.05, engagementTotal: 89400, likes: 78200, shares: 7500, comments: 3700, isByPolitician: false },
      { platform: 'TWITTER', content: 'Dino Melaye on the floor of the Senate opposing the obnoxious Social Media Bill — one of the few times he was actually right. Credit where due.', url: 'https://twitter.com/user/status/1850001', publishedAt: new Date('2019-11-06'), sentiment: 'POSITIVE', sentimentScore: 0.63, engagementTotal: 27800, likes: 18200, shares: 7100, comments: 2500, isByPolitician: false },
      { platform: 'FACEBOOK', content: 'Love him or hate him Dino Melaye is entertaining. Nigeria politics would be boring without him. But we also need people who actually work!', url: 'https://facebook.com/post/dino002', publishedAt: new Date('2024-02-28'), sentiment: 'NEUTRAL', sentimentScore: 0.09, engagementTotal: 18400, likes: 12800, shares: 3900, comments: 1700, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.071, totalMentions: 118000, followerCount: 2800000, engagementRate: 7.4 },
  })

  // ── 7. Remi Tinubu ──────────────────────────────────────────
  const remiTinubu = await prisma.politician.upsert({
    where: { slug: 'remi-tinubu' }, update: {},
    create: {
      slug: 'remi-tinubu', name: 'Oluremi Tinubu', partyId: apc.id,
      position: 'Senator', chamber: 'SENATE',
      constituency: 'Lagos Central', state: 'Lagos', lga: 'Lagos Island',
      dateOfBirth: new Date('1960-09-05'), gender: 'Female',
      education: 'BA English & Performing Arts, Ogun State University; Diploma Theatre Arts, University of Lagos',
      biography: 'Senator Oluremi Tinubu (née Folashade) has represented Lagos Central since 2011 and is the wife of President Bola Ahmed Tinubu. She is a three-term senator known for gender equality advocacy, anti-domestic violence legislation, and consistent APC loyalty. Her position as First Lady from 2023 raised questions about dual roles, though she has continued to represent Lagos Central as senator. She is a co-patron of numerous women\'s and children\'s welfare organisations.',
      firstElected: 2011, currentTermStart: 2023, yearsInOffice: 13,
      billsSponsored: 33, attendanceRate: 84.1, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/remi-tinubu.jpg',
      sourceUrl: 'https://nass.gov.ng/senator/remi-tinubu',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: remiTinubu.id }, update: {},
    create: { politicianId: remiTinubu.id, email: 'sen.remitinubu@nass.gov.ng', officeAddress: 'Senate Office, National Assembly Complex, Abuja', twitterHandle: '@remi_tinubu', facebookUrl: 'https://facebook.com/remioluremitinubu', instagramHandle: '@remi_tinubu' },
  })
  await pol(remiTinubu.id, {
    career: [
      { year: 2011, title: 'Senator, Lagos Central (1st term)', description: 'First elected to Senate; joined Women Affairs and Health committees', category: 'Legislative' },
      { year: 2015, title: 'Senator, Lagos Central (2nd term)', description: 'Re-elected; championed Violence Against Persons Prohibition Act', category: 'Legislative' },
      { year: 2019, title: 'Senator, Lagos Central (3rd term)', description: 'Third term; led Gender and Equal Opportunities Bill initiative', category: 'Legislative' },
      { year: 2023, title: 'Senator, Lagos Central (4th term) & Nigeria\'s First Lady', description: 'Re-elected to Senate simultaneously as husband became President', category: 'Legislative' },
    ],
    committees: [
      { committeeName: 'Committee on Women Affairs', role: 'Chairman', startDate: new Date('2019-07-01'), chamber: 'SENATE' },
      { committeeName: 'Committee on Health', role: 'Member', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Residential property in Aso Rock residential area, Abuja', estimatedValueKobo: 400_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Real Estate', description: 'Properties in Ikoyi and Victoria Island, Lagos', estimatedValueKobo: 650_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Mercedes-Benz S-Class, Range Rover, official Senate vehicle', estimatedValueKobo: 28_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Investments', description: 'Shares in various Lagos-based companies and real estate investment trusts', estimatedValueKobo: 300_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Lagos Central Women Empowerment Hub', description: 'Construction of skills acquisition centre for 2,000 women in Lagos Island LGA', location: 'Lagos Island, Lagos', budgetKobo: 600_000_000_000n, status: 'COMPLETED', year: 2022, completionPct: 100, contractor: 'Mixta Africa Plc', sourceUrl: 'https://budgit.org/project/lagos-central-women-hub' },
      { title: 'Gender-Based Violence Response Centres (Lagos)', description: 'Establishment of 5 GBV response and counselling centres across Lagos Central', location: 'Lagos Central, Lagos', budgetKobo: 350_000_000_000n, status: 'ONGOING', year: 2021, completionPct: 80, contractor: 'Red Cross Nigeria / Lagos State', sourceUrl: 'https://budgit.org/project/lagos-gbv-centres' },
    ],
    votes: [
      { billTitle: 'Gender and Equal Opportunities Bill', vote: 'YES', sessionDate: new Date('2021-03-08'), billStatus: 'SECOND_READING' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
      { billTitle: 'National Health Insurance Authority Act, 2022', vote: 'YES', sessionDate: new Date('2022-05-17'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: 'Can First Lady Remi Tinubu really be both a senator and First Lady simultaneously? She is drawing a senator\'s salary and using state resources. This is a conflict of interest.', url: 'https://twitter.com/user/status/1870001', publishedAt: new Date('2023-06-20'), sentiment: 'NEGATIVE', sentimentScore: -0.59, engagementTotal: 41200, likes: 16400, shares: 19200, comments: 5600, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'First Lady and Senator Remi Tinubu looking stunning at the UN Women summit. Nigeria\'s women are proud to have such a representative on the global stage 🇳🇬', url: 'https://instagram.com/p/remi001', publishedAt: new Date('2023-09-19'), sentiment: 'POSITIVE', sentimentScore: 0.74, engagementTotal: 32800, likes: 29100, shares: 2400, comments: 1300, isByPolitician: false },
      { platform: 'TWITTER', content: '@remi_tinubu: I am committed to passing the Gender and Equal Opportunities Bill this term. Nigerian women deserve constitutional equality. #WomenRights', url: 'https://twitter.com/remi_tinubu/status/1880001', publishedAt: new Date('2024-03-08'), sentiment: 'POSITIVE', sentimentScore: 0.79, engagementTotal: 28500, likes: 20100, shares: 6400, comments: 2000, isByPolitician: true },
      { platform: 'FACEBOOK', content: 'Senator Remi Tinubu\'s record on women\'s legislation is real. Violence Against Persons Act, women empowerment funds, disability rights. She actually does the work.', url: 'https://facebook.com/post/remi002', publishedAt: new Date('2024-01-15'), sentiment: 'POSITIVE', sentimentScore: 0.66, engagementTotal: 11200, likes: 8400, shares: 1900, comments: 900, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.224, totalMentions: 74200, followerCount: 1400000, engagementRate: 4.8 },
  })

  // ── 8. Solomon Adeola (Yayi) ────────────────────────────────
  const adeola = await prisma.politician.upsert({
    where: { slug: 'solomon-adeola' }, update: {},
    create: {
      slug: 'solomon-adeola', name: 'Solomon Olamilekan Adeola', partyId: apc.id,
      position: 'Senator', chamber: 'SENATE',
      constituency: 'Ogun West', state: 'Ogun', lga: 'Yewa North',
      dateOfBirth: new Date('1967-07-03'), gender: 'Male',
      education: 'BSc Accounting, University of Lagos; FCA, Institute of Chartered Accountants of Nigeria',
      biography: 'Senator Solomon Adeola, popularly called "Yayi", is a Chartered Accountant and three-term legislator representing Ogun West. He chaired the Senate Finance Committee (2019–2023), where he became one of the most powerful voices on budget appropriations and tax policy. A key architect of the 2024 Tax Reform Bills, he has also served as Senate Majority Leader since 2023. His background in finance gives him unusual technical authority on fiscal legislation.',
      firstElected: 2011, currentTermStart: 2023, yearsInOffice: 13,
      billsSponsored: 40, attendanceRate: 90.8, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/solomon-adeola.jpg',
      sourceUrl: 'https://nass.gov.ng/senator/solomon-adeola',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: adeola.id }, update: {},
    create: { politicianId: adeola.id, email: 'sen.adeola@nass.gov.ng', officeAddress: 'Senate Office, National Assembly Complex, Abuja', twitterHandle: '@SolomonAdeola_', facebookUrl: 'https://facebook.com/solomonadeolaofficialpage', instagramHandle: '@solomon_adeola_yayi' },
  })
  await pol(adeola.id, {
    career: [
      { year: 2011, title: 'Member, House of Representatives (Yewa North/Imeko-Afon)', description: 'Elected to House; focused on Finance and Appropriations', category: 'Legislative' },
      { year: 2019, title: 'Senator, Ogun West', description: 'Elevated to Senate; chaired Finance Committee, becoming key player in annual budget process', category: 'Legislative' },
      { year: 2023, title: 'Senate Majority Leader', description: 'Appointed Senate Majority Leader in the 10th Assembly', category: 'Legislative' },
    ],
    committees: [
      { committeeName: 'Committee on Finance', role: 'Chairman', startDate: new Date('2019-07-01'), endDate: new Date('2023-06-30'), chamber: 'SENATE' },
      { committeeName: 'Committee on Appropriations', role: 'Member', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Properties in Abeokuta, Ogun State and Abuja', estimatedValueKobo: 140_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/adeola-2023' },
      { category: 'Investments', description: 'Equity in financial services firms and real estate', estimatedValueKobo: 95_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Bank Accounts', description: 'Fixed deposits in GTBank, Zenith, and UBA', estimatedValueKobo: 60_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/adeola-2023' },
    ],
    projects: [
      { title: 'Ilaro–Abeokuta Highway Rehabilitation', description: 'Comprehensive rehabilitation of 75km Ilaro–Abeokuta highway including drainage works', location: 'Yewa North, Ogun', budgetKobo: 4_500_000_000_000n, status: 'ONGOING', year: 2022, completionPct: 48, contractor: 'CCECC Nigeria Limited', sourceUrl: 'https://budgit.org/project/ilaro-abeokuta-road' },
      { title: 'Ogun West Borehole and Solar Water Project', description: '50 solar-powered boreholes installed across 50 communities in Ogun West', location: 'Ogun West District, Ogun', budgetKobo: 900_000_000_000n, status: 'COMPLETED', year: 2021, completionPct: 100, contractor: 'Watertech Nigeria Ltd', sourceUrl: 'https://budgit.org/project/ogunwest-boreholes' },
    ],
    votes: [
      { billTitle: 'Minimum Wage (Amendment) Act, 2024', vote: 'YES', sessionDate: new Date('2024-07-11'), billStatus: 'PASSED' },
      { billTitle: 'Tax Reform Bill (Joint Revenue Board Establishment) Act, 2024', vote: 'YES', sessionDate: new Date('2024-10-03'), billStatus: 'THIRD_READING' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
      { billTitle: 'National Health Insurance Authority Act, 2022', vote: 'YES', sessionDate: new Date('2022-05-17'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: '@SolomonAdeola_: The Minimum Wage Act is now law. ₦70,000 baseline. We know it is not enough but it is a floor we can build on. Working Nigerians deserve more. #MinimumWage', url: 'https://twitter.com/SolomonAdeola_/status/1900001', publishedAt: new Date('2024-07-12'), sentiment: 'POSITIVE', sentimentScore: 0.71, engagementTotal: 18500, likes: 12400, shares: 4500, comments: 1600, isByPolitician: true },
      { platform: 'TWITTER', content: 'Solomon Adeola has been the most technically competent senator on fiscal matters in this assembly. Whether you agree with Tax Reform or not, the work is rigorous.', url: 'https://twitter.com/user/status/1910001', publishedAt: new Date('2024-11-10'), sentiment: 'POSITIVE', sentimentScore: 0.67, engagementTotal: 9200, likes: 6500, shares: 2000, comments: 700, isByPolitician: false },
      { platform: 'FACEBOOK', content: 'Senator Adeola (Yayi) is consistently working for Ogun West. Road projects are moving. Boreholes are flowing. Our senator delivers!', url: 'https://facebook.com/post/adeola001', publishedAt: new Date('2024-02-20'), sentiment: 'POSITIVE', sentimentScore: 0.76, engagementTotal: 7800, likes: 5900, shares: 1200, comments: 700, isByPolitician: false },
      { platform: 'TWITTER', content: 'The Tax Reform Bills are an attack on states like Kano, Kaduna, and Borno. Adeola and the Lagos cabal are trying to centralise revenue at the expense of the North.', url: 'https://twitter.com/user/status/1920001', publishedAt: new Date('2024-10-25'), sentiment: 'NEGATIVE', sentimentScore: -0.63, engagementTotal: 22400, likes: 8900, shares: 10100, comments: 3400, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.378, totalMentions: 28600, followerCount: 340000, engagementRate: 3.4 },
  })

  // ── 9. Ifeanyi Ubah ─────────────────────────────────────────
  const ubah = await prisma.politician.upsert({
    where: { slug: 'ifeanyi-ubah' }, update: {},
    create: {
      slug: 'ifeanyi-ubah', name: 'Patrick Ifeanyi Ubah', partyId: nnpp.id,
      position: 'Senator', chamber: 'SENATE',
      constituency: 'Anambra South', state: 'Anambra', lga: 'Nnewi North',
      dateOfBirth: new Date('1969-10-12'), gender: 'Male',
      education: 'BSc Management Technology, Federal University of Technology Owerri; MSc, Nottingham Trent University',
      biography: 'Senator Ifeanyi Ubah is a billionaire oil magnate and founder of Capital Oil & Gas Industries Ltd. He was first elected to the Senate in 2019 under the Young Progressives Party (YPP) and defected to NNPP before the 2023 elections. He survived an assassination attempt on his convoy in Anambra in 2019. He has focused on oil deregulation, youth entrepreneurship, and power sector reform in his legislative work.',
      firstElected: 2019, currentTermStart: 2023, yearsInOffice: 5,
      billsSponsored: 18, attendanceRate: 76.9, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/ifeanyi-ubah.jpg',
      sourceUrl: 'https://nass.gov.ng/senator/ifeanyi-ubah',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: ubah.id }, update: {},
    create: { politicianId: ubah.id, email: 'sen.ubah@nass.gov.ng', officeAddress: 'Senate Office, National Assembly Complex, Abuja', twitterHandle: '@ifeanyiubah_ph', facebookUrl: 'https://facebook.com/ifeanyiubahofficial', instagramHandle: '@ifeanyiubah' },
  })
  await pol(ubah.id, {
    career: [
      { year: 2019, title: 'Senator, Anambra South (YPP)', description: 'Elected to Senate under Young Progressives Party; survived assassination attempt in 2019', category: 'Legislative' },
      { year: 2019, title: 'Assassination Attempt', description: 'Armed gunmen ambushed his convoy in Igboukwu, Anambra; security detail killed', category: 'Security' },
      { year: 2023, title: 'Senator, Anambra South (NNPP)', description: 'Re-elected under NNPP banner after defecting from YPP', category: 'Legislative' },
      { year: 2024, title: 'Senate Minority Whip', description: 'Appointed as Senate Minority Whip in the 10th Assembly', category: 'Legislative' },
    ],
    committees: [
      { committeeName: 'Committee on Petroleum Downstream', role: 'Chairman', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
      { committeeName: 'Committee on Finance', role: 'Member', startDate: new Date('2019-07-01'), endDate: new Date('2023-06-30'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Investments', description: 'Capital Oil & Gas Industries Ltd — majority ownership, estimated assets >$1 billion', estimatedValueKobo: 1_500_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Real Estate', description: 'Properties in Nnewi, Abuja, and Lagos', estimatedValueKobo: 350_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Armoured vehicles and luxury cars', estimatedValueKobo: 95_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Bank Accounts', description: 'Multi-currency accounts in Nigerian and international banks', estimatedValueKobo: 180_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Nnewi Industrial Zone Road Infrastructure', description: 'Rehabilitation of 20km road network serving Nnewi industrial cluster', location: 'Nnewi, Anambra', budgetKobo: 2_200_000_000_000n, status: 'COMPLETED', year: 2021, completionPct: 100, contractor: 'C-Executives Nigeria Ltd', sourceUrl: 'https://budgit.org/project/nnewi-industrial-road' },
      { title: 'Anambra South Youth Entrepreneurship Fund', description: 'Interest-free loans and mentorship for 500 youth businesses in Anambra South', location: 'Anambra South District, Anambra', budgetKobo: 500_000_000_000n, status: 'ONGOING', year: 2022, completionPct: 65, contractor: 'Capital Oil Foundation', sourceUrl: 'https://budgit.org/project/anambra-youth-fund' },
    ],
    votes: [
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
      { billTitle: 'National Health Insurance Authority Act, 2022', vote: 'YES', sessionDate: new Date('2022-05-17'), billStatus: 'PASSED' },
      { billTitle: 'Minimum Wage (Amendment) Act, 2024', vote: 'YES', sessionDate: new Date('2024-07-11'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: 'Ifeanyi Ubah survived bullets — now he is fighting for petroleum deregulation. A man who built a fuel empire is exactly who we need on the Petroleum Committee. #NigerianSenate', url: 'https://twitter.com/user/status/1790001', publishedAt: new Date('2023-10-12'), sentiment: 'POSITIVE', sentimentScore: 0.55, engagementTotal: 12400, likes: 8200, shares: 3200, comments: 1000, isByPolitician: false },
      { platform: 'INSTAGRAM', content: '@ifeanyiubah: Commissioning the new Nnewi ring road — built with constituency funds for the people of Anambra South! 🙏🇳🇬', url: 'https://instagram.com/p/ubah001', publishedAt: new Date('2021-12-10'), sentiment: 'POSITIVE', sentimentScore: 0.77, engagementTotal: 24700, likes: 21500, shares: 2100, comments: 1100, isByPolitician: true },
      { platform: 'TWITTER', content: 'Ifeanyi Ubah defecting from YPP to NNPP just because Kwankwaso came knocking. Politicians have no ideology in Nigeria. Just power and money.', url: 'https://twitter.com/user/status/1800001', publishedAt: new Date('2022-11-15'), sentiment: 'NEGATIVE', sentimentScore: -0.58, engagementTotal: 9800, likes: 3900, shares: 4400, comments: 1500, isByPolitician: false },
      { platform: 'FACEBOOK', content: 'Sen. Ubah\'s Youth Entrepreneurship Fund has changed lives in Anambra South. My cousin got a loan and now employs 8 people. Real impact!', url: 'https://facebook.com/post/ubah002', publishedAt: new Date('2023-09-22'), sentiment: 'POSITIVE', sentimentScore: 0.82, engagementTotal: 8900, likes: 7200, shares: 1200, comments: 500, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.342, totalMentions: 29400, followerCount: 620000, engagementRate: 4.2 },
  })

  // ── 10. Ned Nwoko ───────────────────────────────────────────
  const nedNwoko = await prisma.politician.upsert({
    where: { slug: 'ned-nwoko' }, update: {},
    create: {
      slug: 'ned-nwoko', name: 'Ned Nwoko', partyId: pdp.id,
      position: 'Senator', chamber: 'SENATE',
      constituency: 'Delta North', state: 'Delta', lga: 'Aniocha North',
      dateOfBirth: new Date('1960-01-17'), gender: 'Male',
      education: 'LLB, Keele University, UK; LLM, University of London; BL, Nigerian Law School',
      biography: 'Senator Ned Nwoko is a lawyer, businessman and philanthropist representing Delta North. First elected in 2019, he is best known internationally as the husband of actress Regina Daniels and for his crusade to eradicate malaria from Africa, for which he established the Ned Nwoko Foundation for Malaria Eradication. In the Senate he serves on the Foreign Affairs committee and has championed health legislation including the National Senior Citizens Centre Act.',
      firstElected: 2019, currentTermStart: 2019, yearsInOffice: 5,
      billsSponsored: 12, attendanceRate: 82.3, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/ned-nwoko.jpg',
      sourceUrl: 'https://nass.gov.ng/senator/ned-nwoko',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: nedNwoko.id }, update: {},
    create: { politicianId: nedNwoko.id, email: 'sen.nwoko@nass.gov.ng', officeAddress: 'Senate Office, National Assembly Complex, Abuja', website: 'https://nednwoko.com', twitterHandle: '@nednwoko', facebookUrl: 'https://facebook.com/nednwokoofficial', instagramHandle: '@nednwoko' },
  })
  await pol(nedNwoko.id, {
    career: [
      { year: 2003, title: 'Member, House of Representatives', description: 'Served as member of the House representing Aniocha North/South', category: 'Legislative' },
      { year: 2007, title: 'Left Politics; Business Focus', description: 'Did not contest; focused on legal practice and business interests in UK and Nigeria', category: 'Career' },
      { year: 2019, title: 'Senator, Delta North', description: 'Returned to politics; elected Senator; launched malaria eradication campaign', category: 'Legislative' },
      { year: 2023, title: 'Senator, Delta North (2nd term)', description: 'Re-elected; continued legislative work on health and elderly welfare', category: 'Legislative' },
    ],
    committees: [
      { committeeName: 'Committee on Foreign Affairs', role: 'Chairman', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
      { committeeName: 'Committee on Health', role: 'Member', startDate: new Date('2019-07-01'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Mansions in Idumuje-Ugboko, Delta State; Abuja; and London, UK', estimatedValueKobo: 1_200_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Investments', description: 'Ned Nwoko Group of Companies — legal, hospitality, and oil interests', estimatedValueKobo: 800_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Private jet and luxury vehicle fleet', estimatedValueKobo: 220_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Farm Land', description: '1,500 hectares of agricultural land in Delta State', estimatedValueKobo: 75_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Delta North Malaria Eradication Campaign', description: 'Mass distribution of mosquito nets and indoor residual spraying across Delta North senatorial district', location: 'Delta North, Delta', budgetKobo: 800_000_000_000n, status: 'ONGOING', year: 2020, completionPct: 70, contractor: 'Ned Nwoko Foundation', sourceUrl: 'https://budgit.org/project/delta-north-malaria' },
      { title: 'Idumuje-Ugboko Palace and Cultural Centre', description: 'Construction of a new royal palace and Igbo cultural heritage centre', location: 'Idumuje-Ugboko, Delta', budgetKobo: 1_500_000_000_000n, status: 'COMPLETED', year: 2022, completionPct: 100, contractor: 'Ned Nwoko Group', sourceUrl: 'https://budgit.org/project/idumuje-palace' },
    ],
    votes: [
      { billTitle: 'National Senior Citizens Centre Bill, 2022', vote: 'YES', sessionDate: new Date('2022-08-30'), billStatus: 'PASSED' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'National Health Insurance Authority Act, 2022', vote: 'YES', sessionDate: new Date('2022-05-17'), billStatus: 'PASSED' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'INSTAGRAM', content: 'Senator Ned Nwoko launches Phase 3 of the malaria eradication programme in Delta North. This man is actually doing something about Africa\'s biggest killer. 🙌🇳🇬', url: 'https://instagram.com/p/nwoko001', publishedAt: new Date('2023-08-15'), sentiment: 'POSITIVE', sentimentScore: 0.84, engagementTotal: 42100, likes: 37800, shares: 3100, comments: 1200, isByPolitician: false },
      { platform: 'TWITTER', content: '@nednwoko: I have committed to eradicating malaria not just from Nigeria but from the African continent. This is my life\'s mission. Join me. #MalariaFree', url: 'https://twitter.com/nednwoko/status/1860001', publishedAt: new Date('2024-04-25'), sentiment: 'POSITIVE', sentimentScore: 0.88, engagementTotal: 28700, likes: 22400, shares: 5200, comments: 1100, isByPolitician: true },
      { platform: 'TWITTER', content: 'A senator with 7 wives gets to lecture us about family values? Ned Nwoko\'s personal life undermines his credibility as a public health advocate.', url: 'https://twitter.com/user/status/1870001', publishedAt: new Date('2023-11-20'), sentiment: 'NEGATIVE', sentimentScore: -0.44, engagementTotal: 18900, likes: 8200, shares: 7900, comments: 2800, isByPolitician: false },
      { platform: 'FACEBOOK', content: 'Ned Nwoko\'s Senior Citizens Centre Bill has been signed into law. Millions of elderly Nigerians now have a dedicated welfare framework. Real legislation!', url: 'https://facebook.com/post/nwoko002', publishedAt: new Date('2022-09-20'), sentiment: 'POSITIVE', sentimentScore: 0.77, engagementTotal: 14200, likes: 11400, shares: 1900, comments: 900, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.511, totalMentions: 62400, followerCount: 1800000, engagementRate: 5.6 },
  })
  console.log('✅  Politicians 6–10')

  // ═══════════════════════════════════════════════════════════
  // POLITICIANS 11–15
  // ═══════════════════════════════════════════════════════════
  console.log('Seeding politicians 11–15…')

  // ── 11. Femi Gbajabiamila ───────────────────────────────────
  const gbaja = await prisma.politician.upsert({
    where: { slug: 'femi-gbajabiamila' }, update: {},
    create: {
      slug: 'femi-gbajabiamila', name: 'Femi Gbajabiamila', partyId: apc.id,
      position: 'Chief of Staff to the President', chamber: null,
      constituency: 'Surulere I', state: 'Lagos', lga: 'Surulere',
      dateOfBirth: new Date('1967-08-01'), gender: 'Male',
      education: 'LLB, Ogun State University; BL, Nigerian Law School; LLM, University of Lagos',
      biography: 'Rt. Hon. Femi Gbajabiamila is the current Chief of Staff to President Bola Tinubu, appointed May 2023. He previously served as Speaker of the House of Representatives (2019–2023), having represented Lagos Surulere I since 2003. A lawyer and five-term member of the House, he was a key strategist behind Tinubu\'s APC dominance in the Southwest and championed legislative procedural reforms during his speakership.',
      firstElected: 2003, currentTermStart: 2023, yearsInOffice: 20,
      billsSponsored: 47, attendanceRate: 86.4, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/femi-gbajabiamila.jpg',
      sourceUrl: 'https://statehouse.gov.ng/chief-of-staff',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: gbaja.id }, update: {},
    create: { politicianId: gbaja.id, email: 'chiefofstaff@statehouse.gov.ng', phone: '+234-9-315-0000', officeAddress: 'Office of the Chief of Staff, Aso Rock Villa, Abuja', twitterHandle: '@femigbaja', facebookUrl: 'https://facebook.com/femigbajabiamila', instagramHandle: '@femigbaja' },
  })
  await pol(gbaja.id, {
    career: [
      { year: 2003, title: 'Member, House of Representatives (Lagos Surulere)', description: 'First elected; served on Judiciary and Legal Matters Committee', category: 'Legislative' },
      { year: 2011, title: 'House Minority Leader', description: 'Served as Minority Leader of the House in the 7th Assembly', category: 'Legislative' },
      { year: 2015, title: 'House Majority Leader', description: 'Became Majority Leader under Speaker Dogara', category: 'Legislative' },
      { year: 2019, title: 'Speaker, House of Representatives', description: 'Elected Speaker; served until 2023; reformed committee structure and procedure', category: 'Legislative' },
      { year: 2023, title: 'Chief of Staff to the President', description: 'Appointed Chief of Staff to President Tinubu; vacated House seat', category: 'Executive' },
    ],
    committees: [
      { committeeName: 'House Speakership', role: 'Speaker', startDate: new Date('2019-06-11'), endDate: new Date('2023-06-12'), chamber: 'HOUSE_OF_REPRESENTATIVES' },
      { committeeName: 'Committee on Rules and Business', role: 'Ex-Officio', startDate: new Date('2019-06-11'), endDate: new Date('2023-06-12'), chamber: 'HOUSE_OF_REPRESENTATIVES' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Properties in Surulere, Lagos and Abuja GRA', estimatedValueKobo: 280_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Fleet of luxury vehicles and official state car', estimatedValueKobo: 40_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Bank Accounts', description: 'Fixed deposits and savings accounts in Lagos banks', estimatedValueKobo: 80_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Investments', description: 'Legal practice shares and real estate investments', estimatedValueKobo: 120_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Surulere Roads Emergency Rehabilitation', description: 'Patching and drainage improvement on 12 streets in Surulere constituency', location: 'Surulere, Lagos', budgetKobo: 1_400_000_000_000n, status: 'COMPLETED', year: 2022, completionPct: 100, contractor: 'Lagos State PWD', sourceUrl: 'https://budgit.org/project/surulere-roads' },
      { title: 'Surulere Youth Sports Complex', description: 'Construction of mini-stadium with football pitch and athletics track in Surulere', location: 'Surulere, Lagos', budgetKobo: 2_000_000_000_000n, status: 'ONGOING', year: 2021, completionPct: 55, contractor: 'Cappa D\'Alberto Plc', sourceUrl: 'https://budgit.org/project/surulere-sports' },
    ],
    votes: [
      { billTitle: 'Companies and Allied Matters Act (Amendment), 2020', vote: 'YES', sessionDate: new Date('2020-08-06'), billStatus: 'PASSED' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
      { billTitle: 'Student Loan (Access to Higher Education) Act, 2023', vote: 'YES', sessionDate: new Date('2023-04-12'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: '@femigbaja: As Chief of Staff I will ensure the President\'s agenda translates into concrete results for Nigerians. No more excuses. Only delivery. #RenouncingExcuses', url: 'https://twitter.com/femigbaja/status/1880001', publishedAt: new Date('2023-06-12'), sentiment: 'POSITIVE', sentimentScore: 0.62, engagementTotal: 21800, likes: 14200, shares: 5800, comments: 1800, isByPolitician: true },
      { platform: 'TWITTER', content: 'Gbajabiamila moved from Speaker to Chief of Staff to consolidate Tinubu\'s control. The whole government is run by Lagos people. This is not federalism.', url: 'https://twitter.com/user/status/1890001', publishedAt: new Date('2023-07-04'), sentiment: 'NEGATIVE', sentimentScore: -0.55, engagementTotal: 34200, likes: 14800, shares: 15600, comments: 3800, isByPolitician: false },
      { platform: 'FACEBOOK', content: 'Gbajabiamila\'s tenure as Speaker modernised House procedures. E-voting, published committee reports, better budgetary oversight. Credit where it is due.', url: 'https://facebook.com/post/gbaja001', publishedAt: new Date('2023-06-08'), sentiment: 'POSITIVE', sentimentScore: 0.59, engagementTotal: 8400, likes: 6200, shares: 1500, comments: 700, isByPolitician: false },
      { platform: 'TWITTER', content: 'Now that Gbajabiamila is Chief of Staff, Surulere is without effective representation. The by-election is overdue. #Surulere', url: 'https://twitter.com/user/status/1900001', publishedAt: new Date('2023-09-18'), sentiment: 'NEGATIVE', sentimentScore: -0.38, engagementTotal: 7200, likes: 3800, shares: 2600, comments: 800, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.168, totalMentions: 41200, followerCount: 780000, engagementRate: 3.6 },
  })

  // ── 12. Peter Obi ───────────────────────────────────────────
  const peterObi = await prisma.politician.upsert({
    where: { slug: 'peter-obi' }, update: {},
    create: {
      slug: 'peter-obi', name: 'Peter Gregory Obi', partyId: lp.id,
      position: 'Former Presidential Candidate / Former Governor', chamber: null,
      constituency: 'Anambra State', state: 'Anambra', lga: 'Onitsha North',
      dateOfBirth: new Date('1961-07-19'), gender: 'Male',
      education: 'BA Philosophy, University of Nigeria Nsukka; MBA Finance, University of Lagos',
      biography: 'Peter Obi served as Governor of Anambra State twice (2006–2014), gaining a reputation for fiscal prudence — saving over $1 billion in Anambra\'s external reserves. He was Atiku\'s vice-presidential running mate in 2019 under PDP. In 2022 he defected to Labour Party and ran for President in 2023, winning 6.1 million votes (25.4%) and finishing 3rd. He has challenged the result at the Supreme Court. Known as the "Obidient" candidate, he galvanised Nigeria\'s youth voter base like no candidate before him.',
      firstElected: 2006, currentTermStart: null, yearsInOffice: 8,
      billsSponsored: 0, attendanceRate: 0, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/peter-obi.jpg',
      sourceUrl: 'https://peterobi.ng',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: peterObi.id }, update: {},
    create: { politicianId: peterObi.id, email: 'contact@peterobi.ng', website: 'https://peterobi.ng', twitterHandle: '@PeterObi', facebookUrl: 'https://facebook.com/PeterGregoryObi', instagramHandle: '@peterobi' },
  })
  await pol(peterObi.id, {
    career: [
      { year: 2003, title: 'Elected Governor of Anambra State (APGA)', description: 'Elected governor but removed by court; eventually restored in 2006 after Supreme Court ruling', category: 'Executive' },
      { year: 2006, title: 'Restored as Governor of Anambra State', description: 'Supreme Court restored his mandate; served rest of term', category: 'Executive' },
      { year: 2010, title: 'Re-elected Governor of Anambra State', description: 'Re-elected for a full term; celebrated for fiscal prudence and education investment', category: 'Executive' },
      { year: 2019, title: 'PDP Vice-Presidential Candidate', description: 'Selected as Atiku Abubakar\'s running mate for 2019 presidential election', category: 'Party' },
      { year: 2023, title: 'Labour Party Presidential Candidate', description: 'Defected to LP; ran for President; won 25.4% — 6.1 million votes; challenging result in court', category: 'Election' },
    ],
    committees: [],
    assets: [
      { category: 'Bank Accounts', description: 'Published bank statements showing modest savings; known for transparency in asset declarations', estimatedValueKobo: 45_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/peter-obi-2023' },
      { category: 'Real Estate', description: 'Residential properties in Onitsha, Anambra State', estimatedValueKobo: 80_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/peter-obi-2023' },
      { category: 'Investments', description: 'Shares in Fidelity Bank and other Nigerian companies', estimatedValueKobo: 55_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Toyota Camry and modest vehicle holdings', estimatedValueKobo: 3_000_000_000n, yearDeclared: 2023, verified: true },
    ],
    projects: [],
    votes: [],
    social: [
      { platform: 'TWITTER', content: '@PeterObi: A government that cannot account for its spending has no moral authority to ask citizens to pay taxes. Accountability is not optional. #Nigeria', url: 'https://twitter.com/PeterObi/status/1870001', publishedAt: new Date('2024-01-20'), sentiment: 'POSITIVE', sentimentScore: 0.74, engagementTotal: 84200, likes: 62400, shares: 16800, comments: 5000, isByPolitician: true },
      { platform: 'TWITTER', content: 'Peter Obi got 6.1 million votes in 2023 and INEC and the Supreme Court still found reasons to dismiss his petition. This is why Nigerians are leaving.', url: 'https://twitter.com/user/status/1880001', publishedAt: new Date('2023-10-26'), sentiment: 'NEGATIVE', sentimentScore: -0.67, engagementTotal: 112000, likes: 52400, shares: 46200, comments: 13400, isByPolitician: false },
      { platform: 'TWITTER', content: 'Peter Obi in Davos speaking about Nigerian governance. The man is everywhere representing Nigeria with dignity. Can we just make him President already?', url: 'https://twitter.com/user/status/1890001', publishedAt: new Date('2024-01-18'), sentiment: 'POSITIVE', sentimentScore: 0.85, engagementTotal: 78400, likes: 61200, shares: 13400, comments: 3800, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'The Obidient movement changed Nigerian politics forever. Whatever happens in court, Peter Obi gave millions hope that a different Nigeria is possible.', url: 'https://instagram.com/p/obi003', publishedAt: new Date('2023-03-02'), sentiment: 'POSITIVE', sentimentScore: 0.88, engagementTotal: 148000, likes: 132000, shares: 12400, comments: 3600, isByPolitician: false },
      { platform: 'FACEBOOK', content: 'Peter Obi returning government cars and surplus funds to Anambra state treasury at the end of his tenure — this is why we trust him. No other governor did this.', url: 'https://facebook.com/post/obi004', publishedAt: new Date('2023-02-14'), sentiment: 'POSITIVE', sentimentScore: 0.91, engagementTotal: 94200, likes: 78400, shares: 12500, comments: 3300, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.624, totalMentions: 284000, followerCount: 4200000, engagementRate: 8.9 },
  })

  // ── 13. Nyesom Wike ─────────────────────────────────────────
  const wike = await prisma.politician.upsert({
    where: { slug: 'nyesom-wike' }, update: {},
    create: {
      slug: 'nyesom-wike', name: 'Siminalayi Fubara (Wike)', partyId: pdp.id,
      position: 'FCT Minister', chamber: null,
      constituency: 'Obio/Akpor', state: 'Rivers', lga: 'Obio/Akpor',
      dateOfBirth: new Date('1967-12-13'), gender: 'Male',
      education: 'LLB, Rivers State University; BL, Nigerian Law School',
      biography: 'Nyesom Ezenwo Wike served as Governor of Rivers State from 2015 to 2023, one of the most powerful and controversial governors in Nigeria. Despite being PDP, he became a vocal Tinubu supporter and was rewarded with appointment as Minister of the Federal Capital Territory (FCT) in August 2023. Known for confrontational politics, massive demolitions in Abuja, and fierce battles with his successor Sim Fubara, Wike is widely regarded as the most powerful minister in the Tinubu cabinet.',
      firstElected: 2015, currentTermStart: 2023, yearsInOffice: 9,
      billsSponsored: 0, attendanceRate: 0, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/nyesom-wike.jpg',
      sourceUrl: 'https://fct.gov.ng/minister-wike',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: wike.id }, update: {},
    create: { politicianId: wike.id, email: 'minister@fct.gov.ng', phone: '+234-9-461-0000', officeAddress: 'Office of the FCT Minister, Area 11, Garki, Abuja', twitterHandle: '@GovWike', facebookUrl: 'https://facebook.com/govwike', instagramHandle: '@nyesomwike' },
  })
  await pol(wike.id, {
    career: [
      { year: 2007, title: 'Chief of Staff to Rivers State Governor', description: 'Served as Chief of Staff to Governor Rotimi Amaechi', category: 'Executive' },
      { year: 2011, title: 'Minister of State for Education', description: 'Appointed Minister of State for Education under President Jonathan', category: 'Executive' },
      { year: 2015, title: 'Governor of Rivers State (1st term)', description: 'Elected Governor in a highly contested election; survived impeachment threats', category: 'Executive' },
      { year: 2019, title: 'Governor of Rivers State (2nd term)', description: 'Re-elected; oversaw major infrastructure projects in Rivers State', category: 'Executive' },
      { year: 2023, title: 'FCT Minister', description: 'Appointed Minister of Federal Capital Territory; began aggressive demolitions of "illegal" structures in Abuja', category: 'Executive' },
    ],
    committees: [],
    assets: [
      { category: 'Real Estate', description: 'Properties in Port Harcourt, Abuja, and reported overseas properties', estimatedValueKobo: 900_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Investments', description: 'Interests in construction and oil servicing companies in Rivers State', estimatedValueKobo: 400_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Fleet of armoured vehicles and luxury cars', estimatedValueKobo: 85_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Bank Accounts', description: 'Bank accounts in multiple Nigerian and foreign banks', estimatedValueKobo: 250_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Abuja Ring Road Phase 1 (FCT)', description: 'Construction of 14km expressway linking key FCT districts — Wike\'s flagship Abuja project', location: 'FCT, Abuja', budgetKobo: 15_000_000_000_000n, status: 'ONGOING', year: 2023, completionPct: 35, contractor: 'Julius Berger Nigeria Plc', sourceUrl: 'https://budgit.org/project/abuja-ring-road' },
      { title: 'Port Harcourt Flyover Network', description: '6 major flyovers built across Port Harcourt as Rivers State Governor', location: 'Port Harcourt, Rivers', budgetKobo: 12_000_000_000_000n, status: 'COMPLETED', year: 2022, completionPct: 100, contractor: 'RCC Nigeria Ltd', sourceUrl: 'https://budgit.org/project/ph-flyovers' },
      { title: 'Abuja Independent Power Plant', description: 'Construction of 1,000MW gas power plant to end FCT power shortages', location: 'FCT, Abuja', budgetKobo: 25_000_000_000_000n, status: 'NOT_STARTED', year: 2024, completionPct: 0, contractor: 'Under procurement', sourceUrl: 'https://budgit.org/project/abuja-ipp' },
    ],
    votes: [],
    social: [
      { platform: 'TWITTER', content: 'Wike demolishing buildings that were apparently "illegal" but built during the same government he now serves. Abuja demolitions are political not legal. #AbujaDemo', url: 'https://twitter.com/user/status/1900001', publishedAt: new Date('2024-03-15'), sentiment: 'NEGATIVE', sentimentScore: -0.62, engagementTotal: 48200, likes: 18400, shares: 22100, comments: 7700, isByPolitician: false },
      { platform: 'TWITTER', content: '@GovWike: I am not afraid of anybody. Not the Presidency, not the Senate, not the PDP. I serve the people of FCT and the Nigerian Constitution. Period.', url: 'https://twitter.com/GovWike/status/1910001', publishedAt: new Date('2024-05-22'), sentiment: 'POSITIVE', sentimentScore: 0.58, engagementTotal: 62400, likes: 41200, shares: 15800, comments: 5400, isByPolitician: true },
      { platform: 'FACEBOOK', content: 'Minister Wike has done more road construction in Abuja in 12 months than his predecessors did in 5 years. Whatever his controversies, infrastructure is real.', url: 'https://facebook.com/post/wike001', publishedAt: new Date('2024-08-10'), sentiment: 'POSITIVE', sentimentScore: 0.61, engagementTotal: 28400, likes: 21500, shares: 5100, comments: 1800, isByPolitician: false },
      { platform: 'TWITTER', content: 'The Rivers State – FIRS battle. Wike vs Fubara. PDP implosion. This is what happens when you make a deal with the devil. #RiversCrisis', url: 'https://twitter.com/user/status/1920001', publishedAt: new Date('2024-01-28'), sentiment: 'NEGATIVE', sentimentScore: -0.54, engagementTotal: 38900, likes: 16200, shares: 17400, comments: 5300, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'FCT Minister Wike commissioning new roads in Abuja. Say what you want — this man DELIVERS projects 💪🇳🇬 #AbujaNew', url: 'https://instagram.com/p/wike003', publishedAt: new Date('2024-07-01'), sentiment: 'POSITIVE', sentimentScore: 0.66, engagementTotal: 35600, likes: 30200, shares: 3800, comments: 1600, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.089, totalMentions: 98400, followerCount: 2100000, engagementRate: 5.8 },
  })

  // ── 14. Babajide Sanwo-Olu ──────────────────────────────────
  const sanwoOlu = await prisma.politician.upsert({
    where: { slug: 'babajide-sanwo-olu' }, update: {},
    create: {
      slug: 'babajide-sanwo-olu', name: 'Babajide Olusola Sanwo-Olu', partyId: apc.id,
      position: 'Governor, Lagos State', chamber: null,
      constituency: 'Lagos State', state: 'Lagos', lga: 'Lagos Mainland',
      dateOfBirth: new Date('1965-06-25'), gender: 'Male',
      education: 'BSc Systems Analysis, University of Lagos; MSc Science of Administration, Central Michigan University',
      biography: 'Babajide Olusola Sanwo-Olu is the Governor of Lagos State, serving since 2019 and re-elected in 2023. An economist and administrator, he previously served as MD of Lagos State Property Development Corporation and as Special Adviser on Finance. As governor he oversaw the launch of the Blue and Red Rail Lines (Lagos Rail Mass Transit) — Nigeria\'s first urban train system. His tenure was marked by the #EndSARS protest crisis in October 2020 and controversial demolitions in Lagos.',
      firstElected: 2019, currentTermStart: 2023, yearsInOffice: 5,
      billsSponsored: 0, attendanceRate: 0, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/babajide-sanwo-olu.jpg',
      sourceUrl: 'https://lagosstate.gov.ng/governor',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: sanwoOlu.id }, update: {},
    create: { politicianId: sanwoOlu.id, email: 'governor@lagosstate.gov.ng', phone: '+234-1-460-0000', officeAddress: 'Lagos House, Alausa, Ikeja, Lagos State', website: 'https://lagosstate.gov.ng', twitterHandle: '@jidesanwoolu', facebookUrl: 'https://facebook.com/jidesanwooluofficial', instagramHandle: '@jidesanwoolu' },
  })
  await pol(sanwoOlu.id, {
    career: [
      { year: 2003, title: 'MD, Lagos State Property Development Corporation', description: 'Led Lagos State housing development agency', category: 'Executive' },
      { year: 2015, title: 'SA to Governor on Commerce, Industry and Cooperatives', description: 'Appointed Special Adviser on economic matters by Governor Ambode', category: 'Executive' },
      { year: 2019, title: 'Governor of Lagos State (1st term)', description: 'Elected Governor; launched Lagos Rail Mass Transit Blue Line project', category: 'Executive' },
      { year: 2023, title: 'Governor of Lagos State (2nd term)', description: 'Re-elected; oversaw commissioning of Red and Blue rail lines', category: 'Executive' },
    ],
    committees: [],
    assets: [
      { category: 'Real Estate', description: 'Properties in Ikoyi, Victoria Island, and Lekki, Lagos', estimatedValueKobo: 450_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Bank Accounts', description: 'Accounts in major Nigerian commercial banks', estimatedValueKobo: 90_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/sanwo-olu-2023' },
      { category: 'Investments', description: 'Shares in listed companies and private equity interests', estimatedValueKobo: 140_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Lagos Rail Mass Transit Blue Line (Marina–Mile 2)', description: '13km elevated light rail — Nigeria\'s first operational urban rail, commissioned December 2022', location: 'Marina to Mile 2, Lagos', budgetKobo: 110_000_000_000_000n, status: 'COMPLETED', year: 2022, completionPct: 100, contractor: 'CCECC/CRC Consortium', sourceUrl: 'https://budgit.org/project/lagos-blue-line' },
      { title: 'Lagos Rail Mass Transit Red Line', description: '37km commuter rail from Agbado to Marina; extension of Blue Line network', location: 'Agbado to Marina, Lagos', budgetKobo: 140_000_000_000_000n, status: 'COMPLETED', year: 2023, completionPct: 100, contractor: 'CCECC Nigeria Limited', sourceUrl: 'https://budgit.org/project/lagos-red-line' },
      { title: 'Lekki Deep Seaport', description: 'Construction of the Lekki Deep Sea Port — Nigeria\'s largest, operational 2023', location: 'Lekki, Lagos', budgetKobo: 150_000_000_000_000n, status: 'COMPLETED', year: 2022, completionPct: 100, contractor: 'Tolaram Group', sourceUrl: 'https://budgit.org/project/lekki-deepseaport' },
    ],
    votes: [],
    social: [
      { platform: 'TWITTER', content: '@jidesanwoolu: The Blue Line is running. Lagos has a TRAIN. This is what governance looks like — delivering for the people, not just making promises. #LagosTrain', url: 'https://twitter.com/jidesanwoolu/status/1890001', publishedAt: new Date('2022-12-05'), sentiment: 'POSITIVE', sentimentScore: 0.88, engagementTotal: 92400, likes: 72400, shares: 14800, comments: 5200, isByPolitician: true },
      { platform: 'TWITTER', content: 'Governor Sanwo-Olu apologising for Lekki Toll Gate massacre while the people responsible walk free. Empty words. #EndSARS #LekkiMassacre', url: 'https://twitter.com/user/status/1900001', publishedAt: new Date('2020-10-22'), sentiment: 'NEGATIVE', sentimentScore: -0.79, engagementTotal: 184000, likes: 82400, shares: 78200, comments: 23400, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'Lagos State Governor Sanwo-Olu inaugurating the Red Line train at Agbado Station. The face of a man who actually built what he promised! 🚆🇳🇬', url: 'https://instagram.com/p/sanwo001', publishedAt: new Date('2023-11-28'), sentiment: 'POSITIVE', sentimentScore: 0.82, engagementTotal: 134000, likes: 118000, shares: 11800, comments: 4200, isByPolitician: false },
      { platform: 'FACEBOOK', content: 'Sanwo-Olu is the best governor Lagos has had in decades. Rail, seaport, roads, hospitals. Now stop defending #EndSARS and take responsibility.', url: 'https://facebook.com/post/sanwo001', publishedAt: new Date('2023-05-15'), sentiment: 'NEUTRAL', sentimentScore: 0.12, engagementTotal: 48400, likes: 31200, shares: 12800, comments: 4400, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.411, totalMentions: 184000, followerCount: 3100000, engagementRate: 5.4 },
  })

  // ── 15. Seyi Makinde ───────────────────────────────────────
  const makinde = await prisma.politician.upsert({
    where: { slug: 'seyi-makinde' }, update: {},
    create: {
      slug: 'seyi-makinde', name: 'Seyi Makinde', partyId: pdp.id,
      position: 'Governor, Oyo State', chamber: null,
      constituency: 'Oyo State', state: 'Oyo', lga: 'Ibadan North',
      dateOfBirth: new Date('1968-06-25'), gender: 'Male',
      education: 'BSc Electrical & Electronics Engineering, University of Lagos; MSc Systems Engineering, University of Lagos',
      biography: 'Engr. Seyi Makinde is the Governor of Oyo State, elected in 2019 and re-elected in 2023 — the only PDP governor in the entire Southwest geopolitical zone. A self-made businessman (GITEC Engineering) who built an engineering company from nothing, he is known for free basic education, airport revitalisation, and massive road construction. He positioned himself as the G-5 governors leader who refused to support Atiku in 2023 but was the only one to keep his governorship, giving him enormous PDP leverage.',
      firstElected: 2019, currentTermStart: 2023, yearsInOffice: 5,
      billsSponsored: 0, attendanceRate: 0, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/seyi-makinde.jpg',
      sourceUrl: 'https://oyostate.gov.ng/governor',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: makinde.id }, update: {},
    create: { politicianId: makinde.id, email: 'governor@oyostate.gov.ng', phone: '+234-2-241-0000', officeAddress: 'Governor\'s Office, Secretariat, Agodi, Ibadan', website: 'https://oyostate.gov.ng', twitterHandle: '@seyimakinde', facebookUrl: 'https://facebook.com/seyimakindegov', instagramHandle: '@seyimakinde' },
  })
  await pol(makinde.id, {
    career: [
      { year: 2011, title: 'First Governorship Attempt', description: 'Ran for Oyo Governor under ACN but lost', category: 'Election' },
      { year: 2015, title: 'Second Governorship Attempt', description: 'Ran for Oyo Governor under SDP but lost again — returned to business', category: 'Election' },
      { year: 2019, title: 'Governor of Oyo State', description: 'Third attempt; won under PDP, defeating incumbent APC governor Abiola Ajimobi', category: 'Executive' },
      { year: 2023, title: 'Governor of Oyo State (2nd term)', description: 'Re-elected comfortably despite PDP national tensions; only SW PDP governor', category: 'Executive' },
    ],
    committees: [],
    assets: [
      { category: 'Investments', description: 'GITEC Engineering Ltd (founder) — engineering and oil services firm', estimatedValueKobo: 500_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Real Estate', description: 'Properties in Ibadan and Lagos', estimatedValueKobo: 180_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Bank Accounts', description: 'Accounts in various Nigerian banks', estimatedValueKobo: 70_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Oyo State Free Education Programme', description: 'Payment of WAEC/NECO fees and provision of free textbooks for all public secondary school students in Oyo', location: 'Oyo State', budgetKobo: 2_400_000_000_000n, status: 'ONGOING', year: 2019, completionPct: 85, contractor: 'Oyo State Ministry of Education', sourceUrl: 'https://budgit.org/project/oyo-free-education' },
      { title: 'Ibadan Circular Road (Ring Road)', description: '80km ring road around Ibadan city to ease traffic and open new development corridors', location: 'Ibadan, Oyo', budgetKobo: 10_000_000_000_000n, status: 'ONGOING', year: 2021, completionPct: 38, contractor: 'Julius Berger / Hitech Construction', sourceUrl: 'https://budgit.org/project/ibadan-ring-road' },
      { title: 'Ibadan Airport Expansion', description: 'Rehabilitation and international expansion of Ibadan Airport terminal and runway', location: 'Ibadan, Oyo', budgetKobo: 5_000_000_000_000n, status: 'ONGOING', year: 2022, completionPct: 55, contractor: 'Julius Berger Nigeria Plc', sourceUrl: 'https://budgit.org/project/ibadan-airport' },
    ],
    votes: [],
    social: [
      { platform: 'TWITTER', content: '@seyimakinde: Free education in Oyo State is not a campaign promise — it is a LAW. Any public school that collects fees from students will be sanctioned immediately.', url: 'https://twitter.com/seyimakinde/status/1870001', publishedAt: new Date('2022-05-20'), sentiment: 'POSITIVE', sentimentScore: 0.86, engagementTotal: 74200, likes: 55400, shares: 14200, comments: 4600, isByPolitician: true },
      { platform: 'TWITTER', content: 'Seyi Makinde is the only governor in the Southwest proving that PDP can govern well. If only the national party would leave him alone.', url: 'https://twitter.com/user/status/1880001', publishedAt: new Date('2023-11-10'), sentiment: 'POSITIVE', sentimentScore: 0.72, engagementTotal: 38400, likes: 27200, shares: 8400, comments: 2800, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'Governor Makinde at the groundbreaking for the Ibadan Circular Road. When finished, this will transform the entire city 🙌 #Ibadan #OyoStrong', url: 'https://instagram.com/p/makinde001', publishedAt: new Date('2021-08-15'), sentiment: 'POSITIVE', sentimentScore: 0.79, engagementTotal: 56800, likes: 49200, shares: 5900, comments: 1700, isByPolitician: false },
      { platform: 'TWITTER', content: 'Makinde refusing to endorse Atiku in 2023 was childish and cost PDP the election. He put his ego above party. Now he wants national leadership? No.', url: 'https://twitter.com/user/status/1890001', publishedAt: new Date('2023-04-15'), sentiment: 'NEGATIVE', sentimentScore: -0.58, engagementTotal: 22400, likes: 8400, shares: 10200, comments: 3800, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.548, totalMentions: 118000, followerCount: 2400000, engagementRate: 6.1 },
  })
  console.log('✅  Politicians 11–15')

  // ═══════════════════════════════════════════════════════════
  // POLITICIANS 16–20
  // ═══════════════════════════════════════════════════════════
  console.log('Seeding politicians 16–20…')

  // ── 16. Alex Otti ───────────────────────────────────────────
  const alexOtti = await prisma.politician.upsert({
    where: { slug: 'alex-otti' }, update: {},
    create: {
      slug: 'alex-otti', name: 'Alex Chioma Otti', partyId: lp.id,
      position: 'Governor, Abia State', chamber: null,
      constituency: 'Abia State', state: 'Abia', lga: 'Isiukwuato',
      dateOfBirth: new Date('1967-01-15'), gender: 'Male',
      education: 'BSc Banking & Finance, University of Nigeria Nsukka; MSc Finance, University of Lagos; AMP Harvard Business School',
      biography: 'Dr. Alex Chioma Otti is the Governor of Abia State, elected in March 2023 on the Labour Party ticket — LP\'s only governorship win in 2023. A former Group Managing Director of Diamond Bank, he is Nigeria\'s first banking executive to become a state governor. Abia State was historically under PDP with a reputation for poor governance; Otti won on a platform of accountability, workers\' salaries, and industrialisation. He has prioritised clearing salary arrears owed to civil servants and teachers going back years.',
      firstElected: 2023, currentTermStart: 2023, yearsInOffice: 1,
      billsSponsored: 0, attendanceRate: 0, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/alex-otti.jpg',
      sourceUrl: 'https://abiastate.gov.ng/governor',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: alexOtti.id }, update: {},
    create: { politicianId: alexOtti.id, email: 'governor@abiastate.gov.ng', officeAddress: 'Government House, Umuahia, Abia State', website: 'https://abiastate.gov.ng', twitterHandle: '@alexottiofficial', facebookUrl: 'https://facebook.com/alexottiofficial', instagramHandle: '@alexotti' },
  })
  await pol(alexOtti.id, {
    career: [
      { year: 2004, title: 'Deputy MD, Diamond Bank', description: 'Rose to Deputy Managing Director of Diamond Bank', category: 'Private Sector' },
      { year: 2009, title: 'Group MD/CEO, Diamond Bank', description: 'Led Diamond Bank through major expansion and public listing', category: 'Private Sector' },
      { year: 2015, title: 'Governorship Attempt (APGA)', description: 'First gubernatorial bid in Abia; result disputed in court', category: 'Election' },
      { year: 2019, title: 'Governorship Attempt (PDP & LP)', description: 'Second attempt; contested but disputed outcome', category: 'Election' },
      { year: 2023, title: 'Governor of Abia State (LP)', description: 'Won Abia governorship under Labour Party; first LP governor', category: 'Executive' },
    ],
    committees: [],
    assets: [
      { category: 'Investments', description: 'Banking and financial sector investments', estimatedValueKobo: 280_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/alex-otti-2023' },
      { category: 'Real Estate', description: 'Properties in Umuahia, Lagos, and Abuja', estimatedValueKobo: 120_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/alex-otti-2023' },
      { category: 'Bank Accounts', description: 'Accounts declared to CCB on assumption of office', estimatedValueKobo: 65_000_000_000n, yearDeclared: 2023, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/alex-otti-2023' },
    ],
    projects: [
      { title: 'Civil Servants Salary Arrears Clearance', description: 'Clearance of 10 months of outstanding salary arrears owed to Abia State workers inherited from PDP government', location: 'Abia State', budgetKobo: 4_500_000_000_000n, status: 'COMPLETED', year: 2023, completionPct: 100, contractor: 'Government of Abia State', sourceUrl: 'https://budgit.org/project/abia-salary-arrears' },
      { title: 'Aba Flyover & Roads Rehabilitation Package', description: 'Emergency rehabilitation of 35km roads in Aba commercial city including new flyover', location: 'Aba, Abia', budgetKobo: 6_000_000_000_000n, status: 'ONGOING', year: 2024, completionPct: 28, contractor: 'Craneburg Construction', sourceUrl: 'https://budgit.org/project/aba-flyover' },
    ],
    votes: [],
    social: [
      { platform: 'TWITTER', content: '@alexottiofficial: Abia workers have received their 10 months salary arrears. No governor has done this in Abia in a decade. We are just getting started. #AbiaRising', url: 'https://twitter.com/alexottiofficial/status/1900001', publishedAt: new Date('2023-10-15'), sentiment: 'POSITIVE', sentimentScore: 0.91, engagementTotal: 68400, likes: 51200, shares: 13800, comments: 3400, isByPolitician: true },
      { platform: 'TWITTER', content: 'Alex Otti is proving that good governance is possible in the Southeast. PDP had Abia for 24 years and gave nothing. LP in 6 months already paying workers!', url: 'https://twitter.com/user/status/1905001', publishedAt: new Date('2023-11-02'), sentiment: 'POSITIVE', sentimentScore: 0.87, engagementTotal: 42800, likes: 32400, shares: 8200, comments: 2200, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'Governor Alex Otti showing transparency at work — publishing monthly revenue and expenditure. Nigerians deserve this from every governor! 📊🇳🇬', url: 'https://instagram.com/p/otti001', publishedAt: new Date('2024-02-28'), sentiment: 'POSITIVE', sentimentScore: 0.84, engagementTotal: 28200, likes: 24100, shares: 2900, comments: 1200, isByPolitician: false },
      { platform: 'TWITTER', content: 'The Aba road project has stalled. Governor Otti promised transformation but Aba is still flooded and broken. Talk is cheap.', url: 'https://twitter.com/user/status/1920001', publishedAt: new Date('2024-06-14'), sentiment: 'NEGATIVE', sentimentScore: -0.42, engagementTotal: 9400, likes: 3800, shares: 4200, comments: 1400, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.641, totalMentions: 62400, followerCount: 920000, engagementRate: 6.4 },
  })

  // ── 17. Simon Lalong ────────────────────────────────────────
  const lalong = await prisma.politician.upsert({
    where: { slug: 'simon-lalong' }, update: {},
    create: {
      slug: 'simon-lalong', name: 'Simon Bako Lalong', partyId: apc.id,
      position: 'Senator', chamber: 'SENATE',
      constituency: 'Plateau Central', state: 'Plateau', lga: 'Shendam',
      dateOfBirth: new Date('1963-06-15'), gender: 'Male',
      education: 'LLB, University of Jos; BL, Nigerian Law School',
      biography: 'Senator Simon Bako Lalong served as Governor of Plateau State from 2015 to 2023, earning recognition for peacebuilding in the conflict-prone Middle Belt region. He was elected Senator for Plateau Central in 2023, continuing his legislative career after two gubernatorial terms. As governor, he chaired the Nigeria Governors Forum and worked to reduce communal violence. He was also the APC\'s Director-General of its 2023 presidential campaign.',
      firstElected: 2015, currentTermStart: 2023, yearsInOffice: 9,
      billsSponsored: 14, attendanceRate: 82.6, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/simon-lalong.jpg',
      sourceUrl: 'https://nass.gov.ng/senator/simon-lalong',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: lalong.id }, update: {},
    create: { politicianId: lalong.id, email: 'sen.lalong@nass.gov.ng', officeAddress: 'Senate Office, National Assembly Complex, Abuja', twitterHandle: '@simonlalong', facebookUrl: 'https://facebook.com/governorsimonlalong', instagramHandle: '@simon_lalong' },
  })
  await pol(lalong.id, {
    career: [
      { year: 2002, title: 'Member, Plateau State House of Assembly', description: 'Served as member and later Speaker of Plateau State House of Assembly', category: 'Legislative' },
      { year: 2015, title: 'Governor of Plateau State (1st term)', description: 'Elected Governor; focused on peacebuilding and interreligious dialogue', category: 'Executive' },
      { year: 2019, title: 'Governor of Plateau State (2nd term)', description: 'Re-elected; chaired Nigeria Governors Forum; DG of APC 2023 presidential campaign', category: 'Executive' },
      { year: 2023, title: 'Senator, Plateau Central', description: 'Elected to Senate after completing gubernatorial terms', category: 'Legislative' },
    ],
    committees: [
      { committeeName: 'Committee on Intergovernmental Affairs', role: 'Chairman', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
      { committeeName: 'Committee on Defence', role: 'Member', startDate: new Date('2023-07-01'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Properties in Jos and Abuja', estimatedValueKobo: 130_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Farm Land', description: 'Agricultural land in Shendam LGA, Plateau State', estimatedValueKobo: 18_000_000_000n, yearDeclared: 2023, verified: false },
      { category: 'Vehicles', description: 'Toyota Land Cruiser and Honda Pilot', estimatedValueKobo: 11_000_000_000n, yearDeclared: 2023, verified: false },
    ],
    projects: [
      { title: 'Jos Peace Centre', description: 'Construction of interfaith peace and dialogue centre in Jos', location: 'Jos, Plateau', budgetKobo: 800_000_000_000n, status: 'COMPLETED', year: 2020, completionPct: 100, contractor: 'Plateau State MWC', sourceUrl: 'https://budgit.org/project/jos-peace-centre' },
      { title: 'Plateau State Rural Road Programme', description: '200km of rural feeder roads connecting farming communities to markets', location: 'Plateau State', budgetKobo: 6_000_000_000_000n, status: 'ONGOING', year: 2021, completionPct: 68, contractor: 'Julius Berger / RCC', sourceUrl: 'https://budgit.org/project/plateau-rural-roads' },
    ],
    votes: [
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Minimum Wage (Amendment) Act, 2024', vote: 'YES', sessionDate: new Date('2024-07-11'), billStatus: 'PASSED' },
      { billTitle: 'Local Government Autonomy (Constitution Amendment) Bill, 2024', vote: 'YES', sessionDate: new Date('2024-03-26'), billStatus: 'THIRD_READING' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: '@simonlalong: Peace in Plateau State is not accidental — it is the result of deliberate, sustained dialogue between communities. We must never stop that work. #MiddleBeltPeace', url: 'https://twitter.com/simonlalong/status/1880001', publishedAt: new Date('2022-11-28'), sentiment: 'POSITIVE', sentimentScore: 0.74, engagementTotal: 18200, likes: 12400, shares: 4200, comments: 1600, isByPolitician: true },
      { platform: 'FACEBOOK', content: 'Governor Lalong has done more for peace in Plateau than anyone before him. The interfaith dialogue centres are real and working. Credit where due.', url: 'https://facebook.com/post/lalong001', publishedAt: new Date('2022-08-15'), sentiment: 'POSITIVE', sentimentScore: 0.68, engagementTotal: 9200, likes: 7100, shares: 1500, comments: 600, isByPolitician: false },
      { platform: 'TWITTER', content: 'Plateau State still has regular Fulani-farmer violence under Lalong. Peace proclamations without disarmament are just words. #PlateauSecurity', url: 'https://twitter.com/user/status/1890001', publishedAt: new Date('2021-07-10'), sentiment: 'NEGATIVE', sentimentScore: -0.61, engagementTotal: 14800, likes: 5600, shares: 6800, comments: 2400, isByPolitician: false },
      { platform: 'TWITTER', content: 'Simon Lalong as APC presidential campaign DG was a surprise pick. But his cross-religious and ethnic appeal makes him a smart choice for the Middle Belt.', url: 'https://twitter.com/user/status/1870001', publishedAt: new Date('2022-12-15'), sentiment: 'NEUTRAL', sentimentScore: 0.22, engagementTotal: 8400, likes: 5200, shares: 2200, comments: 1000, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.288, totalMentions: 24800, followerCount: 380000, engagementRate: 3.1 },
  })

  // ── 18. Shehu Sani ──────────────────────────────────────────
  const sheuSani = await prisma.politician.upsert({
    where: { slug: 'shehu-sani' }, update: {},
    create: {
      slug: 'shehu-sani', name: 'Shehu Sani', partyId: apc.id,
      position: 'Former Senator / Civil Society Leader', chamber: null,
      constituency: 'Kaduna Central', state: 'Kaduna', lga: 'Kaduna North',
      dateOfBirth: new Date('1968-01-27'), gender: 'Male',
      education: 'BA Mass Communication, Ahmadu Bello University',
      biography: 'Shehu Sani is a writer, human rights activist, and former Senator for Kaduna Central (APC, 2015–2019). Before politics, he spent over a decade as a civil rights campaigner and was imprisoned multiple times under military rule. In the Senate, he championed anti-torture and human rights legislation and became one of the strongest critics of President Buhari\'s administration from within APC. He lost his Senate seat in 2019 after falling out with Governor Nasir el-Rufai. He remains active as a public intellectual and commentator.',
      firstElected: 2015, currentTermStart: null, yearsInOffice: 4,
      billsSponsored: 22, attendanceRate: 89.2, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/shehu-sani.jpg',
      sourceUrl: 'https://twitter.com/ShehuSani',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: sheuSani.id }, update: {},
    create: { politicianId: sheuSani.id, twitterHandle: '@ShehuSani', facebookUrl: 'https://facebook.com/ShehuSaniKaduna' },
  })
  await pol(sheuSani.id, {
    career: [
      { year: 1997, title: 'Imprisoned by Abacha Regime', description: 'Detained without trial for civil rights activism against military dictatorship', category: 'Civil Society' },
      { year: 2003, title: 'Founded CEDDERT', description: 'Co-founded Centre for Democratic Development, Research and Training in Zaria', category: 'Civil Society' },
      { year: 2015, title: 'Senator, Kaduna Central (APC)', description: 'Elected senator; known for fiery speeches and minority rights legislation', category: 'Legislative' },
      { year: 2019, title: 'Lost Senatorial Seat', description: 'Lost APC primary to Uba Sani after conflict with Governor el-Rufai', category: 'Election' },
    ],
    committees: [
      { committeeName: 'Committee on Federal Character & Intergovernmental Affairs', role: 'Chairman', startDate: new Date('2015-07-01'), endDate: new Date('2019-06-30'), chamber: 'SENATE' },
      { committeeName: 'Committee on Anti-Corruption', role: 'Member', startDate: new Date('2015-07-01'), endDate: new Date('2019-06-30'), chamber: 'SENATE' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Modest family home in Kaduna', estimatedValueKobo: 18_000_000_000n, yearDeclared: 2019, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/shehu-sani-2019' },
      { category: 'Bank Accounts', description: 'Savings accounts in Kaduna-based banks', estimatedValueKobo: 8_000_000_000n, yearDeclared: 2019, verified: true, sourceDocumentUrl: 'https://ccb.gov.ng/declarations/shehu-sani-2019' },
      { category: 'Vehicles', description: 'Toyota Camry 2014', estimatedValueKobo: 1_500_000_000n, yearDeclared: 2019, verified: true },
    ],
    projects: [
      { title: 'Kaduna Central Youth Skills Programme', description: 'Vocational training for 1,000 youths in Kaduna city in carpentry, tailoring, and ICT', location: 'Kaduna Central, Kaduna', budgetKobo: 200_000_000_000n, status: 'COMPLETED', year: 2018, completionPct: 100, contractor: 'Kaduna Polytechnic', sourceUrl: 'https://budgit.org/project/kaduna-central-youth' },
      { title: 'Zaria City Heritage Conservation', description: 'Documentation and restoration of historic Zaria city walls and Hausa architecture', location: 'Zaria, Kaduna', budgetKobo: 120_000_000_000n, status: 'COMPLETED', year: 2017, completionPct: 100, contractor: 'Kaduna SMDF', sourceUrl: 'https://budgit.org/project/zaria-heritage' },
    ],
    votes: [
      { billTitle: 'Social Media (Prohibition of Falsehood) Bill, 2019', vote: 'NO', sessionDate: new Date('2019-11-05'), billStatus: 'REJECTED' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
      { billTitle: 'National Health Insurance Authority Act, 2022', vote: 'YES', sessionDate: new Date('2022-05-17'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: '@ShehuSani: Those who torture prisoners are themselves prisoners of their own conscience. Nigeria must ratify the UN Convention Against Torture without delay.', url: 'https://twitter.com/ShehuSani/status/1830001', publishedAt: new Date('2023-06-26'), sentiment: 'POSITIVE', sentimentScore: 0.72, engagementTotal: 38400, likes: 28200, shares: 7900, comments: 2300, isByPolitician: true },
      { platform: 'TWITTER', content: 'Shehu Sani is the conscience of the Nigerian Senate. No one else is willing to say what needs to be said. Miss him in that chamber.', url: 'https://twitter.com/user/status/1840001', publishedAt: new Date('2021-10-01'), sentiment: 'POSITIVE', sentimentScore: 0.78, engagementTotal: 22400, likes: 17200, shares: 4100, comments: 1100, isByPolitician: false },
      { platform: 'TWITTER', content: '@ShehuSani: El-Rufai destroyed Kaduna State economically while using ethnic division to stay in power. History will judge him harshly. I stand by every word.', url: 'https://twitter.com/ShehuSani/status/1850001', publishedAt: new Date('2022-03-15'), sentiment: 'NEGATIVE', sentimentScore: -0.45, engagementTotal: 58400, likes: 38400, shares: 14800, comments: 5200, isByPolitician: true },
      { platform: 'FACEBOOK', content: 'Shehu Sani proving again why he is different. Asset declaration published. No luxury cars. No mansions. Just a man of the people from Kaduna.', url: 'https://facebook.com/post/shehu001', publishedAt: new Date('2019-05-10'), sentiment: 'POSITIVE', sentimentScore: 0.88, engagementTotal: 18900, likes: 15400, shares: 2800, comments: 700, isByPolitician: false },
      { platform: 'TWITTER', content: 'Five years after leaving the Senate, Shehu Sani remains one of the most relevant political voices in Nigeria. That says a lot about him and about everyone else.', url: 'https://twitter.com/user/status/1860001', publishedAt: new Date('2024-03-22'), sentiment: 'POSITIVE', sentimentScore: 0.76, engagementTotal: 14200, likes: 10200, shares: 3100, comments: 900, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.578, totalMentions: 88400, followerCount: 1900000, engagementRate: 7.2 },
  })

  // ── 19. Chukwuemeka Nwajiuba ────────────────────────────────
  const nwajiuba = await prisma.politician.upsert({
    where: { slug: 'chukwuemeka-nwajiuba' }, update: { isActive: true },
    create: {
      slug: 'chukwuemeka-nwajiuba', name: 'Chukwuemeka Nwajiuba', partyId: apc.id,
      position: 'Former Minister of State for Education', chamber: null,
      constituency: 'Isiala Mbano/Onuimo/Okigwe', state: 'Imo', lga: 'Isiala Mbano',
      dateOfBirth: new Date('1965-08-12'), gender: 'Male',
      education: 'BSc Computer Science, Imo State University; MSc, Abia State University',
      biography: 'Chukwuemeka Nwajiuba is a former member of the House of Representatives representing Isiala Mbano/Onuimo/Okigwe (2015–2019) and was appointed Minister of State for Education under President Buhari from 2019 to 2023. He surprised the political class in 2023 when he declared a presidential bid, but withdrew later. During his ministerial tenure he was involved in the Student Loan Act framework and ASUU negotiations.',
      firstElected: 2015, currentTermStart: null, yearsInOffice: 8,
      billsSponsored: 15, attendanceRate: 83.4, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/chukwuemeka-nwajiuba.jpg',
      sourceUrl: 'https://education.gov.ng/minister-of-state',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: nwajiuba.id }, update: {},
    create: { politicianId: nwajiuba.id, email: 'nwajiuba@gmail.com', twitterHandle: '@nwajiuba', facebookUrl: 'https://facebook.com/nwajiubaofficial' },
  })
  await pol(nwajiuba.id, {
    career: [
      { year: 2015, title: 'Member, House of Representatives (Isiala Mbano/Onuimo/Okigwe)', description: 'Elected to the House; served on Education Committee', category: 'Legislative' },
      { year: 2019, title: 'Minister of State for Education', description: 'Appointed by President Buhari; oversaw JAMB, WAEC, and ASUU crisis management', category: 'Executive' },
      { year: 2023, title: 'Declared Presidential Bid', description: 'Declared APC presidential candidacy; withdrew before primary; returned to private life', category: 'Election' },
    ],
    committees: [
      { committeeName: 'Committee on Education (Basic & Secondary)', role: 'Chairman', startDate: new Date('2015-07-01'), endDate: new Date('2019-06-30'), chamber: 'HOUSE_OF_REPRESENTATIVES' },
      { committeeName: 'Committee on Science and Technology', role: 'Member', startDate: new Date('2015-07-01'), endDate: new Date('2019-06-30'), chamber: 'HOUSE_OF_REPRESENTATIVES' },
    ],
    assets: [
      { category: 'Real Estate', description: 'Properties in Owerri, Imo State and Abuja', estimatedValueKobo: 90_000_000_000n, yearDeclared: 2022, verified: false },
      { category: 'Bank Accounts', description: 'Savings and term accounts in Nigerian banks', estimatedValueKobo: 28_000_000_000n, yearDeclared: 2022, verified: false },
      { category: 'Vehicles', description: 'Toyota Land Cruiser and Honda CR-V', estimatedValueKobo: 9_000_000_000n, yearDeclared: 2022, verified: false },
    ],
    projects: [
      { title: 'Isiala Mbano Technical College Upgrade', description: 'Renovation and equipment of Isiala Mbano Technical College workshop', location: 'Isiala Mbano, Imo', budgetKobo: 400_000_000_000n, status: 'COMPLETED', year: 2017, completionPct: 100, contractor: 'Imo State Works', sourceUrl: 'https://budgit.org/project/isiala-mbano-tech' },
      { title: 'Okigwe–Owerri Road Drainage Works', description: 'Drainage and flood control works on the Okigwe–Owerri federal road segment', location: 'Okigwe, Imo', budgetKobo: 350_000_000_000n, status: 'COMPLETED', year: 2016, completionPct: 100, contractor: 'Hicson Nig Ltd', sourceUrl: 'https://budgit.org/project/okigwe-drainage' },
    ],
    votes: [
      { billTitle: 'Student Loan (Access to Higher Education) Act, 2023', vote: 'YES', sessionDate: new Date('2023-04-12'), billStatus: 'PASSED' },
      { billTitle: 'Petroleum Industry Act, 2021', vote: 'YES', sessionDate: new Date('2021-07-01'), billStatus: 'PASSED' },
      { billTitle: 'Electoral Act (Amendment) Act, 2022', vote: 'YES', sessionDate: new Date('2022-02-24'), billStatus: 'PASSED' },
    ],
    social: [
      { platform: 'TWITTER', content: '@nwajiuba: ASUU strike is not the only way to fix Nigerian universities. Government must fund education properly OR let private capital in. Both/and, not either/or.', url: 'https://twitter.com/nwajiuba/status/1860001', publishedAt: new Date('2022-07-14'), sentiment: 'NEUTRAL', sentimentScore: 0.18, engagementTotal: 14200, likes: 8800, shares: 3400, comments: 2000, isByPolitician: true },
      { platform: 'FACEBOOK', content: 'Minister Nwajiuba\'s approach to the ASUU crisis showed genuine effort. He was in every meeting, trying to broker peace. ASUU were too rigid and so was the government.', url: 'https://facebook.com/post/nwajiuba001', publishedAt: new Date('2022-10-15'), sentiment: 'NEUTRAL', sentimentScore: 0.14, engagementTotal: 7200, likes: 4800, shares: 1600, comments: 800, isByPolitician: false },
      { platform: 'TWITTER', content: 'Did Nwajiuba really declare for President? He was a Minister of State! Nigeria\'s presidential race is a circus. Anyone can run now.', url: 'https://twitter.com/user/status/1870001', publishedAt: new Date('2023-01-12'), sentiment: 'NEGATIVE', sentimentScore: -0.38, engagementTotal: 18400, likes: 7200, shares: 8200, comments: 3000, isByPolitician: false },
      { platform: 'TWITTER', content: 'Whatever the verdict on his presidency bid, Nwajiuba did pass the groundwork for the Student Loan Act as Minister. The Act is law now. That counts.', url: 'https://twitter.com/user/status/1880001', publishedAt: new Date('2023-06-12'), sentiment: 'POSITIVE', sentimentScore: 0.52, engagementTotal: 6400, likes: 4200, shares: 1500, comments: 700, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.112, totalMentions: 18400, followerCount: 148000, engagementRate: 2.8 },
  })

  // ── 20. Kayode Fayemi ───────────────────────────────────────
  const fayemi = await prisma.politician.upsert({
    where: { slug: 'kayode-fayemi' }, update: {},
    create: {
      slug: 'kayode-fayemi', name: 'John Kayode Fayemi', partyId: apc.id,
      position: 'Former Governor of Ekiti State', chamber: null,
      constituency: 'Ekiti State', state: 'Ekiti', lga: 'Emure',
      dateOfBirth: new Date('1965-03-22'), gender: 'Male',
      education: 'BA History, University of Lagos; MA War Studies, King\'s College London; PhD, University of London',
      biography: 'Dr. John Kayode Fayemi served two non-consecutive terms as Governor of Ekiti State (2010–2014 and 2018–2022). A PhD holder from the University of London and former Director of the Centre for Democracy and Development, he is one of Nigeria\'s most academically distinguished politicians. He served as Minister of Mines & Steel Development (2015–2018) and chaired the Nigeria Governors Forum (2019–2022). He narrowly lost the APC presidential primary to Tinubu in 2023.',
      firstElected: 2010, currentTermStart: null, yearsInOffice: 8,
      billsSponsored: 0, attendanceRate: 0, isActive: true,
      photoUrl: 'https://assets.posint.ng/politicians/kayode-fayemi.jpg',
      sourceUrl: 'https://ekitistate.gov.ng/governor',
    },
  })
  await prisma.politicianContact.upsert({
    where: { politicianId: fayemi.id }, update: {},
    create: { politicianId: fayemi.id, email: 'info@fayemi.ng', website: 'https://fayemi.ng', twitterHandle: '@kfayemi', facebookUrl: 'https://facebook.com/jkfayemi', instagramHandle: '@kfayemi' },
  })
  await pol(fayemi.id, {
    career: [
      { year: 1997, title: 'Director, Centre for Democracy and Development (CDD)', description: 'Led influential African democracy think-tank from London', category: 'Civil Society' },
      { year: 2010, title: 'Governor of Ekiti State (1st term)', description: 'Elected governor under ACN; focused on education and public sector reforms', category: 'Executive' },
      { year: 2014, title: 'Lost Ekiti Governorship to Fayose (PDP)', description: 'Controversial defeat to Ayo Fayose; alleged military involvement in result', category: 'Election' },
      { year: 2015, title: 'Minister of Solid Minerals Development', description: 'Appointed by Buhari; led mining sector revival and geological survey', category: 'Executive' },
      { year: 2018, title: 'Governor of Ekiti State (2nd term)', description: 'Re-elected; implemented education voucher system and Agric programme', category: 'Executive' },
      { year: 2023, title: 'APC Presidential Bid', description: 'Contested APC presidential primary; lost narrowly to Bola Tinubu', category: 'Election' },
    ],
    committees: [],
    assets: [
      { category: 'Real Estate', description: 'Properties in Ado-Ekiti, Abuja, and overseas', estimatedValueKobo: 250_000_000_000n, yearDeclared: 2022, verified: false },
      { category: 'Bank Accounts', description: 'Accounts in various Nigerian and UK banks', estimatedValueKobo: 55_000_000_000n, yearDeclared: 2022, verified: false },
      { category: 'Investments', description: 'Consulting and intellectual property interests', estimatedValueKobo: 80_000_000_000n, yearDeclared: 2022, verified: false },
    ],
    projects: [
      { title: 'Ekiti Knowledge Zone (Special Economic Zone)', description: 'Development of 2,000-hectare special economic zone near Ado-Ekiti', location: 'Ado-Ekiti, Ekiti', budgetKobo: 20_000_000_000_000n, status: 'ONGOING', year: 2020, completionPct: 22, contractor: 'Ekiti State Investment Promotion Agency', sourceUrl: 'https://budgit.org/project/ekiti-knowledge-zone' },
      { title: 'Ekiti State Farmers Support Scheme', description: 'Input support, insurance, and market linkage for 80,000 smallholder farmers', location: 'Ekiti State', budgetKobo: 1_200_000_000_000n, status: 'COMPLETED', year: 2021, completionPct: 100, contractor: 'FADAMA III', sourceUrl: 'https://budgit.org/project/ekiti-farmers' },
    ],
    votes: [],
    social: [
      { platform: 'TWITTER', content: '@kfayemi: The challenge for Nigeria\'s next generation of leaders is to rebuild the social contract between the state and the citizen. We must put people first.', url: 'https://twitter.com/kfayemi/status/1870001', publishedAt: new Date('2023-08-20'), sentiment: 'POSITIVE', sentimentScore: 0.71, engagementTotal: 28400, likes: 19800, shares: 6400, comments: 2200, isByPolitician: true },
      { platform: 'TWITTER', content: 'Fayemi is the most intellectually qualified politician Nigeria has produced in decades. It is a shame he lost to Tinubu. A different Nigeria was possible.', url: 'https://twitter.com/user/status/1880001', publishedAt: new Date('2023-06-08'), sentiment: 'POSITIVE', sentimentScore: 0.74, engagementTotal: 42400, likes: 32400, shares: 8200, comments: 1800, isByPolitician: false },
      { platform: 'INSTAGRAM', content: 'Dr. Kayode Fayemi receiving an honorary degree — this former governor could have been a professor if he wanted. Nigeria needs more educated leadership! 🎓', url: 'https://instagram.com/p/fayemi001', publishedAt: new Date('2023-11-04'), sentiment: 'POSITIVE', sentimentScore: 0.78, engagementTotal: 14800, likes: 12400, shares: 1700, comments: 700, isByPolitician: false },
      { platform: 'TWITTER', content: 'Fayemi\'s Ekiti Knowledge Zone is a white elephant. ₦20 trillion promised. 22% after 4 years. What is happening?', url: 'https://twitter.com/user/status/1890001', publishedAt: new Date('2024-02-14'), sentiment: 'NEGATIVE', sentimentScore: -0.52, engagementTotal: 9800, likes: 4200, shares: 4100, comments: 1500, isByPolitician: false },
    ],
    stats: { overallSentiment: 0.482, totalMentions: 38400, followerCount: 680000, engagementRate: 4.4 },
  })
  console.log('✅  Politicians 16–20')

  // ═══════════════════════════════════════════════════════════
  // SPONSORED BILLS + READINGS
  // ═══════════════════════════════════════════════════════════
  console.log('Seeding bills…')

  async function upsertBill(where: { title: string; politicianId: string }, data: object) {
    const existing = await prisma.sponsoredBill.findFirst({ where })
    if (existing) return existing
    return prisma.sponsoredBill.create({ data: { ...where, ...data } as any })
  }

  const piaBill = await upsertBill(
    { title: 'Petroleum Industry Act, 2021', politicianId: akpabio.id },
    { summary: 'Restructures the Nigerian petroleum industry, establishes NUPRC and NMDPRA regulators, creates the Nigerian National Petroleum Company Limited (NNPCL), and reforms royalties, taxes, and host community development obligations.', status: 'PASSED', chamber: 'SENATE', dateIntroduced: new Date('2020-09-30'), datePassed: new Date('2021-07-01'), coSponsors: 42, fullTextUrl: 'https://nass.gov.ng/bills/pia-2021-full', sourceUrl: 'https://nass.gov.ng/bills/pia-2021' },
  )
  if (!(await prisma.billReading.count({ where: { billId: piaBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: piaBill.id, readingNumber: 1, date: new Date('2020-09-30'), outcome: 'Passed First Reading', sourceUrl: 'https://nass.gov.ng/bills/pia-2021' },
      { billId: piaBill.id, readingNumber: 2, date: new Date('2021-03-18'), outcome: 'Passed Second Reading; referred to Committee on Petroleum', votesFor: 98, votesAgainst: 4, votesAbstain: 2 },
      { billId: piaBill.id, readingNumber: 3, date: new Date('2021-07-01'), outcome: 'Passed Third Reading and enacted', votesFor: 87, votesAgainst: 12, votesAbstain: 3, sourceUrl: 'https://nass.gov.ng/bills/pia-2021' },
    ]})
  }

  const electoralBill = await upsertBill(
    { title: 'Electoral Act (Amendment) Act, 2022', politicianId: ekweremadu.id },
    { summary: 'Amended the Electoral Act to introduce electronic transmission of election results (IREV), updated party primaries, direct primaries option, and strengthened INEC independence.', status: 'PASSED', chamber: 'SENATE', dateIntroduced: new Date('2021-06-10'), datePassed: new Date('2022-02-24'), coSponsors: 38, fullTextUrl: 'https://nass.gov.ng/bills/electoral-act-2022-full', sourceUrl: 'https://nass.gov.ng/bills/electoral-act-2022' },
  )
  if (!(await prisma.billReading.count({ where: { billId: electoralBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: electoralBill.id, readingNumber: 1, date: new Date('2021-06-10'), outcome: 'Passed First Reading' },
      { billId: electoralBill.id, readingNumber: 2, date: new Date('2021-09-28'), outcome: 'Passed Second Reading; electronic transmission clause hotly debated', votesFor: 52, votesAgainst: 28, votesAbstain: 8 },
      { billId: electoralBill.id, readingNumber: 3, date: new Date('2022-02-24'), outcome: 'Passed Third Reading and signed by President', votesFor: 68, votesAgainst: 14, votesAbstain: 6, sourceUrl: 'https://nass.gov.ng/bills/electoral-act-2022' },
    ]})
  }

  const nhiaBill = await upsertBill(
    { title: 'National Health Insurance Authority Act, 2022', politicianId: ndume.id },
    { summary: 'Established the National Health Insurance Authority (NHIA) replacing the old NHIS, making health insurance mandatory for all Nigerians, streamlining benefit packages, and creating new enforcement powers.', status: 'PASSED', chamber: 'SENATE', dateIntroduced: new Date('2021-11-02'), datePassed: new Date('2022-05-17'), coSponsors: 31, fullTextUrl: 'https://nass.gov.ng/bills/nhia-2022-full', sourceUrl: 'https://nass.gov.ng/bills/nhia-2022' },
  )
  if (!(await prisma.billReading.count({ where: { billId: nhiaBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: nhiaBill.id, readingNumber: 1, date: new Date('2021-11-02'), outcome: 'Passed First Reading' },
      { billId: nhiaBill.id, readingNumber: 2, date: new Date('2022-02-10'), outcome: 'Passed Second Reading', votesFor: 88, votesAgainst: 2, votesAbstain: 5 },
      { billId: nhiaBill.id, readingNumber: 3, date: new Date('2022-05-17'), outcome: 'Passed and assented to by President Buhari', votesFor: 92, votesAgainst: 0, votesAbstain: 2, sourceUrl: 'https://nass.gov.ng/bills/nhia-2022' },
    ]})
  }

  const studentLoanBill = await upsertBill(
    { title: 'Student Loan (Access to Higher Education) Act, 2023', politicianId: abbas.id },
    { summary: 'Established the Nigerian Education Loan Fund (NELFUND) to provide interest-free loans to Nigerian students for tuition and upkeep; repealed earlier education loan Act.', status: 'PASSED', chamber: 'HOUSE_OF_REPRESENTATIVES', dateIntroduced: new Date('2023-03-01'), datePassed: new Date('2023-06-12'), coSponsors: 55, fullTextUrl: 'https://nass.gov.ng/bills/studentloan-2023-full', sourceUrl: 'https://nass.gov.ng/bills/studentloan-2023' },
  )
  if (!(await prisma.billReading.count({ where: { billId: studentLoanBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: studentLoanBill.id, readingNumber: 1, date: new Date('2023-03-01'), outcome: 'Passed First Reading in the House' },
      { billId: studentLoanBill.id, readingNumber: 2, date: new Date('2023-04-12'), outcome: 'Passed Second Reading', votesFor: 280, votesAgainst: 5, votesAbstain: 15 },
      { billId: studentLoanBill.id, readingNumber: 3, date: new Date('2023-06-12'), outcome: 'Passed Third Reading; signed into law June 2023', votesFor: 312, votesAgainst: 2, votesAbstain: 6, sourceUrl: 'https://nass.gov.ng/bills/studentloan-2023' },
    ]})
  }

  const socialMediaBill = await upsertBill(
    { title: 'Social Media (Prohibition of Falsehood) Bill, 2019', politicianId: remiTinubu.id },
    { summary: 'Sought to criminalise sharing of "false statements" on social media with penalties of up to ₦300,000 or 3 years imprisonment. Widely condemned by civil society as anti-free speech; rejected at Third Reading.', status: 'REJECTED', chamber: 'SENATE', dateIntroduced: new Date('2019-10-08'), coSponsors: 6, sourceUrl: 'https://nass.gov.ng/bills/socialmedia-2019' },
  )
  if (!(await prisma.billReading.count({ where: { billId: socialMediaBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: socialMediaBill.id, readingNumber: 1, date: new Date('2019-10-08'), outcome: 'Passed First Reading' },
      { billId: socialMediaBill.id, readingNumber: 2, date: new Date('2019-11-05'), outcome: 'Narrowly passed Second Reading amid protests; referred to committee', votesFor: 45, votesAgainst: 38, votesAbstain: 9 },
      { billId: socialMediaBill.id, readingNumber: 3, date: new Date('2020-01-28'), outcome: 'Rejected at Third Reading following mass public opposition', votesFor: 24, votesAgainst: 58, votesAbstain: 14, sourceUrl: 'https://nass.gov.ng/bills/socialmedia-2019' },
    ]})
  }

  const genderBill = await upsertBill(
    { title: 'Gender and Equal Opportunities Bill', politicianId: remiTinubu.id },
    { summary: 'Seeks to eliminate discrimination against women in all spheres of Nigerian public and private life, implement CEDAW obligations, and establish an Equal Opportunities Commission.', status: 'SECOND_READING', chamber: 'SENATE', dateIntroduced: new Date('2021-03-08'), coSponsors: 18, sourceUrl: 'https://nass.gov.ng/bills/gender-bill' },
  )
  if (!(await prisma.billReading.count({ where: { billId: genderBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: genderBill.id, readingNumber: 1, date: new Date('2021-03-08'), outcome: 'Passed First Reading' },
      { billId: genderBill.id, readingNumber: 2, date: new Date('2021-06-15'), outcome: 'Second Reading debated; religious objections raised; referred to Committee on Women Affairs', votesFor: 44, votesAgainst: 36, votesAbstain: 12 },
    ]})
  }

  const antiCorruptionBill = await upsertBill(
    { title: 'Anti-Corruption and Financial Crimes Commission Bill, 2024', politicianId: akpabio.id },
    { summary: 'Proposes to merge EFCC and ICPC into a single Anti-Corruption and Financial Crimes Commission; clarifies jurisdiction, asset recovery procedures, and witness protection provisions.', status: 'FIRST_READING', chamber: 'SENATE', dateIntroduced: new Date('2024-02-06'), coSponsors: 8, sourceUrl: 'https://nass.gov.ng/bills/anti-corruption-2024' },
  )
  if (!(await prisma.billReading.count({ where: { billId: antiCorruptionBill.id } }))) {
    await prisma.billReading.create({ data: { billId: antiCorruptionBill.id, readingNumber: 1, date: new Date('2024-02-06'), outcome: 'Passed First Reading; referred to Committee' } })
  }

  const lgAutonomyBill = await upsertBill(
    { title: 'Local Government Autonomy (Constitution Amendment) Bill, 2024', politicianId: ndume.id },
    { summary: 'Amends the 1999 Constitution to grant financial and administrative autonomy to the 774 local government areas, abolish state joint accounts, and mandate direct allocation from FAAC to LGAs.', status: 'THIRD_READING', chamber: 'SENATE', dateIntroduced: new Date('2023-11-14'), coSponsors: 62, sourceUrl: 'https://nass.gov.ng/bills/lg-autonomy-2024' },
  )
  if (!(await prisma.billReading.count({ where: { billId: lgAutonomyBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: lgAutonomyBill.id, readingNumber: 1, date: new Date('2023-11-14'), outcome: 'Passed First Reading' },
      { billId: lgAutonomyBill.id, readingNumber: 2, date: new Date('2024-01-30'), outcome: 'Passed Second Reading; wide support from both chambers', votesFor: 88, votesAgainst: 6, votesAbstain: 4 },
      { billId: lgAutonomyBill.id, readingNumber: 3, date: new Date('2024-03-26'), outcome: 'Passed Third Reading; Supreme Court earlier ordered implementation', votesFor: 94, votesAgainst: 0, votesAbstain: 2, sourceUrl: 'https://nass.gov.ng/bills/lg-autonomy-2024' },
    ]})
  }

  const minWageBill = await upsertBill(
    { title: 'Minimum Wage (Amendment) Act, 2024', politicianId: adeola.id },
    { summary: 'Raised the national minimum wage from ₦30,000 to ₦70,000 per month following tripartite negotiations between government, employers, and NLC/TUC trade unions.', status: 'PASSED', chamber: 'SENATE', dateIntroduced: new Date('2024-06-18'), datePassed: new Date('2024-07-28'), coSponsors: 40, fullTextUrl: 'https://nass.gov.ng/bills/minwage-2024-full', sourceUrl: 'https://nass.gov.ng/bills/minwage-2024' },
  )
  if (!(await prisma.billReading.count({ where: { billId: minWageBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: minWageBill.id, readingNumber: 1, date: new Date('2024-06-18'), outcome: 'Passed First Reading' },
      { billId: minWageBill.id, readingNumber: 2, date: new Date('2024-07-02'), outcome: 'Passed Second Reading amid NLC strike threat', votesFor: 95, votesAgainst: 1, votesAbstain: 1 },
      { billId: minWageBill.id, readingNumber: 3, date: new Date('2024-07-11'), outcome: 'Passed unanimously; signed by President Tinubu July 28', votesFor: 96, votesAgainst: 0, votesAbstain: 0, sourceUrl: 'https://nass.gov.ng/bills/minwage-2024' },
    ]})
  }

  const taxReformBill = await upsertBill(
    { title: 'Tax Reform Bill (Joint Revenue Board Establishment) Act, 2024', politicianId: abbas.id },
    { summary: 'One of four Tax Reform Bills 2024; establishes a Joint Revenue Board of Nigeria to coordinate federal, state, and LGA tax administration and reduce multiple taxation.', status: 'THIRD_READING', chamber: 'HOUSE_OF_REPRESENTATIVES', dateIntroduced: new Date('2024-09-03'), coSponsors: 88, sourceUrl: 'https://nass.gov.ng/bills/tax-reform-2024' },
  )
  if (!(await prisma.billReading.count({ where: { billId: taxReformBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: taxReformBill.id, readingNumber: 1, date: new Date('2024-09-03'), outcome: 'Passed First Reading in the House' },
      { billId: taxReformBill.id, readingNumber: 2, date: new Date('2024-10-03'), outcome: 'Second Reading; controversial — northern governors opposed derivation formula changes', votesFor: 182, votesAgainst: 88, votesAbstain: 30 },
    ]})
  }

  const seniorCitizensBill = await upsertBill(
    { title: 'National Senior Citizens Centre Act, 2022', politicianId: nedNwoko.id },
    { summary: 'Established the National Senior Citizens Centre to develop policies and programmes for the welfare, social security, and dignified ageing of Nigerians aged 60 and above.', status: 'PASSED', chamber: 'SENATE', dateIntroduced: new Date('2021-09-14'), datePassed: new Date('2022-08-30'), coSponsors: 22, fullTextUrl: 'https://nass.gov.ng/bills/seniorcitizens-2022-full', sourceUrl: 'https://nass.gov.ng/bills/seniorcitizens-2022' },
  )
  if (!(await prisma.billReading.count({ where: { billId: seniorCitizensBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: seniorCitizensBill.id, readingNumber: 1, date: new Date('2021-09-14'), outcome: 'Passed First Reading' },
      { billId: seniorCitizensBill.id, readingNumber: 2, date: new Date('2022-04-26'), outcome: 'Passed Second Reading', votesFor: 90, votesAgainst: 0, votesAbstain: 4 },
      { billId: seniorCitizensBill.id, readingNumber: 3, date: new Date('2022-08-30'), outcome: 'Passed and signed into law by President Buhari', votesFor: 92, votesAgainst: 0, votesAbstain: 2, sourceUrl: 'https://nass.gov.ng/bills/seniorcitizens-2022' },
    ]})
  }

  const disabilityBill = await upsertBill(
    { title: 'Disability Rights Commission Bill, 2020', politicianId: ekweremadu.id },
    { summary: 'Proposes to establish a National Disability Rights Commission to enforce the Discrimination Against Persons with Disabilities (Prohibition) Act 2018 and coordinate disability rights in Nigeria.', status: 'SECOND_READING', chamber: 'SENATE', dateIntroduced: new Date('2020-07-14'), coSponsors: 14, sourceUrl: 'https://nass.gov.ng/bills/disability-rights-2020' },
  )
  if (!(await prisma.billReading.count({ where: { billId: disabilityBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: disabilityBill.id, readingNumber: 1, date: new Date('2020-07-14'), outcome: 'Passed First Reading' },
      { billId: disabilityBill.id, readingNumber: 2, date: new Date('2020-09-30'), outcome: 'Second Reading passed; referred to Committee on Disability Matters', votesFor: 78, votesAgainst: 4, votesAbstain: 8 },
    ]})
  }

  const broadcastingBill = await upsertBill(
    { title: 'Broadcasting Commission Amendment Bill, 2024', politicianId: melaye.id },
    { summary: 'Proposes amendments to the National Broadcasting Commission Act to extend NBC licensing powers to online streaming platforms and social media broadcasters with over 100,000 followers.', status: 'FIRST_READING', chamber: 'SENATE', dateIntroduced: new Date('2024-03-05'), coSponsors: 5, sourceUrl: 'https://nass.gov.ng/bills/broadcasting-2024' },
  )
  if (!(await prisma.billReading.count({ where: { billId: broadcastingBill.id } }))) {
    await prisma.billReading.create({ data: { billId: broadcastingBill.id, readingNumber: 1, date: new Date('2024-03-05'), outcome: 'Passed First Reading; attracted civil society criticism' } })
  }

  const policeReformBill = await upsertBill(
    { title: 'Police Reform Bill, 2024', politicianId: ndume.id },
    { summary: 'Seeks to restructure the Nigeria Police Force through decentralisation, establish state police, improve welfare conditions, create an independent police complaints commission, and mandate body cameras.', status: 'THIRD_READING', chamber: 'SENATE', dateIntroduced: new Date('2024-01-23'), coSponsors: 58, sourceUrl: 'https://nass.gov.ng/bills/police-reform-2024' },
  )
  if (!(await prisma.billReading.count({ where: { billId: policeReformBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: policeReformBill.id, readingNumber: 1, date: new Date('2024-01-23'), outcome: 'Passed First Reading' },
      { billId: policeReformBill.id, readingNumber: 2, date: new Date('2024-04-09'), outcome: 'Second Reading; state police clause contentious among northern senators', votesFor: 64, votesAgainst: 24, votesAbstain: 10 },
      { billId: policeReformBill.id, readingNumber: 3, date: new Date('2024-06-12'), outcome: 'Third Reading passed; awaiting presidential assent', votesFor: 78, votesAgainst: 14, votesAbstain: 6, sourceUrl: 'https://nass.gov.ng/bills/police-reform-2024' },
    ]})
  }

  const camaBill = await upsertBill(
    { title: 'Companies and Allied Matters Act (Amendment), 2020', politicianId: kalu.id },
    { summary: 'Landmark amendment to CAMA 2004; introduced small company simplified governance, reduced filing burdens, allowed single-member companies, modernised insolvency and merger frameworks, and enabled digital AGMs.', status: 'PASSED', chamber: 'SENATE', dateIntroduced: new Date('2020-03-12'), datePassed: new Date('2020-08-07'), coSponsors: 28, fullTextUrl: 'https://nass.gov.ng/bills/cama-2020-full', sourceUrl: 'https://nass.gov.ng/bills/cama-2020' },
  )
  if (!(await prisma.billReading.count({ where: { billId: camaBill.id } }))) {
    await prisma.billReading.createMany({ data: [
      { billId: camaBill.id, readingNumber: 1, date: new Date('2020-03-12'), outcome: 'Passed First Reading' },
      { billId: camaBill.id, readingNumber: 2, date: new Date('2020-06-09'), outcome: 'Second Reading passed; welcomed by business community', votesFor: 94, votesAgainst: 0, votesAbstain: 2 },
      { billId: camaBill.id, readingNumber: 3, date: new Date('2020-08-06'), outcome: 'Passed Third Reading; signed by President Buhari August 2020', votesFor: 96, votesAgainst: 0, votesAbstain: 0, sourceUrl: 'https://nass.gov.ng/bills/cama-2020' },
    ]})
  }
  console.log('✅  Sponsored bills + readings')

  // ═══════════════════════════════════════════════════════════
  // ELECTIONS (10)
  // ═══════════════════════════════════════════════════════════
  console.log('Seeding elections…')

  const elections = [
    { id: 'e0000000-0001-0000-0000-000000000001', year: 2023, type: 'Presidential', level: 'FEDERAL' as const, winnerName: 'Bola Ahmed Tinubu', winnerPartyId: apc.id, winnerVotes: 8794726, totalVotes: 24919613, registeredVoters: 93469008, turnoutPct: 26.72, margin: '1,810,206', declaredDate: new Date('2023-03-01'), sourceUrl: 'https://www.inecnigeria.org/2023-presidential', candidates: [{ name: 'Bola Tinubu', partyId: apc.id, votes: 8794726, pos: 1 }, { name: 'Atiku Abubakar', partyId: pdp.id, votes: 6984520, pos: 2 }, { name: 'Peter Gregory Obi', partyId: lp.id, votes: 6101533, pos: 3 }, { name: 'Rabiu Musa Kwankwaso', partyId: nnpp.id, votes: 1496687, pos: 4 }] },
    { id: 'e0000000-0001-0000-0000-000000000002', year: 2019, type: 'Presidential', level: 'FEDERAL' as const, winnerName: 'Muhammadu Buhari', winnerPartyId: apc.id, winnerVotes: 15191847, totalVotes: 28614190, registeredVoters: 84004084, turnoutPct: 34.07, margin: '3,928,869', declaredDate: new Date('2019-02-27'), sourceUrl: 'https://www.inecnigeria.org/2019-presidential', candidates: [{ name: 'Muhammadu Buhari', partyId: apc.id, votes: 15191847, pos: 1 }, { name: 'Atiku Abubakar', partyId: pdp.id, votes: 11255978, pos: 2 }] },
    { id: 'e0000000-0001-0000-0000-000000000003', year: 2015, type: 'Presidential', level: 'FEDERAL' as const, winnerName: 'Muhammadu Buhari', winnerPartyId: apc.id, winnerVotes: 15424921, totalVotes: 29432083, registeredVoters: 68833476, turnoutPct: 42.77, margin: '2,571,759', declaredDate: new Date('2015-03-31'), sourceUrl: 'https://www.inecnigeria.org/2015-presidential', candidates: [{ name: 'Muhammadu Buhari', partyId: apc.id, votes: 15424921, pos: 1 }, { name: 'Goodluck Jonathan', partyId: pdp.id, votes: 12853162, pos: 2 }] },
    { id: 'e0000000-0001-0000-0000-000000000004', year: 2011, type: 'Presidential', level: 'FEDERAL' as const, winnerName: 'Goodluck Ebele Jonathan', winnerPartyId: pdp.id, winnerVotes: 22495187, totalVotes: 39469484, registeredVoters: 73528040, turnoutPct: 53.68, margin: '10,280,334', declaredDate: new Date('2011-04-19'), sourceUrl: 'https://www.inecnigeria.org/2011-presidential', candidates: [{ name: 'Goodluck Jonathan', partyId: pdp.id, votes: 22495187, pos: 1 }, { name: 'Muhammadu Buhari (CPC)', partyId: apc.id, votes: 12214853, pos: 2 }] },
    { id: 'e0000000-0001-0000-0000-000000000005', year: 2023, type: 'Gubernatorial', level: 'STATE' as const, state: 'Lagos', winnerName: 'Babajide Sanwo-Olu', winnerPartyId: apc.id, winnerVotes: 762134, totalVotes: 1365471, registeredVoters: 7060195, turnoutPct: 19.34, margin: '179,680', declaredDate: new Date('2023-03-18'), sourceUrl: 'https://www.inecnigeria.org/2023-lagos-gov', candidates: [{ name: 'Babajide Sanwo-Olu', partyId: apc.id, votes: 762134, pos: 1 }, { name: 'Gbadebo Rhodes-Vivour', partyId: lp.id, votes: 582454, pos: 2 }, { name: 'Abdul-Azeez Adediran (Jandor)', partyId: pdp.id, votes: 74481, pos: 3 }] },
    { id: 'e0000000-0001-0000-0000-000000000006', year: 2023, type: 'Gubernatorial', level: 'STATE' as const, state: 'Rivers', winnerName: 'Sim Fubara', winnerPartyId: pdp.id, winnerVotes: 175071, totalVotes: 267990, registeredVoters: 2971483, turnoutPct: 9.02, margin: '108,757', declaredDate: new Date('2023-03-18'), sourceUrl: 'https://www.inecnigeria.org/2023-rivers-gov', candidates: [{ name: 'Sim Fubara', partyId: pdp.id, votes: 175071, pos: 1 }, { name: 'Tonye Cole', partyId: apc.id, votes: 66314, pos: 2 }] },
    { id: 'e0000000-0001-0000-0000-000000000007', year: 2023, type: 'Gubernatorial', level: 'STATE' as const, state: 'Kano', winnerName: 'Abba Kabir Yusuf', winnerPartyId: nnpp.id, winnerVotes: 532893, totalVotes: 1098898, registeredVoters: 5948737, turnoutPct: 18.47, margin: '56,678', declaredDate: new Date('2023-03-18'), sourceUrl: 'https://www.inecnigeria.org/2023-kano-gov', candidates: [{ name: 'Abba Kabir Yusuf', partyId: nnpp.id, votes: 532893, pos: 1 }, { name: 'Nasiru Yusuf Gawuna', partyId: apc.id, votes: 476215, pos: 2 }, { name: 'Sadiq Wali', partyId: pdp.id, votes: 66652, pos: 3 }] },
    { id: 'e0000000-0001-0000-0000-000000000008', year: 2023, type: 'Gubernatorial', level: 'STATE' as const, state: 'Enugu', winnerName: 'Peter Mbah', winnerPartyId: pdp.id, winnerVotes: 153482, totalVotes: 303234, registeredVoters: 2108519, turnoutPct: 14.38, margin: '7,927', declaredDate: new Date('2023-03-18'), sourceUrl: 'https://www.inecnigeria.org/2023-enugu-gov', candidates: [{ name: 'Peter Mbah', partyId: pdp.id, votes: 153482, pos: 1 }, { name: 'Chijioke Edeoga', partyId: lp.id, votes: 145555, pos: 2 }] },
    { id: 'e0000000-0001-0000-0000-000000000009', year: 2019, type: 'Gubernatorial', level: 'STATE' as const, state: 'Lagos', winnerName: 'Babajide Sanwo-Olu', winnerPartyId: apc.id, winnerVotes: 739445, totalVotes: 973394, registeredVoters: 6569080, turnoutPct: 14.82, margin: '533,304', declaredDate: new Date('2019-03-09'), sourceUrl: 'https://www.inecnigeria.org/2019-lagos-gov', candidates: [{ name: 'Babajide Sanwo-Olu', partyId: apc.id, votes: 739445, pos: 1 }, { name: 'Jimi Agbaje', partyId: pdp.id, votes: 206141, pos: 2 }] },
    { id: 'e0000000-0001-0000-0000-000000000010', year: 2023, type: 'Gubernatorial', level: 'STATE' as const, state: 'Oyo', winnerName: 'Seyi Makinde', winnerPartyId: pdp.id, winnerVotes: 564280, totalVotes: 941498, registeredVoters: 3249662, turnoutPct: 28.97, margin: '204,530', declaredDate: new Date('2023-03-18'), sourceUrl: 'https://www.inecnigeria.org/2023-oyo-gov', candidates: [{ name: 'Seyi Makinde', partyId: pdp.id, votes: 564280, pos: 1 }, { name: 'Teslim Folarin', partyId: apc.id, votes: 359750, pos: 2 }, { name: 'Adebo Ogundoyin', partyId: nnpp.id, votes: 14982, pos: 3 }] },
  ]

  for (const e of elections) {
    const { candidates, ...eData } = e
    await prisma.election.upsert({ where: { id: e.id }, update: {}, create: eData as any })
    if (!(await prisma.electionCandidate.count({ where: { electionId: e.id } }))) {
      await prisma.electionCandidate.createMany({
        data: candidates.map(c => ({ electionId: e.id, candidateName: c.name, partyId: c.partyId, votes: c.votes, position: c.pos })),
      })
    }
  }
  console.log('✅  Elections + candidates')

  // ═══════════════════════════════════════════════════════════
  // CORRUPTION CASES (12)
  // ═══════════════════════════════════════════════════════════
  console.log('Seeding corruption cases…')

  async function upsertCase(caseNumber: string, data: object) {
    const existing = await prisma.corruptionCase.findFirst({ where: { caseNumber } })
    if (existing) return existing
    return prisma.corruptionCase.create({ data: { caseNumber, ...data } as any })
  }

  await upsertCase('EFCC/ABJ/CR/01/2007', {
    politicianId: kalu.id,
    politicianName: 'Orji Uzor Kalu',
    agency: 'EFCC',
    charges: 'Fraud, money laundering, and criminal diversion of Abia State Government funds totalling ₦7.65 billion',
    amountInvolvedKobo: 765_000_000_000n,
    amountRecoveredKobo: 0n,
    status: 'ACQUITTED',
    court: 'Federal High Court, Lagos; Supreme Court of Nigeria',
    judge: 'Mohammed Idris (FHC); Supreme Court panel led by Justice Tanko Muhammad',
    filingDate: new Date('2007-09-15'),
    verdictDate: new Date('2020-05-08'),
    sentence: 'None — Supreme Court vacated conviction on grounds trial judge lacked jurisdiction',
    description: 'EFCC filed N7.65 billion fraud charges against Kalu in 2007. He was convicted by Justice Mohammed Idris at the Federal High Court Lagos in December 2019 and sentenced to 12 years imprisonment. However, the Supreme Court of Nigeria in May 2020 vacated the conviction, holding that Justice Idris had already been elevated to the Court of Appeal at the time he delivered the verdict and therefore lacked jurisdiction. The case was returned to the Federal High Court for retrial.',
    sourceUrl: 'https://efcc.gov.ng/news/orji-uzor-kalu-case',
    isActive: false,
  })

  await upsertCase('EFCC/ABJ/CR/055/2004', {
    politicianName: 'Joshua Dariye',
    agency: 'EFCC',
    charges: 'Money laundering — diversion of Plateau State Government ecological funds',
    amountInvolvedKobo: 116_000_000_000n,
    amountRecoveredKobo: 12_000_000_000n,
    status: 'CONVICTED',
    court: 'High Court of the Federal Capital Territory, Abuja',
    judge: 'Justice Adebukola Banjoko',
    filingDate: new Date('2004-12-18'),
    verdictDate: new Date('2018-05-09'),
    sentence: '14 years imprisonment, later reduced to 10 years by Court of Appeal; pardoned by President Buhari in 2022',
    description: 'Former Plateau State Governor Joshua Dariye was arrested in London in 2004 while holding ₦1.16 billion in ecological funds diverted from the state. He was charged by the EFCC in Nigeria, convicted in 2018, and sentenced to 14 years which was reduced to 10 years on appeal. He was pardoned by President Buhari in April 2022 alongside former Taraba State Governor Jolly Nyame.',
    sourceUrl: 'https://efcc.gov.ng/news/joshua-dariye-conviction',
    isActive: false,
  })

  await upsertCase('EFCC/ABJ/CR/044/2007', {
    politicianName: 'Jolly Nyame',
    agency: 'EFCC',
    charges: 'Money laundering, obtaining property by false pretence, and criminal breach of trust totalling ₦1.64 billion',
    amountInvolvedKobo: 164_000_000_000n,
    amountRecoveredKobo: 25_000_000_000n,
    status: 'CONVICTED',
    court: 'High Court of the Federal Capital Territory, Abuja',
    judge: 'Justice Adebukola Banjoko',
    filingDate: new Date('2007-08-24'),
    verdictDate: new Date('2018-05-30'),
    sentence: '12 years imprisonment; pardoned by President Buhari in April 2022',
    description: 'Former Taraba State Governor Jolly Nyame was charged with diverting ₦1.64 billion in state funds. Convicted in 2018 and sentenced to 12 years, he was later pardoned by President Buhari in April 2022, the same pardon that freed Joshua Dariye.',
    sourceUrl: 'https://efcc.gov.ng/news/jolly-nyame-conviction',
    isActive: false,
  })

  await upsertCase('EFCC/ABJ/CR/011/2010', {
    politicianName: 'James Onanefe Ibori',
    agency: 'EFCC',
    charges: 'Fraud, conspiracy, money laundering totalling approximately $35 million; funds siphoned from Delta State Government',
    amountInvolvedKobo: 14_000_000_000_000n,
    amountRecoveredKobo: 4_800_000_000_000n,
    status: 'CONVICTED',
    court: 'Southwark Crown Court, London (UK prosecution)',
    judge: 'Judge Christopher Hardy (UK); various Nigerian judges for related proceedings',
    filingDate: new Date('2010-02-04'),
    verdictDate: new Date('2012-04-17'),
    sentence: '13 years imprisonment in UK; UK Supreme Court later ordered confiscation of $35 million in assets',
    description: 'Former Delta State Governor James Ibori pleaded guilty to 10 counts of fraud and money laundering at Southwark Crown Court, London in April 2012. The UK Metropolitan Police and EFCC cooperation led to his extradition from Dubai in 2011. The $35 million included siphoned state funds and personal enrichment through kickbacks on Delta State contracts.',
    sourceUrl: 'https://efcc.gov.ng/news/james-ibori-uk-conviction',
    isActive: false,
  })

  await upsertCase('EFCC/NFIU/001/2015', {
    politicianName: 'Diezani Alison-Madueke',
    agency: 'NFIU',
    charges: 'Oil theft, bribery of INEC officials with $115 million, money laundering; estimated theft of crude oil and cash totalling approximately ₦2.5 trillion',
    amountInvolvedKobo: 250_000_000_000_000n,
    amountRecoveredKobo: 8_000_000_000_000n,
    status: 'UNDER_INVESTIGATION',
    court: 'Federal High Court, Lagos (multiple charges pending)',
    filingDate: new Date('2015-10-13'),
    description: 'Former Petroleum Minister Diezani Alison-Madueke is facing a sprawling EFCC/NFIU investigation. She was arrested by UK\'s National Crime Agency in 2015. Key charges include directing $115 million to bribe INEC officials before the 2015 election, and overseeing the theft of oil proceeds during her tenure (2010–2015). She has lived in the UK as the Nigerian government pursues extradition.',
    sourceUrl: 'https://efcc.gov.ng/news/diezani-investigation',
    isActive: true,
  })

  await upsertCase('EFCC/ABJ/CR/047/2010', {
    politicianId: ekweremadu.id,
    politicianName: 'Ike Ekweremadu',
    agency: 'EFCC',
    charges: 'Human trafficking and conspiracy to arrange travel for kidney harvesting (UK charges); separate EFCC property investigations in Nigeria',
    amountInvolvedKobo: 0n,
    amountRecoveredKobo: 0n,
    status: 'CONVICTED',
    court: 'Southwark Crown Court, London (UK); EFCC proceeding ongoing in Nigeria',
    judge: 'Judge Sarah Munro (UK)',
    filingDate: new Date('2022-07-05'),
    verdictDate: new Date('2023-05-05'),
    sentence: 'Ekweremadu sentenced to 9 years 8 months; wife Beatrice to 4 years 6 months by Southwark Crown Court; both reduced on appeal',
    description: 'Senator Ike Ekweremadu and his wife Beatrice were arrested at Heathrow Airport in June 2022 and charged by UK police with conspiring to arrange travel of a young Nigerian man to the UK for kidney harvesting. Their daughter Sonia had kidney disease. The victim testified he was lured from Nigeria with false promises of work. Both were convicted in May 2023.',
    sourceUrl: 'https://premiumtimesng.com/news/ekweremadu-conviction',
    isActive: false,
  })

  await upsertCase('EFCC/ABJ/CR/012/2016', {
    politicianName: 'Raymond Dokpesi',
    agency: 'EFCC',
    charges: 'Money laundering — allegedly received ₦2.1 billion from the Office of the NSA for political advertising on DAAR Communications during 2015 election campaign',
    amountInvolvedKobo: 210_000_000_000n,
    amountRecoveredKobo: 0n,
    status: 'DISMISSED',
    court: 'Federal High Court, Abuja',
    judge: 'Justice Nnamdi Dimgba',
    filingDate: new Date('2016-05-12'),
    verdictDate: new Date('2020-09-25'),
    sentence: 'None — charges dismissed',
    description: 'Former DAAR Communications chairman Raymond Dokpesi was charged with receiving ₦2.1 billion as part of the arms procurement scandal money funnelled through the Office of the NSA Sambo Dasuki. The Federal High Court dismissed the charges in September 2020, finding insufficient evidence to sustain conviction.',
    sourceUrl: 'https://efcc.gov.ng/news/raymond-dokpesi-case',
    isActive: false,
  })

  await upsertCase('NFIU/DSS/ABJ/0012/2015', {
    politicianName: 'Sambo Dasuki',
    agency: 'NFIU',
    charges: 'Unlawful possession of firearms; criminal breach of trust; diversion of $2.1 billion (₦712 billion) arms procurement funds — the "Arms Deal Scandal"',
    amountInvolvedKobo: 71_200_000_000_000n,
    amountRecoveredKobo: 4_200_000_000_000n,
    status: 'ONGOING',
    court: 'Various Federal High Courts, Abuja',
    judge: 'Justice Ahmed Mohammed and others',
    filingDate: new Date('2015-12-18'),
    description: 'Former NSA Sambo Dasuki was arrested in December 2015 and charged with overseeing the diversion of $2.1 billion allocated for the purchase of military equipment to fight Boko Haram. The funds were allegedly disbursed to PDP politicians, businessmen, and operatives instead. Despite multiple court orders for his release on bail pending trial, he was held by DSS until December 2019. Trial ongoing.',
    sourceUrl: 'https://efcc.gov.ng/news/sambo-dasuki-case',
    isActive: true,
  })

  await upsertCase('EFCC/ABJ/CR/037/2016', {
    politicianName: 'Olisa Metuh',
    agency: 'EFCC',
    charges: 'Money laundering — received ₦400 million from the Office of the NSA allegedly for propaganda activities during 2015 elections',
    amountInvolvedKobo: 40_000_000_000n,
    amountRecoveredKobo: 40_000_000_000n,
    status: 'CONVICTED',
    court: 'Federal High Court, Abuja',
    judge: 'Justice Okon Abang',
    filingDate: new Date('2016-01-22'),
    verdictDate: new Date('2020-02-25'),
    sentence: '7 years imprisonment; ₦400 million forfeited; conviction upheld on appeal',
    description: 'Former PDP National Publicity Secretary Olisa Metuh was convicted of receiving ₦400 million from the ONSA account through a company, Destra Investments, for the purpose of propaganda during the 2015 general elections. He was convicted and sentenced to 7 years imprisonment with ₦400 million forfeiture order.',
    sourceUrl: 'https://efcc.gov.ng/news/olisa-metuh-conviction',
    isActive: false,
  })

  await upsertCase('EFCC/ABJ/CR/022/2014', {
    politicianName: 'Bello Haliru Mohammed',
    agency: 'EFCC',
    charges: 'Fraud and criminal misappropriation of ₦250 million in federal contracts',
    amountInvolvedKobo: 25_000_000_000n,
    amountRecoveredKobo: 10_000_000_000n,
    status: 'CONVICTED',
    court: 'Federal High Court, Abuja',
    judge: 'Justice Gabriel Kolawole',
    filingDate: new Date('2014-03-17'),
    verdictDate: new Date('2019-07-12'),
    sentence: '5 years imprisonment without option of fine',
    description: 'Former Minister of State for Agriculture Bello Haliru Mohammed was convicted by the Federal High Court for fraudulently diverting ₦250 million in government funds through inflated contract awards. He was sentenced to 5 years without option of fine.',
    sourceUrl: 'https://efcc.gov.ng/news/bello-haliru-conviction',
    isActive: false,
  })

  await upsertCase('EFCC/ABJ/CR/019/2016', {
    politicianName: 'Femi Fani-Kayode',
    agency: 'EFCC',
    charges: 'Money laundering — allegedly received ₦26 million from the ONSA through Destra Investments; false declaration of assets',
    amountInvolvedKobo: 2_600_000_000n,
    amountRecoveredKobo: 0n,
    status: 'ACQUITTED',
    court: 'Federal High Court, Lagos',
    judge: 'Justice Chukwujekwu Aneke',
    filingDate: new Date('2016-09-28'),
    verdictDate: new Date('2023-11-08'),
    sentence: 'None — fully acquitted',
    description: 'Former Aviation Minister Femi Fani-Kayode was charged with receiving ₦26 million from the ONSA scandal funds. After a protracted 7-year trial, he was fully acquitted by the Federal High Court in November 2023. The court found that the prosecution failed to prove its case beyond reasonable doubt.',
    sourceUrl: 'https://efcc.gov.ng/news/fani-kayode-acquittal',
    isActive: false,
  })

  await upsertCase('ICPC/ABJ/HR/001/2023', {
    politicianId: wike.id,
    politicianName: 'Nyesom Wike',
    agency: 'ICPC',
    charges: 'Alleged misappropriation of Rivers State government funds; diversion of security votes; procurement irregularities in Rivers State public works contracts 2015–2023',
    amountInvolvedKobo: 84_000_000_000_000n,
    amountRecoveredKobo: 0n,
    status: 'UNDER_INVESTIGATION',
    court: 'ICPC preliminary inquiry',
    filingDate: new Date('2023-09-14'),
    description: 'The ICPC opened preliminary inquiries into alleged misappropriation of funds during Wike\'s tenure as Rivers State Governor (2015–2023). Allegations include diversion of security votes, irregular procurement in public infrastructure contracts, and undisclosed overseas property. Wike has denied all allegations, characterising them as politically motivated.',
    sourceUrl: 'https://icpc.gov.ng/news/wike-investigation',
    isActive: true,
  })
  console.log('✅  Corruption cases')

  // ═══════════════════════════════════════════════════════════
  // PARTY DEFECTIONS
  // ═══════════════════════════════════════════════════════════
  console.log('Seeding party defections…')

  async function upsertDefection(politicianId: string, fromId: string | null, toId: string | null, date: Date, reason: string, sourceUrl?: string) {
    const existing = await prisma.partyDefection.findFirst({ where: { politicianId, defectionDate: date } })
    if (existing) return
    await prisma.partyDefection.create({ data: { politicianId, fromPartyId: fromId, toPartyId: toId, defectionDate: date, reason, sourceUrl } })
  }

  // Ike Ekweremadu: PDP → APC (briefly 2014) → back to PDP
  await upsertDefection(ekweremadu.id, pdp.id, apc.id, new Date('2014-11-24'),
    'Joined APC merger wave ahead of 2015 elections under Senate President Saraki\'s influence; returned to PDP within weeks after being assured of his Deputy Senate President position.',
    'https://premiumtimesng.com/ekweremadu-apc-defection-2014',
  )
  await upsertDefection(ekweremadu.id, apc.id, pdp.id, new Date('2015-01-08'),
    'Returned to PDP after assurances of retaining Deputy Senate President position; party maintained bipartisan arrangements for his role.',
    'https://premiumtimesng.com/ekweremadu-returns-pdp-2015',
  )

  // Orji Uzor Kalu: PDP → APGA → APC
  await upsertDefection(kalu.id, pdp.id, apga.id, new Date('2003-02-14'),
    'Defected from PDP to APGA to contest Abia governorship; won on APGA ticket and served two terms as Abia Governor (2003–2007).',
    'https://premiumtimesng.com/kalu-pdp-apga-2003',
  )
  await upsertDefection(kalu.id, apga.id, apc.id, new Date('2018-06-12'),
    'Returned from APGA to APC ahead of 2019 senatorial election; joined the ruling party to leverage federal government relationships for Abia North.',
    'https://premiumtimesng.com/kalu-apga-apc-2018',
  )

  // Dino Melaye: APC → PDP (2019)
  await upsertDefection(melaye.id, apc.id, pdp.id, new Date('2019-01-30'),
    'Defected from APC to PDP citing Kogi State Governor Yahaya Bello\'s alleged electoral manipulation and victimisation of APC members opposed to the Governor.',
    'https://premiumtimesng.com/melaye-apc-pdp-2019',
  )

  // Ifeanyi Ubah: YPP → NNPP
  await upsertDefection(ubah.id, null, nnpp.id, new Date('2022-10-18'),
    'Left the Young Progressives Party (YPP) for NNPP following Rabiu Kwankwaso\'s recruitment of high-profile politicians; sought to join a party with stronger national structure.',
    'https://premiumtimesng.com/ubah-ypp-nnpp-2022',
  )
  console.log('✅  Party defections')

  // ═══════════════════════════════════════════════════════════
  // TOPIC MENTIONS (social intelligence enrichment)
  // ═══════════════════════════════════════════════════════════
  console.log('Seeding topic mentions…')
  const topicData = [
    { politicianId: akpabio.id, topics: ['Petroleum Industry', 'Senate Leadership', 'Niger Delta', 'Infrastructure'] },
    { politicianId: abbas.id, topics: ['Student Loans', 'Tax Reform', 'Education Funding', 'Northern Nigeria'] },
    { politicianId: ndume.id, topics: ['Boko Haram', 'Security', 'LG Autonomy', 'Senate Accountability'] },
    { politicianId: ekweremadu.id, topics: ['Human Trafficking', 'Constitutional Law', 'Electoral Reform', 'Corruption'] },
    { politicianId: kalu.id, topics: ['EFCC', 'Fraud', 'Abia State', 'Business Empire'] },
    { politicianId: melaye.id, topics: ['Luxury Cars', 'Kogi State', 'Anti-Social Media Bill', 'Senate Drama'] },
    { politicianId: remiTinubu.id, topics: ['Women Rights', 'First Lady', 'Gender Bill', 'Lagos Politics'] },
    { politicianId: adeola.id, topics: ['Tax Reform', 'Minimum Wage', 'Finance Committee', 'Budget'] },
    { politicianId: ubah.id, topics: ['Petroleum Downstream', 'Assassination Attempt', 'NNPP', 'Nnewi'] },
    { politicianId: nedNwoko.id, topics: ['Malaria Eradication', 'Senior Citizens', 'Delta State', 'Ned Foundation'] },
    { politicianId: peterObi.id, topics: ['Obidient Movement', 'Labour Party', '2023 Elections', 'Accountability'] },
    { politicianId: wike.id, topics: ['FCT Development', 'Abuja Roads', 'PDP Crisis', 'Rivers State'] },
    { politicianId: sanwoOlu.id, topics: ['Lagos Train', 'EndSARS', 'Lekki Seaport', 'Lagos Infrastructure'] },
    { politicianId: makinde.id, topics: ['Free Education', 'Ibadan Ring Road', 'PDP Southwest', 'Governance'] },
    { politicianId: alexOtti.id, topics: ['Labour Party', 'Abia State', 'Salary Arrears', 'Banking'] },
    { politicianId: sheuSani.id, topics: ['Human Rights', 'Anti-Torture', 'Kaduna Politics', 'El-Rufai'] },
    { politicianId: fayemi.id, topics: ['Mining Sector', 'Ekiti State', 'Governance Reform', 'Presidential Ambition'] },
  ]
  for (const t of topicData) {
    if (await prisma.topicMention.count({ where: { politicianId: t.politicianId } })) continue
    await prisma.topicMention.createMany({
      data: t.topics.map(topic => ({
        politicianId: t.politicianId,
        topic,
        mentionCount: Math.floor(Math.random() * 1800) + 200,
        avgSentiment: parseFloat((Math.random() * 1.2 - 0.4).toFixed(3)),
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-12-31'),
      })),
    })
  }
  console.log('✅  Topic mentions')

  console.log('\n🎉  POSINT Nigeria seed complete!\n')
  console.log('  Admin login : admin@posint.ng  /  Admin@123!')
  console.log('  Editor login: editor@posint.ng /  Editor@123!\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
