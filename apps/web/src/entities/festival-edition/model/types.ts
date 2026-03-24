export type TFestivalEditionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'CANCELLED';

// ─── Full edition record (admin endpoints) ────────────────────────────────────

export interface IFestivalEdition {
  id: number;
  festivalId: number;
  year: number;
  startDate: string | null;
  endDate: string | null;
  isDateTba: boolean;
  startTime: string | null;
  endTime: string | null;
  status: TFestivalEditionStatus;
  publishedAt: string | null;
  lastVerifiedAt: string | null;
  venueName: string | null;
  venueLat: number | null;
  venueLng: number | null;
  parkingName: string | null;
  parkingLat: number | null;
  parkingLng: number | null;
  officialUrl: string | null;
  sourceUrl: string | null;
  sourceNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface ICreateFestivalEditionDto {
  festivalId: number;
  year: number;
  startDate?: string;
  endDate?: string;
  isDateTba?: boolean;
  startTime?: string;
  endTime?: string;
  status?: TFestivalEditionStatus;
  venueName?: string;
  venueLat?: number;
  venueLng?: number;
  parkingName?: string;
  parkingLat?: number;
  parkingLng?: number;
  officialUrl?: string;
  sourceUrl?: string;
  sourceNote?: string;
}

export type IUpdateFestivalEditionDto = Partial<
  Omit<ICreateFestivalEditionDto, 'festivalId' | 'year'>
> & {
  lastVerifiedAt?: string;
};
