import { describe, it, expect } from 'vitest';
import { getLatestEdition, getFestivalTranslation } from './types';
import type { IFestival, IFestivalEditionBrief, IFestivalTranslation } from './types';

// ── Minimal fixtures ──────────────────────────────────────────────────────────

const baseEdition: IFestivalEditionBrief = {
  id: 1,
  year: 2025,
  startDate: '2025-07-15',
  endDate: null,
  isDateTba: false,
  startTime: null,
  endTime: null,
  status: 'PUBLISHED',
  publishedAt: null,
  lastVerifiedAt: null,
  venueName: null,
  venueLat: null,
  venueLng: null,
  parkingName: null,
  parkingLat: null,
  parkingLng: null,
  officialUrl: null,
  sourceUrl: null,
  sourceNote: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function makeFestival(
  overrides: Partial<Pick<IFestival, 'editions' | 'translations'>>,
): IFestival {
  return {
    id: 1,
    slug: 'test-festival',
    villageId: 1,
    titleEl: 'Φεστιβάλ',
    category: 'WINE',
    typicalMonth: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    translations: [],
    editions: [],
    ...overrides,
  };
}

const enTranslation: IFestivalTranslation = {
  locale: 'en',
  title: 'Wine Festival',
  description: 'Annual wine festival',
};

const ruTranslation: IFestivalTranslation = {
  locale: 'ru',
  title: 'Фестиваль вина',
  description: null,
};

// ── getLatestEdition ──────────────────────────────────────────────────────────

describe('getLatestEdition', () => {
  it('returns the first edition from the list (API returns year-desc order)', () => {
    const e2025 = { ...baseEdition, id: 2, year: 2025 };
    const e2024 = { ...baseEdition, id: 1, year: 2024 };
    const festival = makeFestival({ editions: [e2025, e2024] });
    expect(getLatestEdition(festival)).toBe(e2025);
  });

  it('returns null when the festival has no editions', () => {
    const festival = makeFestival({ editions: [] });
    expect(getLatestEdition(festival)).toBeNull();
  });

  it('returns the single edition when there is exactly one', () => {
    const festival = makeFestival({ editions: [baseEdition] });
    expect(getLatestEdition(festival)).toBe(baseEdition);
  });
});

// ── getFestivalTranslation ────────────────────────────────────────────────────

describe('getFestivalTranslation', () => {
  it('returns the translation for the requested locale', () => {
    const festival = makeFestival({ translations: [enTranslation, ruTranslation] });
    expect(getFestivalTranslation(festival, 'ru')).toBe(ruTranslation);
  });

  it('falls back to the default locale (en) when the requested locale is absent', () => {
    const festival = makeFestival({ translations: [enTranslation] });
    expect(getFestivalTranslation(festival, 'el')).toBe(enTranslation);
  });

  it('returns undefined when neither the requested locale nor the fallback exist', () => {
    const festival = makeFestival({ translations: [ruTranslation] });
    // ru locale requested but not found; fallback 'en' also absent
    expect(getFestivalTranslation(festival, 'el', 'en')).toBeUndefined();
  });

  it('respects a custom fallback locale', () => {
    const festival = makeFestival({ translations: [ruTranslation] });
    expect(getFestivalTranslation(festival, 'el', 'ru')).toBe(ruTranslation);
  });
});
