import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPublicMapPoints,
  fetchPointsByVillage,
  fetchPointsByFestivalEdition,
  fetchLocationPointById,
  createLocationPoint,
  updateLocationPoint,
  archiveLocationPoint,
} from './location-points.api';

export const locationPointKeys = {
  publicMap: () => ['location-points', 'public', 'map'] as const,
  byVillage: (villageId: number) => ['location-points', 'admin', 'village', villageId] as const,
  byEdition: (editionId: number) => ['location-points', 'admin', 'edition', editionId] as const,
  detail: (id: number) => ['location-points', 'admin', 'detail', id] as const,
};

// ── Public ────────────────────────────────────────────────────

export function usePublicMapPoints() {
  return useQuery({
    queryKey: locationPointKeys.publicMap(),
    queryFn: fetchPublicMapPoints,
  });
}

// ── Admin reads ───────────────────────────────────────────────

export function usePointsByVillage(villageId: number) {
  return useQuery({
    queryKey: locationPointKeys.byVillage(villageId),
    queryFn: () => fetchPointsByVillage(villageId),
    enabled: villageId > 0,
  });
}

export function usePointsByFestivalEdition(festivalEditionId: number) {
  return useQuery({
    queryKey: locationPointKeys.byEdition(festivalEditionId),
    queryFn: () => fetchPointsByFestivalEdition(festivalEditionId),
    enabled: festivalEditionId > 0,
  });
}

export function useAdminLocationPoint(id: number) {
  return useQuery({
    queryKey: locationPointKeys.detail(id),
    queryFn: () => fetchLocationPointById(id),
    enabled: id > 0,
  });
}

// ── Admin mutations ───────────────────────────────────────────

export function useCreateLocationPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLocationPoint,
    onSuccess: (point) => {
      if (point.villageId) {
        void queryClient.invalidateQueries({
          queryKey: locationPointKeys.byVillage(point.villageId),
        });
      }
      if (point.festivalEditionId) {
        void queryClient.invalidateQueries({
          queryKey: locationPointKeys.byEdition(point.festivalEditionId),
        });
      }
      void queryClient.invalidateQueries({ queryKey: locationPointKeys.publicMap() });
    },
  });
}

export function useUpdateLocationPoint(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Parameters<typeof updateLocationPoint>[1]) =>
      updateLocationPoint(id, dto),
    onSuccess: (point) => {
      queryClient.setQueryData(locationPointKeys.detail(id), point);
      void queryClient.invalidateQueries({ queryKey: locationPointKeys.publicMap() });
    },
  });
}

export function useArchiveLocationPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveLocationPoint,
    onSuccess: (point) => {
      queryClient.setQueryData(locationPointKeys.detail(point.id), point);
      if (point.villageId) {
        void queryClient.invalidateQueries({
          queryKey: locationPointKeys.byVillage(point.villageId),
        });
      }
      if (point.festivalEditionId) {
        void queryClient.invalidateQueries({
          queryKey: locationPointKeys.byEdition(point.festivalEditionId),
        });
      }
      void queryClient.invalidateQueries({ queryKey: locationPointKeys.publicMap() });
    },
  });
}
