import { httpGet, httpPatch, httpPost } from '@/shared/api/http-client';
import type { IFestivalEdition, ICreateFestivalEditionDto, IUpdateFestivalEditionDto } from '../model';

export function fetchEditionsForFestival(festivalId: number): Promise<IFestivalEdition[]> {
  return httpGet<IFestivalEdition[]>(`/admin/festival-editions/festival/${festivalId}`);
}

export function fetchEditionById(id: number): Promise<IFestivalEdition> {
  return httpGet<IFestivalEdition>(`/admin/festival-editions/${id}`);
}

export function createFestivalEdition(dto: ICreateFestivalEditionDto): Promise<IFestivalEdition> {
  return httpPost<IFestivalEdition>('/admin/festival-editions', dto);
}

export function updateFestivalEdition(
  id: number,
  dto: IUpdateFestivalEditionDto,
): Promise<IFestivalEdition> {
  return httpPatch<IFestivalEdition>(`/admin/festival-editions/${id}`, dto);
}

export function publishFestivalEdition(id: number): Promise<IFestivalEdition> {
  return httpPatch<IFestivalEdition>(`/admin/festival-editions/${id}/publish`, {});
}

export function archiveFestivalEdition(id: number): Promise<IFestivalEdition> {
  return httpPatch<IFestivalEdition>(`/admin/festival-editions/${id}/archive`, {});
}

export function cancelFestivalEdition(id: number): Promise<IFestivalEdition> {
  return httpPatch<IFestivalEdition>(`/admin/festival-editions/${id}/cancel`, {});
}
