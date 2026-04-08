'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Divider, Group, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { SectionTitle, LoadingState } from '@/shared/ui';
import { FestivalForm } from '@/features/admin-festival';
import { CoverUpload } from '@/features/admin-media';
import {
  useAdminFestival,
  useUpdateFestival,
  useArchiveFestival,
  getFestivalTranslation,
} from '@/entities/festival';
import type { IUpdateFestivalDto } from '@/entities/festival';

interface IFestivalEditViewProps {
  id: number;
}

export function FestivalEditView({ id }: IFestivalEditViewProps) {
  const router = useRouter();
  const { data: festival, isLoading, isError } = useAdminFestival(id);
  const updateMutation = useUpdateFestival(id);
  const archiveMutation = useArchiveFestival();

  if (isLoading) return <LoadingState />;
  if (isError || !festival) return <Text c="red">Festival not found.</Text>;

  function handleSubmit(values: IUpdateFestivalDto) {
    updateMutation.mutate(values);
  }

  function handleArchive() {
    const enTitle = getFestivalTranslation(festival!, 'en')?.title ?? festival!.slug;
    if (!window.confirm(`Archive "${enTitle}"? It will no longer appear on the public site.`))
      return;
    archiveMutation.mutate(id, {
      onSuccess: () => router.push('/admin/festivals'),
    });
  }

  const updateError =
    updateMutation.isError && updateMutation.error instanceof Error
      ? updateMutation.error.message
      : null;

  const archiveError =
    archiveMutation.isError && archiveMutation.error instanceof Error
      ? archiveMutation.error.message
      : null;

  const enTitle = getFestivalTranslation(festival, 'en')?.title ?? festival.slug;

  return (
    <>
      <Group justify="space-between" align="flex-start" mb="lg">
        <SectionTitle title={`Edit: ${enTitle}`} />
        <Group gap="xs">
          <Button
            component={Link}
            href={`/admin/festivals/${id}/editions/new`}
            variant="outline"
            size="sm"
          >
            + Add edition
          </Button>
          {festival.isActive && (
            <Button
              variant="outline"
              color="red"
              size="sm"
              loading={archiveMutation.isPending}
              onClick={handleArchive}
            >
              Archive
            </Button>
          )}
        </Group>
      </Group>

      {archiveError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="md">
          {archiveError}
        </Alert>
      )}

      {!festival.isActive && (
        <Alert color="gray" variant="light" mb="md">
          This festival is archived and not visible on the public site.
        </Alert>
      )}

      <FestivalForm
        mode="edit"
        slug={festival.slug}
        defaultValues={{
          titleEn: getFestivalTranslation(festival, 'en')?.title,
          titleRu: getFestivalTranslation(festival, 'ru')?.title,
          titleEl: festival.titleEl ?? undefined,
          descriptionEn: getFestivalTranslation(festival, 'en')?.description ?? undefined,
          descriptionRu: getFestivalTranslation(festival, 'ru')?.description ?? undefined,
          descriptionEl: getFestivalTranslation(festival, 'el')?.description ?? undefined,
          category: festival.category ?? undefined,
        }}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
        error={updateError}
      />

      <Divider my="xl" />
      <CoverUpload festivalId={id} label="Cover image" />

      {festival.editions.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <SectionTitle title="Editions" />
          {festival.editions.map((edition) => (
            <Group key={edition.id} justify="space-between" py="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
              <Text fw={500}>{edition.year}</Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">{edition.status}</Text>
                <Button
                  component={Link}
                  href={`/admin/festival-editions/${edition.id}/edit`}
                  variant="subtle"
                  size="xs"
                >
                  Edit
                </Button>
              </Group>
            </Group>
          ))}
        </div>
      )}
    </>
  );
}
