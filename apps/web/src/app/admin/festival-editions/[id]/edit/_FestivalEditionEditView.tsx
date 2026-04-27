'use client';

import { useRouter } from 'next/navigation';
import { useSuccessMessage } from '@/shared/lib/useSuccessMessage';
import Link from 'next/link';
import { Alert, Badge, Button, Group, Text } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { SectionTitle, LoadingState } from '@/shared/ui';
import { FestivalEditionForm } from '@/features/admin-festival';
import { LocationPointsSection } from '@/features/admin-location-point';
import {
  useAdminEdition,
  useUpdateFestivalEdition,
  usePublishFestivalEdition,
  useArchiveFestivalEdition,
  useCancelFestivalEdition,
} from '@/entities/festival-edition';
import { EDITION_STATUS_LABELS, EDITION_STATUS_COLORS } from '@/entities/festival';
import type { IUpdateFestivalEditionDto } from '@/entities/festival-edition';

interface IFestivalEditionEditViewProps {
  id: number;
}

export function FestivalEditionEditView({ id }: IFestivalEditionEditViewProps) {
  const router = useRouter();
  const { data: edition, isLoading, isError } = useAdminEdition(id);
  const updateMutation = useUpdateFestivalEdition(id);
  const publishMutation = usePublishFestivalEdition();
  const archiveMutation = useArchiveFestivalEdition();
  const cancelMutation = useCancelFestivalEdition();

  const { message: successMessage, show: showSuccess } = useSuccessMessage();

  if (isLoading) return <LoadingState />;
  if (isError || !edition) return <Text c="red">Edition not found.</Text>;

  function handleSubmit(values: IUpdateFestivalEditionDto) {
    updateMutation.mutate(values, {
      onSuccess: () => showSuccess('Changes saved.'),
    });
  }

  function handlePublish() {
    if (!window.confirm('Publish this edition? It will become visible on the public site.')) return;
    publishMutation.mutate(id, {
      onSuccess: () => showSuccess('Edition published.'),
    });
  }

  function handleArchive() {
    if (!window.confirm('Archive this edition?')) return;
    archiveMutation.mutate(id, {
      onSuccess: () => router.push(`/admin/festivals/${edition!.festivalId}/edit`),
    });
  }

  function handleCancel() {
    if (!window.confirm('Cancel this edition?')) return;
    cancelMutation.mutate(id, {
      onSuccess: () => showSuccess('Edition cancelled.'),
    });
  }

  const updateError =
    updateMutation.isError && updateMutation.error instanceof Error
      ? updateMutation.error.message
      : null;

  const actionError = [publishMutation, archiveMutation, cancelMutation]
    .find((m) => m.isError)
    ?.error;
  const actionErrorMessage =
    actionError instanceof Error ? actionError.message : null;

  return (
    <>
      <Group justify="space-between" align="flex-start" mb="lg">
        <Group align="center" gap="sm">
          <SectionTitle title={`Edition ${edition.year}`} />
          <Badge
            color={EDITION_STATUS_COLORS[edition.status]}
            variant="light"
          >
            {EDITION_STATUS_LABELS[edition.status]}
          </Badge>
        </Group>
        <Group gap="xs">
          <Button
            component={Link}
            href={`/admin/festivals/${edition.festivalId}/edit`}
            variant="subtle"
            size="sm"
          >
            ← Festival
          </Button>
          {edition.status === 'DRAFT' && (
            <Button
              variant="outline"
              color="teal"
              size="sm"
              loading={publishMutation.isPending}
              onClick={handlePublish}
            >
              Publish
            </Button>
          )}
          {(edition.status === 'DRAFT' || edition.status === 'PUBLISHED') && (
            <Button
              variant="outline"
              color="orange"
              size="sm"
              loading={cancelMutation.isPending}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
          {edition.status !== 'ARCHIVED' && (
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

      {actionErrorMessage && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="md">
          {actionErrorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert icon={<IconCheck size={16} />} color="teal" variant="light" mb="md">
          {successMessage}
        </Alert>
      )}

      <FestivalEditionForm
        mode="edit"
        editionId={id}
        year={edition.year}
        defaultValues={{
          isDateTba: edition.isDateTba ?? false,
          startDate: edition.startDate ?? undefined,
          endDate: edition.endDate ?? undefined,
          startTime: edition.startTime ?? undefined,
          endTime: edition.endTime ?? undefined,
          venueName: edition.venueName ?? undefined,
          venueLat: edition.venueLat ?? undefined,
          venueLng: edition.venueLng ?? undefined,
          parkingName: edition.parkingName ?? undefined,
          parkingLat: edition.parkingLat ?? undefined,
          parkingLng: edition.parkingLng ?? undefined,
          officialUrl: edition.officialUrl ?? undefined,
          sourceUrl: edition.sourceUrl ?? undefined,
          sourceNote: edition.sourceNote ?? undefined,
        }}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
        error={updateError}
      />

      <LocationPointsSection context={{ type: 'edition', festivalEditionId: id }} />
    </>
  );
}
