import { httpGet, httpPatch, httpPost } from '@/shared/api/http-client';
import type { IFestival, ICreateFestivalDto, IUpdateFestivalDto } from '../model';

export interface IPublicFestivalsFilter {
  category?: string;
  villageId?: number;
  year?: number;
  month?: number;
}

export function fetchActiveFestivals(filters?: IPublicFestivalsFilter): Promise<IFestival[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.villageId !== undefined) params.set('villageId', String(filters.villageId));
  if (filters?.year !== undefined) params.set('year', String(filters.year));
  if (filters?.month !== undefined) params.set('month', String(filters.month));
  const qs = params.toString();
  return httpGet<IFestival[]>(qs ? `/festivals?${qs}` : '/festivals');
}

export function fetchFestivalBySlug(slug: string): Promise<IFestival> {
  return httpGet<IFestival>(`/festivals/${slug}`);
}

export function fetchAllFestivals(): Promise<IFestival[]> {
  return httpGet<IFestival[]>('/admin/festivals');
}

export function fetchFestivalById(id: number): Promise<IFestival> {
  return httpGet<IFestival>(`/admin/festivals/${id}`);
}

export function createFestival(dto: ICreateFestivalDto): Promise<IFestival> {
  return httpPost<IFestival>('/admin/festivals', dto);
}

export function updateFestival(id: number, dto: IUpdateFestivalDto): Promise<IFestival> {
  return httpPatch<IFestival>(`/admin/festivals/${id}`, dto);
}

export function archiveFestival(id: number): Promise<IFestival> {
  return httpPatch<IFestival>(`/admin/festivals/${id}/archive`, {});
}
