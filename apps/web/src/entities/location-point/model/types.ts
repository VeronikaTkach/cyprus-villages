export type TLocationPointType =
  | 'PARKING'
  | 'VENUE'
  | 'MEETING_POINT'
  | 'WC'
  | 'SHUTTLE'
  | 'VIEWPOINT'
  | 'OTHER';

export interface ILocationPoint {
  id: number;
  type: TLocationPointType;
  label: string;
  lat: number;
  lng: number;
  note: string | null;
  villageId: number | null;
  festivalEditionId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Compact shape returned by GET /map/points */
export interface IMapPoint {
  id: number;
  type: TLocationPointType;
  label: string;
  lat: number;
  lng: number;
  villageId: number | null;
  festivalEditionId: number | null;
}

export interface ICreateLocationPointDto {
  type: TLocationPointType;
  label: string;
  lat: number;
  lng: number;
  note?: string;
  villageId?: number;
  festivalEditionId?: number;
}

export type IUpdateLocationPointDto = Partial<
  Pick<ICreateLocationPointDto, 'type' | 'label' | 'lat' | 'lng' | 'note'>
>;
