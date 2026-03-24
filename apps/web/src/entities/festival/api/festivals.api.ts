import { httpGet, httpPatch, httpPost } from '@/shared/api/http-client';
import type { IFestival, ICreateFestivalDto, IUpdateFestivalDto } from '../model';

export function fetchActiveFestivals(): Promise<IFestival[]> {
  return httpGet<IFestival[]>('/festivals');
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
