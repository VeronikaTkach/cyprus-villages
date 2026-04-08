import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMediaByOwner, uploadCover, deleteMedia } from './media.api';
import type { IUploadCoverParams } from './media.api';

export function useMediaByOwner(params: {
  villageId?: number;
  festivalId?: number;
  festivalEditionId?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'media', params],
    queryFn: () => fetchMediaByOwner(params),
    enabled:
      params.villageId !== undefined ||
      params.festivalId !== undefined ||
      params.festivalEditionId !== undefined,
  });
}

export function useUploadCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IUploadCoverParams) => uploadCover(params),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [
          'admin',
          'media',
          {
            villageId: variables.villageId,
            festivalId: variables.festivalId,
            festivalEditionId: variables.festivalEditionId,
          },
        ],
      });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMedia(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
}
