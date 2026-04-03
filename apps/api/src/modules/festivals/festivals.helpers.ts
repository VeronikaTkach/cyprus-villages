import type { TFestivalRecord } from './festivals.repository';

export type TEdition = TFestivalRecord['editions'][number];

function editionMatchesMonth(edition: TEdition, month: number): boolean {
  if (!edition.startDate) return false;
  return new Date(edition.startDate).getUTCMonth() + 1 === month;
}

function sortEditions(editions: TEdition[]): TEdition[] {
  return [...editions].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    // startDate is a Date object, so !== is reference inequality — always true for
    // distinct objects even when they represent the same timestamp. Equal dates
    // therefore enter this branch and return getTime() - getTime() = 0. A return
    // value of 0 means "equal" to Array.sort; V8's stable TimSort preserves the
    // original array order for equal elements. As a result, the id tiebreaker
    // below is never reached for editions that share the same startDate.
    if (a.startDate !== b.startDate) {
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    return b.id - a.id;
  });
}

/**
 * Selects which edition to surface in the list-view UI (displayEdition).
 * Input `editions` must already be restricted to PUBLISHED status only.
 *
 * Priority:
 *   A. year + month: editions matching both year and startDate month
 *   B. year only:    editions matching year
 *   C. month only:   editions with startDate in that month (TBA/null skipped)
 *   D. no filters:   all editions (picks latest by sort)
 *
 * Falls back to all editions when no candidates match the active filter.
 * Tiebreak within any group: year desc → startDate asc (nulls last) → id desc.
 */
export function selectDisplayEdition(
  editions: TEdition[],
  filters: { year?: number; month?: number },
): TEdition | null {
  if (!editions.length) return null;

  const { year, month } = filters;
  let preferred: TEdition[];

  if (year !== undefined && month !== undefined) {
    // Case A: both filters active
    preferred = editions.filter(
      (e) => e.year === year && editionMatchesMonth(e, month),
    );
  } else if (year !== undefined) {
    // Case B: year filter only
    preferred = editions.filter((e) => e.year === year);
  } else if (month !== undefined) {
    // Case C: month filter only (TBA editions have null startDate, so they never match)
    preferred = editions.filter((e) => editionMatchesMonth(e, month));
  } else {
    // Case D: no filters — skip preferred, use full pool below
    preferred = [];
  }

  const pool = preferred.length ? preferred : editions;
  return sortEditions(pool)[0]!;
}
