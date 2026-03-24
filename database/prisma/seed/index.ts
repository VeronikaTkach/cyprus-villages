/**
 * Seed — Cyprus Villages
 *
 * Creates a minimal realistic development dataset that covers the full
 * domain model: Villages, Festivals, FestivalEditions, LocationPoints,
 * Media, Users, and AuditLog entries.
 *
 * Safe to run multiple times: clears all seed-controlled tables first
 * (in reverse FK dependency order), then recreates from scratch.
 *
 * Run via:  pnpm db:seed
 */

import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  FestivalCategory,
  FestivalEditionStatus,
  LocationPointType,
  MediaKind,
  UserRole,
  AuditAction,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/cyprus_villages',
});

const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────────────
// CLEAR
// Reverse FK dependency order to avoid constraint violations.
// VillageTranslation rows are removed via CASCADE on Village delete.
// ─────────────────────────────────────────────────────────────

async function clearAll(): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.media.deleteMany();
  await prisma.locationPoint.deleteMany();
  await prisma.festivalEdition.deleteMany();
  await prisma.festival.deleteMany();
  await prisma.village.deleteMany(); // cascades to VillageTranslation
  await prisma.user.deleteMany();
}

// ─────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  // ── Users ─────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash('Admin1234!', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cyprus-villages.dev',
      name: 'Admin',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  // ── Villages ──────────────────────────────────────────────

  /**
   * Omodos — Limassol district, Troodos foothills.
   * Famous for its wine production and the Timios Stavros monastery.
   * Hosts an annual wine festival and the Holy Cross celebration.
   */
  const omodos = await prisma.village.create({
    data: {
      slug: 'omodos',
      nameEl: 'Ομοδός',
      district: 'Limassol',
      region: 'Troodos',
      centerLat: 34.8494,
      centerLng: 32.8108,
      isActive: true,
      translations: {
        create: [
          {
            locale: 'en',
            name: 'Omodos',
            description:
              'A picturesque mountain village in the Troodos foothills, known for its wine production, cobblestone streets, and the Timios Stavros (Holy Cross) monastery at its centre.',
          },
          {
            locale: 'ru',
            name: 'Омодос',
            description:
              'Живописная горная деревня у подножия Троодоса, известная виноделием, мощёными улочками и монастырём Тимиос Ставрос (Святого Креста) в центре.',
          },
          {
            locale: 'el',
            name: 'Ομοδός',
            description:
              'Ένα γραφικό ορεινό χωριό στις παρυφές του Τροόδους, γνωστό για την παραγωγή κρασιού, τα πλακόστρωτα δρομάκια και τη Μονή Τιμίου Σταυρού στο κέντρο του.',
          },
        ],
      },
    },
  });

  /**
   * Lefkara — Larnaca district, Troodos foothills.
   * UNESCO-recognised village famous for lefkaritika (traditional lace)
   * and silver crafts. A popular day-trip destination.
   */
  const lefkara = await prisma.village.create({
    data: {
      slug: 'lefkara',
      nameEl: 'Λεύκαρα',
      district: 'Larnaca',
      region: 'Troodos',
      centerLat: 34.8709,
      centerLng: 33.3232,
      isActive: true,
      translations: {
        create: [
          {
            locale: 'en',
            name: 'Lefkara',
            description:
              'A traditional hilltop village celebrated for its handmade lace (lefkaritika) and silver jewellery. Leonardo da Vinci reportedly visited in 1481. A UNESCO Intangible Cultural Heritage craft tradition.',
          },
          {
            locale: 'ru',
            name: 'Лефкара',
            description:
              'Традиционная деревня на вершине холма, знаменитая ручным кружевом (лефкаритика) и серебряными украшениями. По преданию, в 1481 году её посетил Леонардо да Винчи. Нематериальное культурное наследие ЮНЕСКО.',
          },
          {
            locale: 'el',
            name: 'Λεύκαρα',
            description:
              'Ένα παραδοσιακό χωριό στην κορυφή λόφου, γνωστό για τη χειροποίητη δαντέλα (λευκαρίτικα) και τα ασημένια κοσμήματα. Αναφέρεται ότι το επισκέφθηκε ο Λεονάρντο ντα Βίντσι το 1481.',
          },
        ],
      },
    },
  });

  /**
   * Pachna — Limassol district.
   * Small wine-producing village in the Krasochoria (wine villages) belt.
   */
  const pachna = await prisma.village.create({
    data: {
      slug: 'pachna',
      nameEl: 'Πάχνα',
      district: 'Limassol',
      region: 'Krasochoria',
      centerLat: 34.8038,
      centerLng: 32.8543,
      isActive: true,
      translations: {
        create: [
          {
            locale: 'en',
            name: 'Pachna',
            description:
              'A small agricultural village in the Limassol wine belt, known for local Commandaria-area viticulture and its traditional annual wine celebration.',
          },
          {
            locale: 'ru',
            name: 'Пахна',
            description:
              'Небольшая сельскохозяйственная деревня в лимасольском винном регионе, известная виноградарством в зоне Командарии и ежегодным традиционным праздником вина.',
          },
          {
            locale: 'el',
            name: 'Πάχνα',
            description:
              'Ένα μικρό αγροτικό χωριό στη ζώνη κρασιού της Λεμεσού, γνωστό για την αμπελοκαλλιέργεια στην περιοχή της Κομανδαρίας.',
          },
        ],
      },
    },
  });

  // ── Festivals ─────────────────────────────────────────────

  const omodosFestival = await prisma.festival.create({
    data: {
      slug: 'omodos-wine-festival',
      villageId: omodos.id,
      titleEl: 'Φεστιβάλ Κρασιού Ομοδού',
      category: FestivalCategory.WINE,
      isActive: true,
      translations: {
        create: [
          {
            locale: 'en',
            title: 'Omodos Wine Festival',
            description:
              'Annual celebration of local wine in the heart of Omodos village, featuring tastings, traditional music, and local food.',
          },
          { locale: 'ru', title: 'Омодосский винный фестиваль', description: null },
          { locale: 'el', title: 'Φεστιβάλ Κρασιού Ομοδού', description: null },
        ],
      },
    },
  });

  const holyCrossFestival = await prisma.festival.create({
    data: {
      slug: 'omodos-holy-cross',
      villageId: omodos.id,
      titleEl: 'Κατακλυσμός Τιμίου Σταυρού',
      category: FestivalCategory.RELIGIOUS,
      isActive: true,
      translations: {
        create: [
          {
            locale: 'en',
            title: 'Holy Cross Festival',
            description:
              'Religious feast at the Timios Stavros Monastery in Omodos, marking the Exaltation of the Holy Cross with a procession and liturgy.',
          },
          { locale: 'ru', title: 'Праздник Святого Креста', description: null },
          { locale: 'el', title: 'Κατακλυσμός Τιμίου Σταυρού', description: null },
        ],
      },
    },
  });

  const lefkaraFestival = await prisma.festival.create({
    data: {
      slug: 'lefkara-traditional-festival',
      villageId: lefkara.id,
      titleEl: 'Παραδοσιακή Γιορτή Λεύκαρας',
      category: FestivalCategory.CULTURAL,
      isActive: true,
      translations: {
        create: [
          {
            locale: 'en',
            title: 'Lefkara Traditional Festival',
            description:
              "Annual summer festival celebrating the village's lace-making heritage, traditional crafts, folk music, and local cuisine.",
          },
          { locale: 'ru', title: 'Традиционный фестиваль Лефкары', description: null },
          { locale: 'el', title: 'Παραδοσιακή Γιορτή Λεύκαρας', description: null },
        ],
      },
    },
  });

  const pachnaFestival = await prisma.festival.create({
    data: {
      slug: 'pachna-wine-festival',
      villageId: pachna.id,
      titleEl: 'Φεστιβάλ Κρασιού Πάχνας',
      category: FestivalCategory.WINE,
      isActive: true,
      translations: {
        create: [
          {
            locale: 'en',
            title: 'Pachna Wine Festival',
            description:
              'Local wine festival in Pachna village, celebrating the grape harvest season with tastings from nearby Krasochoria wineries.',
          },
          { locale: 'ru', title: 'Винный фестиваль Пахны', description: null },
          { locale: 'el', title: 'Φεστιβάλ Κρασιού Πάχνας', description: null },
        ],
      },
    },
  });

  // ── Festival Editions ──────────────────────────────────────

  const omodosFest2025 = await prisma.festivalEdition.create({
    data: {
      festivalId: omodosFestival.id,
      year: 2025,
      status: FestivalEditionStatus.PUBLISHED,
      startDate: new Date('2025-08-16'),
      endDate: new Date('2025-08-18'),
      isDateTba: false,
      startTime: '19:00',
      endTime: '23:30',
      venueName: 'Omodos Main Square',
      venueLat: 34.8491,
      venueLng: 32.8107,
      parkingName: 'Omodos Village Parking',
      parkingLat: 34.8501,
      parkingLng: 32.8115,
      sourceUrl: 'https://www.visitcyprus.com',
      sourceNote: 'Dates confirmed via official Cyprus tourism calendar.',
      publishedAt: new Date('2025-06-01'),
      lastVerifiedAt: new Date('2025-07-10'),
    },
  });

  const holyCross2025 = await prisma.festivalEdition.create({
    data: {
      festivalId: holyCrossFestival.id,
      year: 2025,
      status: FestivalEditionStatus.PUBLISHED,
      startDate: new Date('2025-09-14'),
      endDate: new Date('2025-09-14'),
      isDateTba: false,
      startTime: '10:00',
      venueName: 'Timios Stavros Monastery, Omodos',
      venueLat: 34.8492,
      venueLng: 32.8106,
      sourceNote: 'Holy Cross Day (Exaltation) — fixed annual date, 14 September.',
      publishedAt: new Date('2025-08-01'),
      lastVerifiedAt: new Date('2025-09-01'),
    },
  });

  const lefkara2025 = await prisma.festivalEdition.create({
    data: {
      festivalId: lefkaraFestival.id,
      year: 2025,
      status: FestivalEditionStatus.PUBLISHED,
      startDate: new Date('2025-07-27'),
      endDate: new Date('2025-07-27'),
      isDateTba: false,
      startTime: '18:00',
      endTime: '22:00',
      venueName: 'Lefkara Central Square',
      venueLat: 34.8707,
      venueLng: 33.3229,
      parkingName: 'Lefkara Village Parking',
      parkingLat: 34.8715,
      parkingLng: 33.3241,
      sourceNote: 'Date confirmed by Lefkara Community Council.',
      publishedAt: new Date('2025-06-15'),
      lastVerifiedAt: new Date('2025-07-01'),
    },
  });

  const pachna2026 = await prisma.festivalEdition.create({
    data: {
      festivalId: pachnaFestival.id,
      year: 2026,
      status: FestivalEditionStatus.DRAFT,
      isDateTba: true,
      parkingName: 'Pachna Village Square',
      parkingLat: 34.8035,
      parkingLng: 32.8542,
      sourceNote:
        'Festival is planned for 2026. Exact dates TBA — typically held in September.',
    },
  });

  // ── Location Points ────────────────────────────────────────

  await prisma.locationPoint.create({
    data: {
      type: LocationPointType.PARKING,
      label: 'Omodos Village Parking',
      lat: 34.8501,
      lng: 32.8115,
      note: 'Main public car park at the village entrance. Free.',
      villageId: omodos.id,
      isActive: true,
    },
  });

  await prisma.locationPoint.create({
    data: {
      type: LocationPointType.VENUE,
      label: 'Omodos Main Square',
      lat: 34.8491,
      lng: 32.8107,
      note: 'The historic main square of Omodos. Central gathering point for festivals and village life.',
      villageId: omodos.id,
      festivalEditionId: omodosFest2025.id,
      isActive: true,
    },
  });

  await prisma.locationPoint.create({
    data: {
      type: LocationPointType.SHUTTLE,
      label: 'Shuttle Stop — Omodos Junction',
      lat: 34.842,
      lng: 32.8178,
      note: 'Free shuttle service to/from Omodos village during the wine festival. Departs every 30 min.',
      festivalEditionId: omodosFest2025.id,
      isActive: true,
    },
  });

  await prisma.locationPoint.create({
    data: {
      type: LocationPointType.VIEWPOINT,
      label: 'Lefkara Traditional Quarter',
      lat: 34.8707,
      lng: 33.3229,
      note: 'Upper village quarter with traditional lace workshops and a panoramic view toward the coast.',
      villageId: lefkara.id,
      isActive: true,
    },
  });

  await prisma.locationPoint.create({
    data: {
      type: LocationPointType.VENUE,
      label: 'Lefkara Festival Stage',
      lat: 34.8705,
      lng: 33.3225,
      note: 'Temporary stage set up in the central square for folk music and dance performances.',
      festivalEditionId: lefkara2025.id,
      isActive: true,
    },
  });

  // ── Media ─────────────────────────────────────────────────

  await prisma.media.create({
    data: {
      url: '/uploads/seed/omodos-village-cover.jpg',
      alt: 'Aerial view of Omodos village with cobblestone square and monastery',
      width: 1600,
      height: 900,
      kind: MediaKind.COVER,
      villageId: omodos.id,
    },
  });

  await prisma.media.create({
    data: {
      url: '/uploads/seed/lefkara-village-cover.jpg',
      alt: 'Traditional stone houses and narrow lanes of Lefkara village',
      width: 1600,
      height: 900,
      kind: MediaKind.COVER,
      villageId: lefkara.id,
    },
  });

  await prisma.media.create({
    data: {
      url: '/uploads/seed/pachna-village-thumb.jpg',
      alt: 'Pachna village square surrounded by vineyards',
      width: 400,
      height: 300,
      kind: MediaKind.THUMBNAIL,
      villageId: pachna.id,
    },
  });

  await prisma.media.create({
    data: {
      url: '/uploads/seed/omodos-wine-festival-gallery-01.jpg',
      alt: 'Wine barrels and tasting tables at the Omodos Wine Festival',
      width: 1200,
      height: 800,
      kind: MediaKind.GALLERY,
      festivalId: omodosFestival.id,
    },
  });

  await prisma.media.create({
    data: {
      url: '/uploads/seed/lefkara-festival-2025-cover.jpg',
      alt: 'Folk dancers performing at the Lefkara Traditional Festival 2025',
      width: 1200,
      height: 675,
      kind: MediaKind.COVER,
      festivalEditionId: lefkara2025.id,
    },
  });

  // ── Audit Log ─────────────────────────────────────────────

  await prisma.auditLog.createMany({
    data: [
      {
        entityType: 'FestivalEdition',
        entityId: omodosFest2025.id,
        action: AuditAction.CREATE,
        afterJson: {
          festivalId: omodosFest2025.festivalId,
          year: omodosFest2025.year,
          status: omodosFest2025.status,
        },
        userId: adminUser.id,
      },
      {
        entityType: 'FestivalEdition',
        entityId: omodosFest2025.id,
        action: AuditAction.PUBLISH,
        beforeJson: { status: FestivalEditionStatus.DRAFT },
        afterJson: { status: FestivalEditionStatus.PUBLISHED },
        userId: adminUser.id,
      },
      {
        entityType: 'FestivalEdition',
        entityId: holyCross2025.id,
        action: AuditAction.CREATE,
        afterJson: {
          festivalId: holyCross2025.festivalId,
          year: holyCross2025.year,
          status: holyCross2025.status,
        },
        userId: adminUser.id,
      },
      {
        entityType: 'FestivalEdition',
        entityId: lefkara2025.id,
        action: AuditAction.CREATE,
        afterJson: {
          festivalId: lefkara2025.festivalId,
          year: lefkara2025.year,
          status: lefkara2025.status,
        },
        userId: adminUser.id,
      },
      {
        entityType: 'FestivalEdition',
        entityId: lefkara2025.id,
        action: AuditAction.PUBLISH,
        beforeJson: { status: FestivalEditionStatus.DRAFT },
        afterJson: { status: FestivalEditionStatus.PUBLISHED },
        userId: adminUser.id,
      },
      {
        entityType: 'FestivalEdition',
        entityId: pachna2026.id,
        action: AuditAction.CREATE,
        afterJson: {
          festivalId: pachna2026.festivalId,
          year: pachna2026.year,
          status: pachna2026.status,
          isDateTba: pachna2026.isDateTba,
        },
        userId: adminUser.id,
      },
    ],
  });
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('⏳ Clearing existing data...');
  await clearAll();

  console.log('🌱 Seeding...');
  await seed();

  console.log('✅ Seed complete.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
