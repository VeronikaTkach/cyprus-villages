import { httpGet, httpPost, httpPatch } from '@/shared/api/http-client';
import type {
  IMapPoint,
  ILocationPoint,
  ICreateLocationPointDto,
  IUpdateLocationPointDto,
} from '../model/types';

// ── Public ────────────────────────────────────────────────────

export function fetchPublicMapPoints(): Promise<IMapPoint[]> {
  return httpGet<IMapPoint[]>('/map/points');
}

// ── Admin ─────────────────────────────────────────────────────

export function fetchPointsByVillage(villageId: number): Promise<ILocationPoint[]> {
  return httpGet<ILocationPoint[]>(`/admin/location-points/village/${villageId}`);
}

export function fetchPointsByFestivalEdition(
  festivalEditionId: number,
): Promise<ILocationPoint[]> {
  return httpGet<ILocationPoint[]>(
    `/admin/location-points/festival-edition/${festivalEditionId}`,
  );
}

export function fetchLocationPointById(id: number): Promise<ILocationPoint> {
  return httpGet<ILocationPoint>(`/admin/location-points/${id}`);
}

export function createLocationPoint(dto: ICreateLocationPointDto): Promise<ILocationPoint> {
  return httpPost<ILocationPoint>('/admin/location-points', dto);
}

export function updateLocationPoint(
  id: number,
  dto: IUpdateLocationPointDto,
): Promise<ILocationPoint> {
  return httpPatch<ILocationPoint>(`/admin/location-points/${id}`, dto);
}

export function archiveLocationPoint(id: number): Promise<ILocationPoint> {
  return httpPatch<ILocationPoint>(`/admin/location-points/${id}/archive`, {});
}
