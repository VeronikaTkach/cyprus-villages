'use client';

import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Grid,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { ICreateVillageDto, IUpdateVillageDto } from '@/entities/village';

// ─── Schemas ────────────────────────────────────────────────────────────────

const sharedFields = {
  nameEn: z.string().min(1, 'Required').max(100, 'Max 100 characters'),
  nameRu: z.string().max(100, 'Max 100 characters').optional(),
  nameEl: z.string().max(100, 'Max 100 characters').optional(),
  district: z.string().max(100, 'Max 100 characters').optional(),
  region: z.string().max(100, 'Max 100 characters').optional(),
  descriptionEn: z.string().optional(),
  descriptionRu: z.string().optional(),
  descriptionEl: z.string().optional(),
  centerLat: z.number().min(-90, 'Min -90').max(90, 'Max 90').optional(),
  centerLng: z.number().min(-180, 'Min -180').max(180, 'Max 180').optional(),
};

const createSchema = z.object({
  slug: z
    .string()
    .min(2, 'Min 2 characters')
    .max(60, 'Max 60 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  ...sharedFields,
});

const editSchema = z.object(sharedFields);

type TCreateValues = z.infer<typeof createSchema>;
type TEditValues = z.infer<typeof editSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

type TVillageFormProps =
  | {
      mode: 'create';
      onSubmit: (values: ICreateVillageDto) => void;
      isPending: boolean;
      error?: string | null;
    }
  | {
      mode: 'edit';
      slug: string;
      defaultValues: IUpdateVillageDto;
      onSubmit: (values: IUpdateVillageDto) => void;
      isPending: boolean;
      error?: string | null;
    };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanStrings<T extends Record<string, unknown>>(values: T): T {
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v]),
  ) as T;
}

// ─── Shared fields JSX ───────────────────────────────────────────────────────

interface ISharedFieldsProps {
  control: ReturnType<typeof useForm<TEditValues>>['control'];
  errors: ReturnType<typeof useForm<TEditValues>>['formState']['errors'];
}

function SharedFields({ control, errors }: ISharedFieldsProps) {
  return (
    <>
      <Title order={5} c="dimmed">
        Names
      </Title>

      <Controller
        name="nameEn"
        control={control}
        render={({ field }) => (
          <TextInput
            label="Name (English)"
            placeholder="e.g. Omodos"
            required
            error={errors.nameEn?.message}
            {...field}
            value={field.value ?? ''}
          />
        )}
      />

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Controller
            name="nameRu"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Name (Russian)"
                placeholder="e.g. Омодос"
                error={errors.nameRu?.message}
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Controller
            name="nameEl"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Name (Greek)"
                placeholder="e.g. Όμοδος"
                error={errors.nameEl?.message}
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
        </Grid.Col>
      </Grid>

      <Divider />
      <Title order={5} c="dimmed">
        Location
      </Title>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Controller
            name="district"
            control={control}
            render={({ field }) => (
              <TextInput
                label="District"
                placeholder="e.g. Limassol"
                error={errors.district?.message}
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Region"
                placeholder="e.g. Troodos"
                error={errors.region?.message}
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Controller
            name="centerLat"
            control={control}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Center Latitude"
                placeholder="e.g. 34.8466"
                error={fieldState.error?.message}
                min={-90}
                max={90}
                step={0.0001}
                decimalScale={6}
                value={field.value ?? ''}
                onChange={(val) => field.onChange(typeof val === 'number' ? val : undefined)}
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Controller
            name="centerLng"
            control={control}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Center Longitude"
                placeholder="e.g. 32.8099"
                error={fieldState.error?.message}
                min={-180}
                max={180}
                step={0.0001}
                decimalScale={6}
                value={field.value ?? ''}
                onChange={(val) => field.onChange(typeof val === 'number' ? val : undefined)}
              />
            )}
          />
        </Grid.Col>
      </Grid>

      <Divider />
      <Title order={5} c="dimmed">
        Descriptions
      </Title>

      <Controller
        name="descriptionEn"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Description (English)"
            placeholder="Brief description of the village..."
            autosize
            minRows={3}
            {...field}
            value={field.value ?? ''}
          />
        )}
      />
      <Controller
        name="descriptionRu"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Description (Russian)"
            autosize
            minRows={3}
            {...field}
            value={field.value ?? ''}
          />
        )}
      />
      <Controller
        name="descriptionEl"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Description (Greek)"
            autosize
            minRows={3}
            {...field}
            value={field.value ?? ''}
          />
        )}
      />
    </>
  );
}

// ─── Create form ─────────────────────────────────────────────────────────────

function CreateForm({
  onSubmit,
  isPending,
  error,
}: Extract<TVillageFormProps, { mode: 'create' }>) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { slug: '', nameEn: '' },
  });

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(cleanStrings(values) as ICreateVillageDto);
  });

  return (
    <form onSubmit={handleFormSubmit}>
      <Stack gap="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Slug"
              description="URL identifier — lowercase letters, numbers, hyphens. Cannot be changed later."
              placeholder="e.g. omodos"
              required
              error={errors.slug?.message}
              {...field}
            />
          )}
        />

        <SharedFields
          control={control as unknown as ISharedFieldsProps['control']}
          errors={errors}
        />

        <Button type="submit" loading={isPending} mt="sm">
          Create village
        </Button>
      </Stack>
    </form>
  );
}

// ─── Edit form ───────────────────────────────────────────────────────────────

function EditForm({
  slug,
  defaultValues,
  onSubmit,
  isPending,
  error,
}: Extract<TVillageFormProps, { mode: 'edit' }>) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TEditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      nameEn: defaultValues.nameEn ?? '',
      nameRu: defaultValues.nameRu ?? '',
      nameEl: defaultValues.nameEl ?? '',
      district: defaultValues.district ?? '',
      region: defaultValues.region ?? '',
      descriptionEn: defaultValues.descriptionEn ?? '',
      descriptionRu: defaultValues.descriptionRu ?? '',
      descriptionEl: defaultValues.descriptionEl ?? '',
      centerLat: defaultValues.centerLat,
      centerLng: defaultValues.centerLng,
    },
  });

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(cleanStrings(values) as IUpdateVillageDto);
  });

  return (
    <form onSubmit={handleFormSubmit}>
      <Stack gap="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        <div>
          <Text size="sm" fw={500} mb={4}>
            Slug
          </Text>
          <Badge variant="outline" color="gray" size="lg" radius="sm">
            {slug}
          </Badge>
          <Text size="xs" c="dimmed" mt={4}>
            Slug is set at creation and cannot be changed.
          </Text>
        </div>

        <SharedFields control={control} errors={errors} />

        <Button type="submit" loading={isPending} mt="sm">
          Save changes
        </Button>
      </Stack>
    </form>
  );
}

// ─── Public export ───────────────────────────────────────────────────────────

export function VillageForm(props: TVillageFormProps) {
  if (props.mode === 'create') {
    return <CreateForm {...props} />;
  }
  return <EditForm {...props} />;
}
