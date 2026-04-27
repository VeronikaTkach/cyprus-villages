'use client';

import { useRouter } from 'next/navigation';
import { FestivalForm } from '@/features/admin-festival';
import { useCreateFestival } from '@/entities/festival';
import type { ICreateFestivalDto } from '@/entities/festival';
import { useAdminVillages } from '@/entities/village';

export function FestivalCreateView() {
  const router = useRouter();
  const mutation = useCreateFestival();
  const { data: villages } = useAdminVillages();

  const villageOptions = (villages ?? []).map((v) => ({
    value: String(v.id),
    label: v.nameEl
      ? `${v.nameEl} — ${v.translations.find((t) => t.locale === 'en')?.name ?? v.slug}`
      : (v.translations.find((t) => t.locale === 'en')?.name ?? v.slug),
  }));

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
      villageOptions={villageOptions}
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      error={errorMessage}
    />
  );
}
