import type { TFestivalCategory, TFestivalEditionStatus } from '../model';

export const CATEGORY_LABELS: Record<TFestivalCategory, string> = {
  WINE: 'Wine',
  FOOD: 'Food',
  CULTURAL: 'Cultural',
  RELIGIOUS: 'Religious',
  MUSIC: 'Music',
  ARTS: 'Arts',
  SPORT: 'Sport',
  OTHER: 'Other',
};

export const CATEGORY_COLORS: Record<TFestivalCategory, string> = {
  WINE: 'grape',
  FOOD: 'orange',
  CULTURAL: 'blue',
  RELIGIOUS: 'yellow',
  MUSIC: 'pink',
  ARTS: 'indigo',
  SPORT: 'green',
  OTHER: 'gray',
};

export const EDITION_STATUS_LABELS: Record<TFestivalEditionStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
  CANCELLED: 'Cancelled',
};

export const EDITION_STATUS_COLORS: Record<TFestivalEditionStatus, string> = {
  DRAFT: 'gray',
  PUBLISHED: 'teal',
  ARCHIVED: 'orange',
  CANCELLED: 'red',
};

/** Format a date string (ISO) to a short human-readable form. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format a date range, collapsing same-year ranges. */
export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return '';
  if (!end || start === end) return start ? formatDate(start) : '';
  return `${formatDate(start!)} – ${formatDate(end)}`;
}
