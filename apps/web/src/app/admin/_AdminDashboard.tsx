'use client';

import Link from 'next/link';
import { Anchor, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IAdminDashboardStats {
  villages: number;
  festivals: number;
  editions: number;
}

export interface IAdminDashboardAttention {
  festivalsWithoutEditions: { id: number; title: string }[];
  tbaEditionsCount: number;
  villagesWithoutDescription: { id: number; name: string }[];
}

// ─── Private section components ───────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Paper withBorder p="lg" radius="md">
      <Text size="xl" fw={700}>
        {value}
      </Text>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Paper>
  );
}

function ContentSection({ stats }: { stats: IAdminDashboardStats }) {
  return (
    <div>
      <Title order={4} mb="sm">
        Content
      </Title>
      <SimpleGrid cols={{ base: 1, xs: 3 }}>
        <StatCard label="Villages" value={stats.villages} />
        <StatCard label="Festivals" value={stats.festivals} />
        <StatCard label="Editions" value={stats.editions} />
      </SimpleGrid>
    </div>
  );
}

function QuickActionsSection() {
  return (
    <div>
      <Title order={4} mb="sm">
        Quick actions
      </Title>
      <Group>
        <Button
          component={Link}
          href="/admin/villages/new"
          leftSection={<IconPlus size={16} />}
          variant="light"
        >
          New village
        </Button>
        <Button
          component={Link}
          href="/admin/festivals/new"
          leftSection={<IconPlus size={16} />}
          variant="light"
        >
          New festival
        </Button>
      </Group>
    </div>
  );
}

function NeedsAttentionSection({ attention }: { attention: IAdminDashboardAttention }) {
  const { festivalsWithoutEditions, tbaEditionsCount, villagesWithoutDescription } = attention;
  const hasItems =
    festivalsWithoutEditions.length > 0 ||
    tbaEditionsCount > 0 ||
    villagesWithoutDescription.length > 0;

  return (
    <div>
      <Title order={4} mb="sm">
        Needs attention
      </Title>

      {!hasItems ? (
        <Text size="sm" c="dimmed">
          Everything looks good.
        </Text>
      ) : (
        <Stack gap="xs">
          {festivalsWithoutEditions.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Text size="sm" fw={500} mb="xs">
                Festivals without editions ({festivalsWithoutEditions.length})
              </Text>
              <Stack gap={4}>
                {festivalsWithoutEditions.map(({ id, title }) => (
                  <Anchor
                    key={id}
                    component={Link}
                    href={`/admin/festivals/${id}/editions/new`}
                    size="sm"
                  >
                    {title} → Add edition
                  </Anchor>
                ))}
              </Stack>
            </Paper>
          )}

          {tbaEditionsCount > 0 && (
            <Paper withBorder p="md" radius="md">
              <Text size="sm" fw={500} mb="xs">
                Editions with TBA date ({tbaEditionsCount})
              </Text>
              <Text size="sm" c="dimmed">
                These editions have no confirmed date yet. Update them when dates are known.
              </Text>
            </Paper>
          )}

          {villagesWithoutDescription.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Text size="sm" fw={500} mb="xs">
                Villages without description ({villagesWithoutDescription.length})
              </Text>
              <Stack gap={4}>
                {villagesWithoutDescription.map(({ id, name }) => (
                  <Anchor
                    key={id}
                    component={Link}
                    href={`/admin/villages/${id}/edit`}
                    size="sm"
                  >
                    {name} → Edit
                  </Anchor>
                ))}
              </Stack>
            </Paper>
          )}
        </Stack>
      )}
    </div>
  );
}

// ─── Main presentational component ────────────────────────────────────────────

interface IAdminDashboardProps {
  stats: IAdminDashboardStats;
  attention: IAdminDashboardAttention;
}

export function AdminDashboard({ stats, attention }: IAdminDashboardProps) {
  return (
    <Stack gap="xl">
      <Paper withBorder p="lg" radius="md">
        <Text size="sm">
          Manage villages, festivals, and annual editions. Add content, attach dates and venues, and
          publish when ready.
        </Text>
      </Paper>

      <ContentSection stats={stats} />
      <QuickActionsSection />
      <NeedsAttentionSection attention={attention} />

      <div>
        <Title order={4} mb="xs">
          Analytics
        </Title>
        <Text size="sm" c="dimmed">
          Coming soon.
        </Text>
      </div>
    </Stack>
  );
}
