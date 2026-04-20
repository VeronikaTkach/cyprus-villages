'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Divider, Group, Text } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { SectionTitle, LoadingState } from '@/shared/ui';
import { VillageForm } from '@/features/admin-village';
import { LocationPointsSection } from '@/features/admin-location-point';
import { CoverUpload } from '@/features/admin-media';
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

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showSuccess(message: string) {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setSuccessMessage(message);
    hideTimerRef.current = setTimeout(() => setSuccessMessage(null), 2500);
  }

  if (isLoading) return <LoadingState />;
  if (isError || !village) return <Text c="red">Village not found.</Text>;

  function getT(locale: string) {
    return village!.translations.find((t) => t.locale === locale);
  }

  function handleSubmit(values: IUpdateVillageDto) {
    setSuccessMessage(null);
    updateMutation.mutate(values, {
      onSuccess: () => showSuccess('Changes saved.'),
    });
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
        <Group gap="xs">
          <Button
            component={Link}
            href="/admin/villages"
            variant="subtle"
            size="sm"
          >
            ← Villages
          </Button>
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
      </Group>

      {archiveError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="md">
          {archiveError}
        </Alert>
      )}

      {successMessage && (
        <Alert icon={<IconCheck size={16} />} color="teal" variant="light" mb="md">
          {successMessage}
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

      <Divider my="xl" />
      <CoverUpload villageId={id} label="Cover image" />

      <LocationPointsSection context={{ type: 'village', villageId: id }} />
    </>
  );
}
