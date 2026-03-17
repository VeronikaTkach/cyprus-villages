import { Title, Text, Stack } from '@mantine/core';

interface ISectionTitleProps {
  title: string;
  description?: string;
}

export function SectionTitle({ title, description }: ISectionTitleProps) {
  return (
    <Stack gap="xs" mb="lg">
      <Title order={2}>{title}</Title>
      {description && (
        <Text c="dimmed" size="sm">
          {description}
        </Text>
      )}
    </Stack>
  );
}
