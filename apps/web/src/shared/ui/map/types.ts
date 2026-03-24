export type TMapMarkerKind = 'village' | 'venue' | 'parking';

export interface IMapMarker {
  lat: number;
  lng: number;
  kind: TMapMarkerKind;
  /** Short label shown in the popup */
  popup?: string;
}
