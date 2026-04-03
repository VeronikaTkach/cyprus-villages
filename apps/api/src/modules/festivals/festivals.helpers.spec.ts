import { selectDisplayEdition } from './festivals.helpers';
import type { TEdition } from './festivals.helpers';

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates a minimal TEdition-compatible object for testing.
 * Only the fields used by selectDisplayEdition need real values;
 * the rest are set to safe defaults.
 */
function ed(id: number, year: number, startDate: string | null): TEdition {
  return {
    id,
    year,
    startDate: startDate ? new Date(startDate) : null,
    endDate: null,
    isDateTba: startDate === null,
    startTime: null,
    endTime: null,
    status: 'PUBLISHED' as TEdition['status'],
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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as unknown as TEdition;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('selectDisplayEdition', () => {
  // Case A: year + month
  it('returns the edition matching both year and month', () => {
    const editions = [
      ed(1, 2023, '2023-07-10'),
      ed(2, 2024, '2024-07-15'),
      ed(3, 2025, '2025-09-01'),
    ];
    const result = selectDisplayEdition(editions, { year: 2024, month: 7 });
    expect(result?.id).toBe(2);
  });

  // Case B: year only
  it('returns the edition matching year when no month filter', () => {
    const editions = [
      ed(1, 2023, '2023-07-10'),
      ed(2, 2025, '2025-07-15'),
    ];
    const result = selectDisplayEdition(editions, { year: 2023 });
    expect(result?.id).toBe(1);
  });

  // Case C: month only
  it('returns the edition matching month when no year filter', () => {
    const editions = [
      ed(1, 2023, '2023-07-10'),  // July
      ed(2, 2024, '2024-09-20'),  // September
      ed(3, 2025, '2025-07-01'),  // July — latest year, picked first
    ];
    const result = selectDisplayEdition(editions, { month: 7 });
    expect(result?.id).toBe(3);
  });

  // Case D: no filters → latest edition (year desc)
  it('returns the latest edition when no filters', () => {
    const editions = [
      ed(1, 2023, '2023-07-10'),
      ed(2, 2024, '2024-07-15'),
      ed(3, 2025, '2025-07-01'),
    ];
    const result = selectDisplayEdition(editions, {});
    expect(result?.id).toBe(3);
  });

  // Fallback when no match
  it('falls back to all editions when year+month combo has no match', () => {
    const editions = [
      ed(1, 2023, '2023-07-10'),
      ed(2, 2024, '2024-09-15'),
    ];
    // No edition matches year=2025 + month=7
    const result = selectDisplayEdition(editions, { year: 2025, month: 7 });
    // Falls back to all editions → picks latest (2024)
    expect(result?.id).toBe(2);
  });

  // TBA editions (null startDate) are ignored for month filtering
  it('ignores TBA editions (null startDate) when filtering by month', () => {
    const tba = ed(1, 2025, null);   // TBA — no startDate
    const dated = ed(2, 2024, '2024-07-15'); // has a July date
    const result = selectDisplayEdition([tba, dated], { month: 7 });
    expect(result?.id).toBe(2);
  });

  // Deterministic: multiple candidates — year desc, then startDate asc (stable for ties)
  it('picks deterministically when multiple candidates match (startDate asc tiebreak)', () => {
    const editions = [
      ed(10, 2025, '2025-07-20'), // July, later date — loses (startDate asc)
      ed(11, 2025, '2025-07-01'), // July, earlier date — wins (first in array with earliest date)
      ed(12, 2025, '2025-07-01'), // same date — stable sort preserves ed(11) before ed(12)
    ];
    const result = selectDisplayEdition(editions, { year: 2025, month: 7 });
    expect(result?.id).toBe(11); // startDate asc → earliest date wins; equal dates → stable (insertion order)
  });

  // Empty input
  it('returns null for an empty editions list', () => {
    expect(selectDisplayEdition([], {})).toBeNull();
    expect(selectDisplayEdition([], { year: 2025, month: 7 })).toBeNull();
  });
});
