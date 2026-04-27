'use client';

import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { SectionTitle, LoadingState, EmptyState } from '@/shared/ui';
import {
  usePointsByVillage,
  usePointsByFestivalEdition,
  useCreateLocationPoint,
  useUpdateLocationPoint,
  useArchiveLocationPoint,
} from '@/entities/location-point';
import type { ILocationPoint, ICreateLocationPointDto, IUpdateLocationPointDto } from '@/entities/location-point';
import { LocationPointForm } from './LocationPointForm';

// ─── Type badge colors ─────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  VENUE: 'blue',
  PARKING: 'orange',
  MEETING_POINT: 'teal',
  WC: 'gray',
  SHUTTLE: 'violet',
  VIEWPOINT: 'green',
  OTHER: 'gray',
};

const TYPE_LABELS: Record<string, string> = {
  VENUE: 'Venue',
  PARKING: 'Parking',
  MEETING_POINT: 'Meeting point',
  WC: 'WC',
  SHUTTLE: 'Shuttle',
  VIEWPOINT: 'Viewpoint',
  OTHER: 'Other',
};

// ─── Modal state hook ──────────────────────────────────────────────────────────

function useLocationPointModal() {
  const [createOpen, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editingPoint, setEditingPoint] = useState<ILocationPoint | null>(null);

  return {
    createOpen,
    openCreate,
    closeCreate,
    editingPoint,
    openEdit: setEditingPoint,
    closeEdit: () => setEditingPoint(null),
  };
}

// ─── Context ───────────────────────────────────────────────────────────────────

type TContext =
  | { type: 'village'; villageId: number }
  | { type: 'edition'; festivalEditionId: number };

interface ILocationPointsSectionProps {
  context: TContext;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function LocationPointsSection({ context }: ILocationPointsSectionProps) {
  const {
    createOpen: createModalOpen,
    openCreate,
    closeCreate,
    editingPoint,
    openEdit,
    closeEdit,
  } = useLocationPointModal();

  // ── Data fetching ──────────────────────────────────────────

  const villageQuery = usePointsByVillage(
    context.type === 'village' ? context.villageId : 0,
  );
  const editionQuery = usePointsByFestivalEdition(
    context.type === 'edition' ? context.festivalEditionId : 0,
  );

  const { data: points, isLoading } = context.type === 'village' ? villageQuery : editionQuery;

  // ── Mutations ──────────────────────────────────────────────

  const createMutation = useCreateLocationPoint();
  const updateMutation = useUpdateLocationPoint(editingPoint?.id ?? 0);

  const archiveMutation = useArchiveLocationPoint();

  // ── Handlers ──────────────────────────────────────────────

  function handleCreate(dto: ICreateLocationPointDto) {
    createMutation.mutate(dto, {
      onSuccess: () => closeCreate(),
    });
  }

  function handleUpdate(dto: IUpdateLocationPointDto) {
    if (!editingPoint) return;
    updateMutation.mutate(dto, {
      onSuccess: () => closeEdit(),
    });
  }

  function handleArchive(point: ILocationPoint) {
    if (!window.confirm(`Archive "${point.label}"? It will no longer appear on public maps.`)) return;
    archiveMutation.mutate(point.id);
  }

  const createError =
    createMutation.isError && createMutation.error instanceof Error
      ? createMutation.error.message
      : null;

  const updateError =
    updateMutation.isError && updateMutation.error instanceof Error
      ? updateMutation.error.message
      : null;

  const archiveError =
    archiveMutation.isError && archiveMutation.error instanceof Error
      ? archiveMutation.error.message
      : null;

  const formContext =
    context.type === 'village'
      ? { villageId: context.villageId }
      : { festivalEditionId: context.festivalEditionId };

  // ── Render ─────────────────────────────────────────────────

  return (
    <div style={{ marginTop: 32 }}>
      <Divider mb="lg" />

      <Group justify="space-between" align="center" mb="md">
        <SectionTitle title="Location points" />
        <Button
          size="sm"
          variant="outline"
          leftSection={<IconPlus size={14} />}
          onClick={openCreate}
        >
          Add point
        </Button>
      </Group>

      {archiveError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="md">
          {archiveError}
        </Alert>
      )}

      {isLoading && <LoadingState />}

      {!isLoading && (!points || points.length === 0) && (
        <EmptyState description="No location points yet." />
      )}

      {!isLoading && points && points.length > 0 && (
        <Stack gap={0}>
          {points.map((point) => (
            <Group
              key={point.id}
              justify="space-between"
              py="sm"
              style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
            >
              <Group gap="sm">
                <Badge
                  color={TYPE_COLORS[point.type] ?? 'gray'}
                  variant="light"
                  size="sm"
                >
                  {TYPE_LABELS[point.type] ?? point.type}
                </Badge>
                <Text fw={500}>{point.label}</Text>
                <Text size="xs" c="dimmed">
                  {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </Text>
                {!point.isActive && (
                  <Badge color="gray" variant="outline" size="xs">
                    archived
                  </Badge>
                )}
              </Group>

              <Group gap="xs">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => openEdit(point)}
                >
                  Edit
                </Button>
                {point.isActive && (
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    loading={archiveMutation.isPending && archiveMutation.variables === point.id}
                    onClick={() => handleArchive(point)}
                  >
                    Archive
                  </Button>
                )}
              </Group>
            </Group>
          ))}
        </Stack>
      )}

      {/* Create modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => {
          closeCreate();
          createMutation.reset();
        }}
        title="Add location point"
        size="md"
      >
        <LocationPointForm
          mode="create"
          context={formContext}
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
          error={createError}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        opened={editingPoint !== null}
        onClose={() => {
          closeEdit();
          updateMutation.reset();
        }}
        title={editingPoint ? `Edit: ${editingPoint.label}` : 'Edit point'}
        size="md"
      >
        {editingPoint && (
          <LocationPointForm
            mode="edit"
            point={editingPoint}
            onSubmit={handleUpdate}
            isPending={updateMutation.isPending}
            error={updateError}
          />
        )}
      </Modal>
    </div>
  );
}
