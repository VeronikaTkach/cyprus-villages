'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ICreateVillageDto, IUpdateVillageDto } from '../model';
import {
  archiveVillage,
  createVillage,
  fetchActiveVillages,
  fetchAllVillages,
  fetchVillageById,
  fetchVillageBySlug,
  updateVillage,
} from './villages.api';

export const villageKeys = {
  all: ['villages'] as const,
  publicList: () => [...villageKeys.all, 'public', 'list'] as const,
  publicDetail: (slug: string) => [...villageKeys.all, 'public', 'detail', slug] as const,
  adminList: () => [...villageKeys.all, 'admin', 'list'] as const,
  adminDetail: (id: number) => [...villageKeys.all, 'admin', 'detail', id] as const,
};

export function usePublicVillages() {
  return useQuery({
    queryKey: villageKeys.publicList(),
    queryFn: fetchActiveVillages,
  });
}

export function usePublicVillage(slug: string) {
  return useQuery({
    queryKey: villageKeys.publicDetail(slug),
    queryFn: () => fetchVillageBySlug(slug),
  });
}

export function useAdminVillages() {
  return useQuery({
    queryKey: villageKeys.adminList(),
    queryFn: fetchAllVillages,
  });
}

export function useAdminVillage(id: number) {
  return useQuery({
    queryKey: villageKeys.adminDetail(id),
    queryFn: () => fetchVillageById(id),
  });
}

export function useCreateVillage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ICreateVillageDto) => createVillage(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: villageKeys.adminList() });
    },
  });
}

export function useUpdateVillage(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: IUpdateVillageDto) => updateVillage(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(villageKeys.adminDetail(id), updated);
      void queryClient.invalidateQueries({ queryKey: villageKeys.adminList() });
    },
  });
}

export function useArchiveVillage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => archiveVillage(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(villageKeys.adminDetail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: villageKeys.adminList() });
    },
  });
}
