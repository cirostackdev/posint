import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminHash = await bcrypt.hash('Admin@123!', 12)
  await prisma.user.upsert({
    where: { email: 'admin@posint.ng' },
    update: {},
    create: {
      email: 'admin@posint.ng',
      passwordHash: adminHash,
      displayName: 'POSINT Admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created')

  // Seed parties
  const parties = [
    {
      name: 'All Progressives Congress',
      abbreviation: 'APC',
      slug: 'apc',
      color: '#2563EB',
      foundedYear: 2013,
      seatsTotal: 263,
      senateSeats: 59,
      houseSeats: 178,
      governors: 21,
    },
    {
      name: 'Peoples Democratic Party',
      abbreviation: 'PDP',
      slug: 'pdp',
      color: '#DC2626',
      foundedYear: 1998,
      seatsTotal: 157,
      senateSeats: 36,
      houseSeats: 105,
      governors: 13,
    },
    {
      name: 'Labour Party',
      abbreviation: 'LP',
      slug: 'lp',
      color: '#16A34A',
      foundedYear: 2002,
      seatsTotal: 45,
      senateSeats: 8,
      houseSeats: 35,
      governors: 1,
    },
    {
      name: 'New Nigeria Peoples Party',
      abbreviation: 'NNPP',
      slug: 'nnpp',
      color: '#F97316',
      foundedYear: 2001,
      seatsTotal: 21,
      senateSeats: 2,
      houseSeats: 19,
      governors: 1,
    },
    {
      name: 'All Progressives Grand Alliance',
      abbreviation: 'APGA',
      slug: 'apga',
      color: '#9333EA',
      foundedYear: 2002,
      seatsTotal: 8,
      senateSeats: 1,
      houseSeats: 5,
      governors: 1,
    },
  ]

  for (const party of parties) {
    await prisma.politicalParty.upsert({
      where: { abbreviation: party.abbreviation },
      update: party,
      create: party,
    })
  }
  console.log('✅ Parties seeded')

  // Seed data sources (using findFirst + create pattern)
  const sources = [
    {
      name: 'National Assembly (NASS)',
      url: 'https://nass.gov.ng',
      type: 'scraper',
      description: 'Bills, motions, proceedings',
    },
    {
      name: 'INEC Election Results',
      url: 'https://www.inecnigeria.org',
      type: 'scraper',
      description: 'Official election results',
    },
    {
      name: 'EFCC Press Releases',
      url: 'https://efcc.gov.ng/news',
      type: 'rss',
      description: 'Case updates and press releases',
    },
    {
      name: 'ICPC Updates',
      url: 'https://icpc.gov.ng/news',
      type: 'rss',
      description: 'ICPC case news',
    },
    {
      name: 'Code of Conduct Bureau',
      url: 'https://ccb.gov.ng',
      type: 'manual',
      description: 'Asset declarations',
    },
  ]

  for (const source of sources) {
    await prisma.dataSource.upsert({
      where: { name: source.name },
      update: {},
      create: source,
    })
  }
  console.log('✅ Data sources seeded')

  // Seed sample politicians
  const apcParty = await prisma.politicalParty.findUnique({ where: { abbreviation: 'APC' } })
  const pdpParty = await prisma.politicalParty.findUnique({ where: { abbreviation: 'PDP' } })
  const lpParty = await prisma.politicalParty.findUnique({ where: { abbreviation: 'LP' } })

  const politicians = [
    {
      slug: 'godswill-akpabio',
      name: 'Godswill Akpabio',
      partyId: apcParty!.id,
      position: 'Senate President',
      chamber: 'SENATE' as const,
      constituency: 'Akwa Ibom North-West',
      state: 'Akwa Ibom',
      education: 'LLB, University of Calabar',
      biography: 'Godswill Obot Akpabio is the 15th Senate President of Nigeria.',
      firstElected: 2007,
      yearsInOffice: 17,
      billsSponsored: 45,
      attendanceRate: 92,
    },
    {
      slug: 'ali-ndume',
      name: 'Ali Ndume',
      partyId: apcParty!.id,
      position: 'Senator',
      chamber: 'SENATE' as const,
      constituency: 'Borno South',
      state: 'Borno',
      education: 'MSc, University of Maiduguri',
      biography: 'Former Senate Leader, known for vocal criticism and constituency advocacy.',
      firstElected: 2011,
      yearsInOffice: 13,
      billsSponsored: 38,
      attendanceRate: 94,
    },
    {
      slug: 'ike-ekweremadu',
      name: 'Ike Ekweremadu',
      partyId: pdpParty!.id,
      position: 'Senator',
      chamber: 'SENATE' as const,
      constituency: 'Enugu West',
      state: 'Enugu',
      education: 'PhD Law, University of Abuja',
      biography: 'Four-term senator. Former Deputy Senate President.',
      firstElected: 2003,
      yearsInOffice: 20,
      billsSponsored: 52,
      attendanceRate: 92,
    },
    {
      slug: 'peter-obi',
      name: 'Peter Obi',
      partyId: lpParty!.id,
      position: 'Former Presidential Candidate',
      chamber: null,
      constituency: 'Anambra South',
      state: 'Anambra',
      education: 'MBA, University of Lagos',
      biography: 'Former Governor of Anambra State. 2023 presidential candidate for Labour Party.',
      firstElected: 2003,
      yearsInOffice: 8,
      billsSponsored: 0,
      attendanceRate: 0,
    },
  ]

  for (const politician of politicians) {
    await prisma.politician.upsert({
      where: { slug: politician.slug },
      update: {},
      create: politician,
    })
  }
  console.log('✅ Sample politicians seeded')

  // Seed sample election
  await prisma.election.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      year: 2023,
      type: 'Presidential',
      level: 'FEDERAL',
      winnerName: 'Bola Ahmed Tinubu',
      winnerPartyId: apcParty!.id,
      winnerVotes: 8794726,
      totalVotes: 24919613,
      registeredVoters: 93469008,
      margin: '2.1M',
      sourceUrl: 'https://www.inecnigeria.org',
    },
  })
  console.log('✅ Sample elections seeded')

  console.log('\n🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
