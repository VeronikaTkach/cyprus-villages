import { httpGet, httpUpload } from '@/shared/api/http-client';
import { appConfig } from '@/shared/config';
import type { IMedia } from '../model';

interface IListMediaParams {
  villageId?: number;
  festivalId?: number;
  festivalEditionId?: number;
}

export function fetchMediaByOwner(params: IListMediaParams): Promise<IMedia[]> {
  const qs = new URLSearchParams();
  if (params.villageId !== undefined) qs.set('villageId', String(params.villageId));
  if (params.festivalId !== undefined) qs.set('festivalId', String(params.festivalId));
  if (params.festivalEditionId !== undefined)
    qs.set('festivalEditionId', String(params.festivalEditionId));

  return httpGet<IMedia[]>(`/admin/media?${qs.toString()}`);
}

export interface IUploadCoverParams {
  file: File;
  villageId?: number;
  festivalId?: number;
  festivalEditionId?: number;
  alt?: string;
}

export function uploadCover(params: IUploadCoverParams): Promise<IMedia> {
  const qs = new URLSearchParams();
  if (params.villageId !== undefined) qs.set('villageId', String(params.villageId));
  if (params.festivalId !== undefined) qs.set('festivalId', String(params.festivalId));
  if (params.festivalEditionId !== undefined)
    qs.set('festivalEditionId', String(params.festivalEditionId));
  if (params.alt) qs.set('alt', params.alt);

  const formData = new FormData();
  formData.append('file', params.file);

  return httpUpload<IMedia>(`/admin/media/upload?${qs.toString()}`, formData);
}

export async function deleteMedia(id: number): Promise<void> {
  // DELETE returns 204 No Content — use raw fetch to avoid .json() on empty body
  const res = await fetch(`${appConfig.apiUrl}/admin/media/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
}
