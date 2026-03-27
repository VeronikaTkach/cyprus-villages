'use client';

import { useRouter } from 'next/navigation';
import { Alert, Button, Group, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { SectionTitle, LoadingState } from '@/shared/ui';
import { VillageForm } from '@/features/admin-village';
import { LocationPointsSection } from '@/features/admin-location-point';
import { useAdminVillage, useUpdateVillage, useArchiveVillage } from '@/entities/village';
import type { IUpdateVillageDto } from '@/entities/village';

interface IVillageEditViewProps {
  id: number;
}

export function VillageEditView({ id }: IVillageEditViewProps) {
  const router = useRouter();
  const { data: village, isLoading, isError } = useAdminVillage(id);
  const updateMutation = useUpdateVillage(id);
  const archiveMutation = useArchiveVillage();

  if (isLoading) return <LoadingState />;
  if (isError || !village) return <Text c="red">Village not found.</Text>;

  function getT(locale: string) {
    return village!.translations.find((t) => t.locale === locale);
  }

  function handleSubmit(values: IUpdateVillageDto) {
    updateMutation.mutate(values);
  }

  function handleArchive() {
    const enName = getT('en')?.name ?? village!.slug;
    if (!window.confirm(`Archive "${enName}"? It will no longer appear on the public site.`))
      return;
    archiveMutation.mutate(id, {
      onSuccess: () => router.push('/admin/villages'),
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

  return (
    <>
      <Group justify="space-between" align="flex-start" mb="lg">
        <SectionTitle title={`Edit: ${getT('en')?.name ?? village.slug}`} />
        {village.isActive && (
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

      {archiveError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="md">
          {archiveError}
        </Alert>
      )}

      {!village.isActive && (
        <Alert color="gray" variant="light" mb="md">
          This village is archived and not visible on the public site.
        </Alert>
      )}

      <VillageForm
        mode="edit"
        slug={village.slug}
        defaultValues={{
          nameEn: getT('en')?.name,
          nameRu: getT('ru')?.name,
          nameEl: getT('el')?.name ?? village.nameEl ?? undefined,
          descriptionEn: getT('en')?.description ?? undefined,
          descriptionRu: getT('ru')?.description ?? undefined,
          descriptionEl: getT('el')?.description ?? undefined,
          district: village.district ?? undefined,
          region: village.region ?? undefined,
          centerLat: village.centerLat ?? undefined,
          centerLng: village.centerLng ?? undefined,
        }}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
        error={updateError}
      />

      <LocationPointsSection context={{ type: 'village', villageId: id }} />
    </>
  );
}
