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

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/cyprus_villages',
});

const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────────────
// CLEAR
// Reverse FK dependency order to avoid constraint violations.
// ─────────────────────────────────────────────────────────────

async function clearAll(): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.media.deleteMany();
  await prisma.locationPoint.deleteMany();
  await prisma.festivalEdition.deleteMany();
  await prisma.festival.deleteMany();
  await prisma.village.deleteMany();
  await prisma.user.deleteMany();
}

// ─────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  // ── Users ─────────────────────────────────────────────────

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cyprus-villages.dev',
      name: 'Admin',
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
      nameEn: 'Omodos',
      nameRu: 'Омодос',
      nameEl: 'Ομοδός',
      district: 'Limassol',
      region: 'Troodos',
      descriptionEn:
        'A picturesque mountain village in the Troodos foothills, known for its wine production, cobblestone streets, and the Timios Stavros (Holy Cross) monastery at its centre.',
      centerLat: 34.8494,
      centerLng: 32.8108,
      isActive: true,
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
      nameEn: 'Lefkara',
      nameRu: 'Лефкара',
      nameEl: 'Λεύκαρα',
      district: 'Larnaca',
      region: 'Troodos',
      descriptionEn:
        'A traditional hilltop village celebrated for its handmade lace (lefkaritika) and silver jewellery. Leonardo da Vinci reportedly visited in 1481. A UNESCO Intangible Cultural Heritage craft tradition.',
      centerLat: 34.8709,
      centerLng: 33.3232,
      isActive: true,
    },
  });

  /**
   * Pachna — Limassol district.
   * Small wine-producing village in the Krasochoria (wine villages) belt.
   */
  const pachna = await prisma.village.create({
    data: {
      slug: 'pachna',
      nameEn: 'Pachna',
      nameRu: 'Пахна',
      nameEl: 'Πάχνα',
      district: 'Limassol',
      region: 'Krasochoria',
      descriptionEn:
        'A small agricultural village in the Limassol wine belt, known for local Commandaria-area viticulture and its traditional annual wine celebration.',
      centerLat: 34.8038,
      centerLng: 32.8543,
      isActive: true,
    },
  });

  // ── Festivals ─────────────────────────────────────────────

  /**
   * Omodos Wine Festival — recurring annual wine celebration.
   * Held in the main square, features local wineries, live music, and food.
   */
  const omodosFestival = await prisma.festival.create({
    data: {
      slug: 'omodos-wine-festival',
      villageId: omodos.id,
      titleEn: 'Omodos Wine Festival',
      titleRu: 'Омодосский винный фестиваль',
      titleEl: 'Φεστιβάλ Κρασιού Ομοδού',
      shortDescriptionEn:
        'Annual celebration of local wine in the heart of Omodos village, featuring tastings, traditional music, and local food.',
      category: FestivalCategory.WINE,
      isActive: true,
    },
  });

  /**
   * Holy Cross Festival — religious celebration at Timios Stavros monastery.
   * One of the most important annual events in Omodos.
   */
  const holyCrossFestival = await prisma.festival.create({
    data: {
      slug: 'omodos-holy-cross',
      villageId: omodos.id,
      titleEn: 'Holy Cross Festival',
      titleRu: 'Праздник Святого Креста',
      titleEl: 'Κατακλυσμός Τιμίου Σταυρού',
      shortDescriptionEn:
        'Religious feast at the Timios Stavros Monastery in Omodos, marking the Exaltation of the Holy Cross with a procession and liturgy.',
      category: FestivalCategory.RELIGIOUS,
      isActive: true,
    },
  });

  /**
   * Lefkara Traditional Festival — cultural celebration of village crafts and heritage.
   */
  const lefkaraFestival = await prisma.festival.create({
    data: {
      slug: 'lefkara-traditional-festival',
      villageId: lefkara.id,
      titleEn: 'Lefkara Traditional Festival',
      titleRu: 'Традиционный фестиваль Лефкары',
      titleEl: 'Παραδοσιακή Γιορτή Λεύκαρας',
      shortDescriptionEn:
        'Annual summer festival celebrating the village\'s lace-making heritage, traditional crafts, folk music, and local cuisine.',
      category: FestivalCategory.CULTURAL,
      isActive: true,
    },
  });

  /**
   * Pachna Wine Festival — small local wine celebration.
   * Date not yet confirmed for the upcoming season.
   */
  const pachnaFestival = await prisma.festival.create({
    data: {
      slug: 'pachna-wine-festival',
      villageId: pachna.id,
      titleEn: 'Pachna Wine Festival',
      titleRu: 'Винный фестиваль Пахны',
      titleEl: 'Φεστιβάλ Κρασιού Πάχνας',
      shortDescriptionEn:
        'Local wine festival in Pachna village, celebrating the grape harvest season with tastings from nearby Krasochoria wineries.',
      category: FestivalCategory.WINE,
      isActive: true,
    },
  });

  // ── Festival Editions ──────────────────────────────────────

  /**
   * Omodos Wine Festival 2025.
   * Published edition with concrete dates, venue, and parking.
   * Three-day evening event in the main square.
   */
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

  /**
   * Holy Cross Festival 2025.
   * Published single-day religious event. Parking not applicable.
   */
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

  /**
   * Lefkara Traditional Festival 2025.
   * Published edition. Single afternoon/evening event.
   */
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

  /**
   * Pachna Wine Festival 2026 — draft edition, date not yet confirmed.
   * Demonstrates the TBA pattern: festival is known, date is not set yet.
   */
  const pachna2026 = await prisma.festivalEdition.create({
    data: {
      festivalId: pachnaFestival.id,
      year: 2026,
      status: FestivalEditionStatus.DRAFT,
      isDateTba: true,
      parkingName: 'Pachna Village Square',
      parkingLat: 34.8035,
      parkingLng: 32.8542,
      sourceNote: 'Festival is planned for 2026. Exact dates TBA — typically held in September.',
    },
  });

  // ── Location Points ────────────────────────────────────────

  // Village-only: permanent Omodos village parking.
  // Always shown on the village map, not tied to a specific edition.
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

  // Both village + edition: Omodos Main Square serves as the permanent
  // village centre point AND as the wine festival venue.
  // Intentional dual-ownership — see docs/architecture.md § LocationPoint dual ownership.
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

  // Edition-only: shuttle stop specific to the 2025 wine festival.
  // Temporary point — not relevant outside this edition.
  await prisma.locationPoint.create({
    data: {
      type: LocationPointType.SHUTTLE,
      label: 'Shuttle Stop — Omodos Junction',
      lat: 34.8420,
      lng: 32.8178,
      note: 'Free shuttle service to/from Omodos village during the wine festival. Departs every 30 min.',
      festivalEditionId: omodosFest2025.id,
      isActive: true,
    },
  });

  // Village-only: Lefkara traditional quarter viewpoint.
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

  // Edition-only: festival stage for Lefkara Traditional Festival 2025.
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
  // Each record has exactly one FK set — single-owner invariant.
  // See docs/architecture.md § Media single-owner invariant.

  // Village cover — Omodos
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

  // Village cover — Lefkara
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

  // Village thumbnail — Pachna
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

  // Festival gallery image — Omodos Wine Festival
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

  // Festival edition cover — Lefkara Traditional Festival 2025
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

  // Log CREATE + PUBLISH for the two main published editions.
  // Demonstrates the audit trail pattern used by admin actions.

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
