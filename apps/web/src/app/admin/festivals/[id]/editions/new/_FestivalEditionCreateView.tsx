'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Group, Text } from '@mantine/core';
import { LoadingState } from '@/shared/ui';
import { FestivalEditionForm } from '@/features/admin-festival';
import { useAdminFestival, getFestivalTranslation } from '@/entities/festival';
import { useCreateFestivalEdition } from '@/entities/festival-edition';
import type { ICreateFestivalEditionDto } from '@/entities/festival-edition';

interface IFestivalEditionCreateViewProps {
  festivalId: number;
}

export function FestivalEditionCreateView({ festivalId }: IFestivalEditionCreateViewProps) {
  const router = useRouter();
  const { data: festival, isLoading, isError } = useAdminFestival(festivalId);
  const mutation = useCreateFestivalEdition();

  if (isLoading) return <LoadingState />;
  if (isError || !festival) return <Text c="red">Festival not found.</Text>;

  function handleSubmit(values: ICreateFestivalEditionDto) {
    mutation.mutate(values, {
      onSuccess: (created) => {
        router.push(`/admin/festival-editions/${created.id}/edit`);
      },
    });
  }

  const errorMessage =
    mutation.isError && mutation.error instanceof Error ? mutation.error.message : null;

  const enTitle = getFestivalTranslation(festival, 'en')?.title ?? festival.slug;

  return (
    <>
      <Group justify="space-between" align="center" mb="lg">
        <Text size="sm" c="dimmed">
          Festival: <strong>{festival.titleEl ?? enTitle}</strong>
        </Text>
        <Button
          component={Link}
          href={`/admin/festivals/${festivalId}/edit`}
          variant="subtle"
          size="sm"
        >
          ← Cancel
        </Button>
      </Group>
      <FestivalEditionForm
        mode="create"
        festivalId={festivalId}
        onSubmit={handleSubmit}
        isPending={mutation.isPending}
        error={errorMessage}
      />
    </>
  );
}
