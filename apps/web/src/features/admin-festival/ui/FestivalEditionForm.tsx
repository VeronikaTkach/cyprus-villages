'use client';

import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Divider,
  Grid,
  Group,
  NumberInput,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { ICreateFestivalEditionDto, IUpdateFestivalEditionDto } from '@/entities/festival-edition';

// ─── Validation helpers ───────────────────────────────────────────────────────

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
  .optional()
  .or(z.literal(''));

const optionalTime = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Use HH:mm format')
  .optional()
  .or(z.literal(''));

const optionalUrl = z
  .string()
  .url('Invalid URL')
  .optional()
  .or(z.literal(''));

const baseEditionFields = {
  startDate: optionalDate,
  endDate: optionalDate,
  isDateTba: z.boolean().optional(),
  startTime: optionalTime,
  endTime: optionalTime,
  venueName: z.string().max(200).optional(),
  venueLat: z.number().min(-90, 'Min −90').max(90, 'Max 90').optional(),
  venueLng: z.number().min(-180, 'Min −180').max(180, 'Max 180').optional(),
  parkingName: z.string().max(200).optional(),
  parkingLat: z.number().min(-90, 'Min −90').max(90, 'Max 90').optional(),
  parkingLng: z.number().min(-180, 'Min −180').max(180, 'Max 180').optional(),
  officialUrl: optionalUrl,
  sourceUrl: optionalUrl,
  sourceNote: z.string().optional(),
};

const createEditionSchema = z.object({
  year: z
    .number({ error: 'Required' })
    .int()
    .min(2000, 'Min year 2000')
    .max(2100, 'Max year 2100'),
  ...baseEditionFields,
});

const editEditionSchema = z.object({
  ...baseEditionFields,
  lastVerifiedAt: z.string().optional(),
});

type TCreateEditionValues = z.infer<typeof createEditionSchema>;
type TEditEditionValues = z.infer<typeof editEditionSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

type TFestivalEditionFormProps =
  | {
      mode: 'create';
      festivalId: number;
      onSubmit: (values: ICreateFestivalEditionDto) => void;
      isPending: boolean;
      error?: string | null;
    }
  | {
      mode: 'edit';
      editionId: number;
      year: number;
      defaultValues: IUpdateFestivalEditionDto;
      onSubmit: (values: IUpdateFestivalEditionDto) => void;
      isPending: boolean;
      error?: string | null;
    };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanStrings<T extends Record<string, unknown>>(values: T): T {
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v]),
  ) as T;
}

// ─── Shared body ──────────────────────────────────────────────────────────────

interface IEditionBodyProps {
  control: ReturnType<typeof useForm<TEditEditionValues>>['control'];
  isDateTba: boolean;
}

