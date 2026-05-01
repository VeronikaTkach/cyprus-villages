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

// ─── Quick actions data ───────────────────────────────────────────────────────

const PRIMARY_ACTIONS = [
  { label: 'New village', href: '/admin/villages/new' },
  { label: 'New festival', href: '/admin/festivals/new' },
] as const;

const SECONDARY_ACTIONS = [
  { label: 'Manage villages', href: '/admin/villages' },
  { label: 'Manage festivals', href: '/admin/festivals' },
] as const;

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
      <Stack gap="xs">
        <Group>
          {PRIMARY_ACTIONS.map(({ label, href }) => (
            <Button
              key={href}
              component={Link}
              href={href}
              leftSection={<IconPlus size={16} />}
              variant="light"
            >
              {label}
            </Button>
          ))}
        </Group>
        <Group gap="md">
          {SECONDARY_ACTIONS.map(({ label, href }) => (
            <Anchor key={href} component={Link} href={href} size="sm">
              {label}
            </Anchor>
          ))}
        </Group>
      </Stack>
    </div>
  );
}

interface IAttentionCardProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  items?: { id: number; label: string; href: string }[];
}

function AttentionCard({ title, description, actionHref, actionLabel, items }: IAttentionCardProps) {
  const hasBody = description || (items && items.length > 0);
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" align="flex-start" mb={hasBody ? 'xs' : 0}>
        <Text size="sm" fw={500}>
          {title}
        </Text>
        {actionHref && actionLabel && (
          <Anchor component={Link} href={actionHref} size="sm" style={{ whiteSpace: 'nowrap' }}>
            {actionLabel}
          </Anchor>
        )}
      </Group>
      {description && (
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      )}
      {items && items.length > 0 && (
        <Stack gap={4}>
          {items.map(({ id, label, href }) => (
            <Anchor key={id} component={Link} href={href} size="sm">
              {label}
            </Anchor>
          ))}
        </Stack>
      )}
    </Paper>
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
            <AttentionCard
              title={`Festivals without editions (${festivalsWithoutEditions.length})`}
              items={festivalsWithoutEditions.map((f) => ({
                id: f.id,
                label: `${f.title} → Add edition`,
                href: `/admin/festivals/${f.id}/editions/new`,
              }))}
            />
          )}
          {tbaEditionsCount > 0 && (
            <AttentionCard
              title={`Editions with TBA date (${tbaEditionsCount})`}
              description="These editions have no confirmed date yet. Update them when dates are known."
              actionHref="/admin/festivals"
              actionLabel="Review editions"
            />
          )}
          {villagesWithoutDescription.length > 0 && (
            <AttentionCard
              title={`Villages without description (${villagesWithoutDescription.length})`}
              items={villagesWithoutDescription.map((v) => ({
                id: v.id,
                label: `${v.name} → Edit`,
                href: `/admin/villages/${v.id}/edit`,
              }))}
            />
          )}
        </Stack>
      )}
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div>
      <Title order={4} mb="xs">
        Analytics
      </Title>
      <Text size="sm" c="dimmed">
        Coming soon.
      </Text>
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
      <AnalyticsSection />
    </Stack>
  );
}
