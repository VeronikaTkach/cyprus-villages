'use client';

import { useRouter } from 'next/navigation';
import { FestivalForm } from '@/features/admin-festival';
import { useCreateFestival } from '@/entities/festival';
import type { ICreateFestivalDto } from '@/entities/festival';

export function FestivalCreateView() {
  const router = useRouter();
  const mutation = useCreateFestival();

  function handleSubmit(values: ICreateFestivalDto) {
    mutation.mutate(values, {
      onSuccess: (created) => {
        router.push(`/admin/festivals/${created.id}/edit`);
      },
    });
  }

  const errorMessage =
    mutation.isError && mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <FestivalForm
      mode="create"
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      error={errorMessage}
    />
  );
}
