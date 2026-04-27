import type { IMapMarker } from '@/shared/ui';
import type { IMapPoint } from '../model';
import { locationPointTypeToMarkerKind } from './marker-mapping';

export function buildLocationPointMarkers(points: IMapPoint[]): IMapMarker[] {
  return points.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    kind: locationPointTypeToMarkerKind(p.type),
    popup: p.label,
  }));
}
