'use client';

import Link from 'next/link';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  Table,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { EmptyState, LoadingState } from '@/shared/ui';
import {
  useAdminFestivals,
  useArchiveFestival,
  getFestivalTranslation,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/entities/festival';

export function AdminFestivalsListView() {
  const { data: festivals, isLoading, isError } = useAdminFestivals();
  const archiveMutation = useArchiveFestival();

  if (isLoading) return <LoadingState />;
  if (isError) return <Text c="red">Failed to load festivals.</Text>;

  function handleArchive(id: number, title: string) {
    if (!window.confirm(`Archive "${title}"? It will no longer appear on the public site.`)) return;
    archiveMutation.mutate(id);
  }

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button component={Link} href="/admin/festivals/new" leftSection={<IconPlus size={16} />}>
          New festival
        </Button>
      </Group>

      {archiveMutation.isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="md">
          {archiveMutation.error instanceof Error
            ? archiveMutation.error.message
            : 'Failed to archive festival.'}
        </Alert>
      )}

      {!festivals?.length ? (
        <EmptyState description="No festivals yet. Create one to get started." />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Slug</Table.Th>
              <Table.Th>Title (EN)</Table.Th>
              <Table.Th>Greek title</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Editions</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {festivals.map((festival) => {
              const enTitle = getFestivalTranslation(festival, 'en')?.title ?? '—';
              return (
                <Table.Tr key={festival.id}>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{festival.id}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" ff="monospace">{festival.slug}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Anchor component={Link} href={`/admin/festivals/${festival.id}/edit`} size="sm" fw={500}>
                      {enTitle}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{festival.titleEl ?? '—'}</Text>
                  </Table.Td>
                  <Table.Td>
                    {festival.category ? (
                      <Badge color={CATEGORY_COLORS[festival.category]} variant="light" size="sm">
                        {CATEGORY_LABELS[festival.category]}
                      </Badge>
                    ) : (
                      <Text size="sm" c="dimmed">—</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{festival.editions.length}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={festival.isActive ? 'teal' : 'gray'} variant="light" size="sm">
                      {festival.isActive ? 'Active' : 'Archived'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <Button
                        component={Link}
                        href={`/admin/festivals/${festival.id}/edit`}
                        variant="subtle"
                        size="xs"
                      >
                        Edit
                      </Button>
                      <Button
                        component={Link}
                        href={`/admin/festivals/${festival.id}/editions/new`}
                        variant="subtle"
                        size="xs"
                        color="blue"
                      >
                        + Edition
                      </Button>
                      {festival.isActive && (
                        <Button
                          variant="subtle"
                          color="red"
                          size="xs"
                          loading={
                            archiveMutation.isPending &&
                            archiveMutation.variables === festival.id
                          }
                          onClick={() => handleArchive(festival.id, enTitle)}
                        >
                          Archive
                        </Button>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </>
  );
}
