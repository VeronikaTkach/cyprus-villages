export interface IVillageTranslation {
  locale: string;
  name: string;
  description: string | null;
}

export interface IVillage {
  id: number;
  slug: string;
  nameEl: string | null; // Greek name — always shown alongside the localised name
  district: string | null;
  region: string | null;
  centerLat: number | null;
  centerLng: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  translations: IVillageTranslation[];
}

export interface ICreateVillageDto {
  slug: string;
  nameEn: string;
  nameRu?: string;
  nameEl?: string;
  district?: string;
  region?: string;
  descriptionEn?: string;
  descriptionRu?: string;
  descriptionEl?: string;
  centerLat?: number;
  centerLng?: number;
}

export type IUpdateVillageDto = Partial<Omit<ICreateVillageDto, 'slug'>>;

// ── Helper ────────────────────────────────────────────────────────────────────

export function getTranslation(
  village: IVillage,
  locale: string,
  fallback = 'en',
): IVillageTranslation | undefined {
  return (
    village.translations.find((t) => t.locale === locale) ??
    village.translations.find((t) => t.locale === fallback)
  );
}
