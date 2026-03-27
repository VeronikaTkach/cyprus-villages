export type TMapMarkerKind = 'village' | 'venue' | 'parking' | 'point';

export interface IMapMarker {
  lat: number;
  lng: number;
  kind: TMapMarkerKind;
  /** Short label shown in the popup */
  popup?: string;
}
