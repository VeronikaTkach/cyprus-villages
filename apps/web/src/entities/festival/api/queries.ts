'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ICreateFestivalDto, IUpdateFestivalDto } from '../model';
import {
  archiveFestival,
  createFestival,
  fetchActiveFestivals,
  fetchAllFestivals,
  fetchFestivalById,
  fetchFestivalBySlug,
  updateFestival,
} from './festivals.api';

export const festivalKeys = {
  all: ['festivals'] as const,
  publicList: () => [...festivalKeys.all, 'public', 'list'] as const,
  publicDetail: (slug: string) => [...festivalKeys.all, 'public', 'detail', slug] as const,
  adminList: () => [...festivalKeys.all, 'admin', 'list'] as const,
  adminDetail: (id: number) => [...festivalKeys.all, 'admin', 'detail', id] as const,
};

export function usePublicFestivals() {
  return useQuery({
    queryKey: festivalKeys.publicList(),
    queryFn: fetchActiveFestivals,
  });
}

export function usePublicFestival(slug: string) {
  return useQuery({
    queryKey: festivalKeys.publicDetail(slug),
    queryFn: () => fetchFestivalBySlug(slug),
  });
}

export function useAdminFestivals() {
  return useQuery({
    queryKey: festivalKeys.adminList(),
    queryFn: fetchAllFestivals,
  });
}

export function useAdminFestival(id: number) {
  return useQuery({
    queryKey: festivalKeys.adminDetail(id),
    queryFn: () => fetchFestivalById(id),
  });
}

export function useCreateFestival() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ICreateFestivalDto) => createFestival(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: festivalKeys.adminList() });
    },
  });
}

export function useUpdateFestival(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: IUpdateFestivalDto) => updateFestival(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(festivalKeys.adminDetail(id), updated);
      void queryClient.invalidateQueries({ queryKey: festivalKeys.adminList() });
    },
  });
}

export function useArchiveFestival() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => archiveFestival(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(festivalKeys.adminDetail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: festivalKeys.adminList() });
    },
  });
}
