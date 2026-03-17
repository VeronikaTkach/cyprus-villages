import { Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

interface IEmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'Nothing here yet',
  description,
}: IEmptyStateProps) {
  return (
    <Stack align="center" gap="sm" py="xl">
      <ThemeIcon size="xl" variant="light" color="gray">
        <IconInbox size={24} />
      </ThemeIcon>
      <Text fw={500}>{title}</Text>
      {description && (
        <Text c="dimmed" size="sm" ta="center">
          {description}
        </Text>
      )}
    </Stack>
  );
}
