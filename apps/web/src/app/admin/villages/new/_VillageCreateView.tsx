'use client';

import { useRouter } from 'next/navigation';
import { VillageForm } from '@/features/admin-village';
import { useCreateVillage } from '@/entities/village';
import type { ICreateVillageDto } from '@/entities/village';

export function VillageCreateView() {
  const router = useRouter();
  const mutation = useCreateVillage();

  function handleSubmit(values: ICreateVillageDto) {
    mutation.mutate(values, {
      onSuccess: (created) => {
        router.push(`/admin/villages/${created.id}/edit`);
      },
    });
  }

  const errorMessage =
    mutation.isError && mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <VillageForm
      mode="create"
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      error={errorMessage}
    />
  );
}
