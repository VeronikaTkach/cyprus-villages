import type { TMapMarkerKind } from '@/shared/ui';
import type { TLocationPointType } from '../model/types';

/**
 * Maps a LocationPoint type to a map marker kind for rendering.
 *
 * VENUE  → 'venue'  (blue)   — matches existing festival venue markers
 * PARKING → 'parking' (orange) — matches existing festival parking markers
 * all other types → 'point' (gray) — generic interest point
 */
export function locationPointTypeToMarkerKind(type: TLocationPointType): TMapMarkerKind {
  if (type === 'VENUE') return 'venue';
  if (type === 'PARKING') return 'parking';
  return 'point';
}