function EditionBody({ control, isDateTba }: IEditionBodyProps) {
  return (
    <>
      {/* ── Dates ── */}
      <Divider label="Dates" labelPosition="left" />

      <Controller
        name="isDateTba"
        control={control}
        render={({ field }) => (
          <Switch
            label="Dates TBA — exact dates not yet confirmed"
            checked={field.value ?? false}
            onChange={(e) => field.onChange(e.currentTarget.checked)}
          />
        )}
      />

      {!isDateTba && (
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Start date"
                  placeholder="YYYY-MM-DD"
                  type="date"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value ?? ''}
                />
              )}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="End date"
                  placeholder="YYYY-MM-DD"
                  type="date"
                  error={fieldState.error?.message}
                  {...field}
                  value={field.value ?? ''}
                />
              )}
            />
          </Grid.Col>
        </Grid>
      )}

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Controller
            name="startTime"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Start time"
                placeholder="18:00"
                error={fieldState.error?.message}
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Controller
            name="endTime"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="End time"
                placeholder="23:00"
                error={fieldState.error?.message}
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
        </Grid.Col>
      </Grid>

      {/* ── Venue ── */}
      <Divider label="Venue" labelPosition="left" />

      <Controller
        name="venueName"
        control={control}
        render={({ field }) => (
          <TextInput
            label="Venue name"
            placeholder="e.g. Omodos Village Square"
            {...field}
            value={field.value ?? ''}
          />
        )}
      />

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Controller
            name="venueLat"
            control={control}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Venue latitude"
                placeholder="34.8466"
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
            name="venueLng"
            control={control}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Venue longitude"
                placeholder="32.8099"
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

      {/* ── Parking ── */}
      <Divider label="Parking" labelPosition="left" />

      <Controller
        name="parkingName"
        control={control}
        render={({ field }) => (
          <TextInput
            label="Parking name"
            placeholder="e.g. Main village car park"
            {...field}
            value={field.value ?? ''}
          />
        )}
      />

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Controller
            name="parkingLat"
            control={control}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Parking latitude"
                placeholder="34.845"
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
            name="parkingLng"
            control={control}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Parking longitude"
                placeholder="32.809"
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

      {/* ── Sources ── */}
      <Divider label="Sources" labelPosition="left" />

      <Controller
        name="officialUrl"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            label="Official URL"
            placeholder="https://..."
            error={fieldState.error?.message}
            {...field}
            value={field.value ?? ''}
          />
        )}
      />

      <Controller
        name="sourceUrl"
        control={control}
        render={({ field, fieldState }) => (
          <TextInput
            label="Source URL"
            description="Where this information was found"
            placeholder="https://..."
            error={fieldState.error?.message}
            {...field}
            value={field.value ?? ''}
          />
        )}
      />

      <Controller
        name="sourceNote"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Source note"
            description="Free-text note about data source or verification"
            autosize
            minRows={2}
            {...field}
            value={field.value ?? ''}
          />
        )}
      />
    </>
  );
}

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateEditionForm({
  festivalId,
  onSubmit,
  isPending,
  error,
}: Extract<TFestivalEditionFormProps, { mode: 'create' }>) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TCreateEditionValues>({
    resolver: zodResolver(createEditionSchema),
    defaultValues: { isDateTba: false },
  });

  const isDateTba = watch('isDateTba') ?? false;

  const handleFormSubmit = handleSubmit((values) => {
    const cleaned = cleanStrings(values) as ICreateFestivalEditionDto;
    onSubmit({ ...cleaned, festivalId });
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
          name="year"
          control={control}
          render={({ field, fieldState }) => (
            <NumberInput
              label="Year"
              placeholder={String(new Date().getFullYear())}
              required
              error={fieldState.error?.message}
              min={2000}
              max={2100}
              value={field.value ?? ''}
              onChange={(val) => field.onChange(typeof val === 'number' ? val : undefined)}
            />
          )}
        />

        <EditionBody
          control={control as unknown as IEditionBodyProps['control']}
          isDateTba={isDateTba}
        />

        <Group justify="flex-end" mt="sm">
          <Button type="submit" loading={isPending}>
            Create edition
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditEditionForm({
  year,
  defaultValues,
  onSubmit,
  isPending,
  error,
}: Extract<TFestivalEditionFormProps, { mode: 'edit' }>) {
  const {
    control,
    handleSubmit,
    watch,
  } = useForm<TEditEditionValues>({
    resolver: zodResolver(editEditionSchema),
    defaultValues: {
      isDateTba: defaultValues.isDateTba ?? false,
      startDate: defaultValues.startDate ?? '',
      endDate: defaultValues.endDate ?? '',
      startTime: defaultValues.startTime ?? '',
      endTime: defaultValues.endTime ?? '',
      venueName: defaultValues.venueName ?? '',
      venueLat: defaultValues.venueLat,
      venueLng: defaultValues.venueLng,
      parkingName: defaultValues.parkingName ?? '',
      parkingLat: defaultValues.parkingLat,
      parkingLng: defaultValues.parkingLng,
      officialUrl: defaultValues.officialUrl ?? '',
      sourceUrl: defaultValues.sourceUrl ?? '',
      sourceNote: defaultValues.sourceNote ?? '',
    },
  });

  const isDateTba = watch('isDateTba') ?? false;

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(cleanStrings(values) as IUpdateFestivalEditionDto);
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
            Year
          </Text>
          <Title order={4}>{year}</Title>
          <Text size="xs" c="dimmed" mt={2}>
            Year is set at creation and cannot be changed.
          </Text>
        </div>

        <EditionBody
          control={control}
          isDateTba={isDateTba}
        />

        <Group justify="flex-end" mt="sm">
          <Button type="submit" loading={isPending}>
            Save changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function FestivalEditionForm(props: TFestivalEditionFormProps) {
  if (props.mode === 'create') {
    return <CreateEditionForm {...props} />;
  }
  return <EditEditionForm {...props} />;
}
