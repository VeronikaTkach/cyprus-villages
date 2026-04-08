'use client';

import { useRef } from 'react';
import { ActionIcon, Box, Button, Group, Image, Loader, Stack, Text } from '@mantine/core';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { useMediaByOwner, useUploadCover, useDeleteMedia } from '@/entities/media';

interface ICoverUploadProps {
  villageId?: number;
  festivalId?: number;
  festivalEditionId?: number;
  label?: string;
}

export function CoverUpload({
  villageId,
  festivalId,
  festivalEditionId,
  label = 'Cover image',
}: ICoverUploadProps) {
  const ownerParams = { villageId, festivalId, festivalEditionId };
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: mediaList, isLoading } = useMediaByOwner(ownerParams);
  const uploadMutation = useUploadCover();
  const deleteMutation = useDeleteMedia();

  const cover = mediaList?.[0] ?? null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ file, ...ownerParams });
    // Reset so the same file can be re-selected after deletion
    e.target.value = '';
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id);
  }

  if (isLoading) return <Loader size="sm" />;

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {label}
      </Text>

      {cover ? (
        <Box pos="relative" w={200}>
          <Image
            src={cover.url}
            alt={cover.alt ?? ''}
            radius="sm"
            w={200}
            h={130}
            fit="cover"
          />
          <ActionIcon
            pos="absolute"
            top={4}
            right={4}
            color="red"
            variant="filled"
            size="sm"
            loading={deleteMutation.isPending}
            onClick={() => handleDelete(cover.id)}
            aria-label="Delete cover image"
          >
            <IconTrash size={12} />
          </ActionIcon>
        </Box>
      ) : (
        <Text size="sm" c="dimmed">
          No cover image
        </Text>
      )}

      <Group>
        <Button
          variant="light"
          size="xs"
          leftSection={<IconUpload size={14} />}
          loading={uploadMutation.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {cover ? 'Replace' : 'Upload'}
        </Button>
      </Group>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Stack>
  );
}
