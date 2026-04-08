export type TMediaKind = 'GALLERY' | 'COVER';

export interface IMedia {
  id: number;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  kind: TMediaKind;
  villageId: number | null;
  festivalId: number | null;
  festivalEditionId: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Minimal shape embedded in village/festival detail responses. */
export interface IMediaBrief {
  id: number;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}
