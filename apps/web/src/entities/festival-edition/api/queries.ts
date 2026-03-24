'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { festivalKeys } from '@/entities/festival/api/queries';
import type { ICreateFestivalEditionDto, IUpdateFestivalEditionDto } from '../model';
import {
  archiveFestivalEdition,
  cancelFestivalEdition,
  createFestivalEdition,
  fetchEditionById,
  fetchEditionsForFestival,
  publishFestivalEdition,
  updateFestivalEdition,
} from './festival-editions.api';

export const editionKeys = {
  all: ['festival-editions'] as const,
  forFestival: (festivalId: number) =>
    [...editionKeys.all, 'festival', festivalId] as const,
  detail: (id: number) => [...editionKeys.all, 'detail', id] as const,
};

export function useEditionsForFestival(festivalId: number) {
  return useQuery({
    queryKey: editionKeys.forFestival(festivalId),
    queryFn: () => fetchEditionsForFestival(festivalId),
  });
}

export function useAdminEdition(id: number) {
  return useQuery({
    queryKey: editionKeys.detail(id),
    queryFn: () => fetchEditionById(id),
  });
}

export function useCreateFestivalEdition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ICreateFestivalEditionDto) => createFestivalEdition(dto),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({
        queryKey: editionKeys.forFestival(created.festivalId),
      });
      // Invalidate admin festival detail so embedded editions refresh
      void queryClient.invalidateQueries({
        queryKey: festivalKeys.adminDetail(created.festivalId),
      });
    },
  });
}

export function useUpdateFestivalEdition(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: IUpdateFestivalEditionDto) => updateFestivalEdition(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(editionKeys.detail(id), updated);
      void queryClient.invalidateQueries({
        queryKey: editionKeys.forFestival(updated.festivalId),
      });
      void queryClient.invalidateQueries({
        queryKey: festivalKeys.adminDetail(updated.festivalId),
      });
    },
  });
}

export function usePublishFestivalEdition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => publishFestivalEdition(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(editionKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({
        queryKey: editionKeys.forFestival(updated.festivalId),
      });
      void queryClient.invalidateQueries({
        queryKey: festivalKeys.adminDetail(updated.festivalId),
      });
    },
  });
}

export function useArchiveFestivalEdition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => archiveFestivalEdition(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(editionKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({
        queryKey: editionKeys.forFestival(updated.festivalId),
      });
      void queryClient.invalidateQueries({
        queryKey: festivalKeys.adminDetail(updated.festivalId),
      });
    },
  });
}

export function useCancelFestivalEdition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelFestivalEdition(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(editionKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({
        queryKey: editionKeys.forFestival(updated.festivalId),
      });
      void queryClient.invalidateQueries({
        queryKey: festivalKeys.adminDetail(updated.festivalId),
      });
    },
  });
}
