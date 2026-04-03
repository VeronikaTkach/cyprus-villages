// ─── Domain enums ─────────────────────────────────────────────────────────────

export type TFestivalCategory =
  | 'WINE'
  | 'FOOD'
  | 'CULTURAL'
  | 'RELIGIOUS'
  | 'MUSIC'
  | 'ARTS'
  | 'SPORT'
  | 'OTHER';

export type TFestivalEditionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'CANCELLED';

// ─── Festival translation ──────────────────────────────────────────────────────

export interface IFestivalTranslation {
  locale: string;
  title: string;
  description: string | null;
}

// ─── Edition brief (embedded in festival responses) ───────────────────────────

export interface IFestivalEditionBrief {
  id: number;
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

// ─── Festival ─────────────────────────────────────────────────────────────────

export interface IFestival {
  id: number;
  slug: string;
  villageId: number;
  /** Greek title — always displayed prominently above the localised title */
  titleEl: string | null;
  category: TFestivalCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  translations: IFestivalTranslation[];
  editions: IFestivalEditionBrief[];
  /**
   * Presentation helper set by the list endpoint.
   * The edition the UI should use for timeline grouping, date display, and
   * Soon/Ongoing badges — respects active year/month filters.
   * Present on list responses; absent on detail (slug) responses.
   */
  displayEdition?: IFestivalEditionBrief | null;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface ICreateFestivalDto {
  slug: string;
  villageId: number;
  titleEn: string;
  titleRu?: string;
  titleEl?: string;
  descriptionEn?: string;
  descriptionRu?: string;
  descriptionEl?: string;
  category?: TFestivalCategory;
}

export type IUpdateFestivalDto = Partial<Omit<ICreateFestivalDto, 'slug' | 'villageId'>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getFestivalTranslation(
  festival: IFestival,
  locale: string,
  fallback = 'en',
): IFestivalTranslation | undefined {
  return (
    festival.translations.find((t) => t.locale === locale) ??
    festival.translations.find((t) => t.locale === fallback)
  );
}

/** Returns the most recent edition (year desc order from API), or null. */
export function getLatestEdition(festival: IFestival): IFestivalEditionBrief | null {
  return festival.editions[0] ?? null;
}
