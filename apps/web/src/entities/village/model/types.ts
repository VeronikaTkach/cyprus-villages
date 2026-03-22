export interface IVillage {
  id: number;
  slug: string;
  nameEn: string;
  nameRu: string | null;
  nameEl: string | null;
  district: string | null;
  region: string | null;
  descriptionEn: string | null;
  descriptionRu: string | null;
  descriptionEl: string | null;
  centerLat: number | null;
  centerLng: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
