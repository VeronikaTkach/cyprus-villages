import { httpGet, httpPatch, httpPost } from '@/shared/api/http-client';
import type { IVillage, ICreateVillageDto, IUpdateVillageDto } from '../model';

export function fetchActiveVillages(): Promise<IVillage[]> {
  return httpGet<IVillage[]>('/villages');
}

export function fetchVillageBySlug(slug: string): Promise<IVillage> {
  return httpGet<IVillage>(`/villages/${slug}`);
}

export function fetchAllVillages(): Promise<IVillage[]> {
  return httpGet<IVillage[]>('/admin/villages');
}

export function fetchVillageById(id: number): Promise<IVillage> {
  return httpGet<IVillage>(`/admin/villages/${id}`);
}

export function createVillage(dto: ICreateVillageDto): Promise<IVillage> {
  return httpPost<IVillage>('/admin/villages', dto);
}

export function updateVillage(id: number, dto: IUpdateVillageDto): Promise<IVillage> {
  return httpPatch<IVillage>(`/admin/villages/${id}`, dto);
}

export function archiveVillage(id: number): Promise<IVillage> {
  return httpPatch<IVillage>(`/admin/villages/${id}/archive`, {});
}
