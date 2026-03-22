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
import { useAdminVillages, useArchiveVillage } from '@/entities/village';

export function AdminVillagesListView() {
  const { data: villages, isLoading, isError } = useAdminVillages();
  const archiveMutation = useArchiveVillage();

  if (isLoading) return <LoadingState />;
  if (isError) return <Text c="red">Failed to load villages.</Text>;

  function handleArchive(id: number, name: string) {
    if (!window.confirm(`Archive "${name}"? It will no longer appear on the public site.`)) return;
    archiveMutation.mutate(id);
  }

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button component={Link} href="/admin/villages/new" leftSection={<IconPlus size={16} />}>
          New village
        </Button>
      </Group>

      {archiveMutation.isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="md">
          {archiveMutation.error instanceof Error
            ? archiveMutation.error.message
            : 'Failed to archive village.'}
        </Alert>
      )}

      {!villages?.length ? (
        <EmptyState description="No villages yet. Create one to get started." />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Slug</Table.Th>
              <Table.Th>Name (EN)</Table.Th>
              <Table.Th>District</Table.Th>
              <Table.Th>Region</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {villages.map((village) => (
              <Table.Tr key={village.id}>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {village.id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" ff="monospace">
                    {village.slug}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Anchor
                    component={Link}
                    href={`/admin/villages/${village.id}/edit`}
                    size="sm"
                    fw={500}
                  >
                    {village.nameEn}
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{village.district ?? '—'}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{village.region ?? '—'}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={village.isActive ? 'teal' : 'gray'}
                    variant="light"
                    size="sm"
                  >
                    {village.isActive ? 'Active' : 'Archived'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Button
                      component={Link}
                      href={`/admin/villages/${village.id}/edit`}
                      variant="subtle"
                      size="xs"
                    >
                      Edit
                    </Button>
                    {village.isActive && (
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        loading={
                          archiveMutation.isPending &&
                          archiveMutation.variables === village.id
                        }
                        onClick={() => handleArchive(village.id, village.nameEn)}
                      >
                        Archive
                      </Button>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  );
}
