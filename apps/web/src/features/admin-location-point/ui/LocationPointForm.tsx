'use client';

import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { ILocationPoint, ICreateLocationPointDto, IUpdateLocationPointDto } from '@/entities/location-point';

// ─── Type labels ───────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  VENUE: 'Venue',
  PARKING: 'Parking',
  MEETING_POINT: 'Meeting point',
  WC: 'WC / Toilets',
  SHUTTLE: 'Shuttle stop',
  VIEWPOINT: 'Viewpoint',
  OTHER: 'Other',
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));

// ─── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  type: z.enum(['VENUE', 'PARKING', 'MEETING_POINT', 'WC', 'SHUTTLE', 'VIEWPOINT', 'OTHER']),
  label: z.string().min(1, 'Required').max(200, 'Max 200 characters'),
  lat: z.number({ error: 'Required' }).min(-90, 'Min −90').max(90, 'Max 90'),
  lng: z.number({ error: 'Required' }).min(-180, 'Min −180').max(180, 'Max 180'),
  note: z.string().max(500, 'Max 500 characters').optional(),
});

type TValues = z.infer<typeof schema>;

// ─── Props ──────────────────────────────────────────────────────────────────────

type TLocationPointFormProps =
  | {
      mode: 'create';
      context: { villageId: number } | { festivalEditionId: number };
      onSubmit: (dto: ICreateLocationPointDto) => void;
      isPending: boolean;
      error?: string | null;
    }
  | {
      mode: 'edit';
      point: ILocationPoint;
      onSubmit: (dto: IUpdateLocationPointDto) => void;
      isPending: boolean;
      error?: string | null;
    };

// ─── Component ──────────────────────────────────────────────────────────────────

export function LocationPointForm(props: TLocationPointFormProps) {
  const defaultValues: Partial<TValues> =
    props.mode === 'edit'
      ? {
          type: props.point.type,
          label: props.point.label,
          lat: props.point.lat,
          lng: props.point.lng,
          note: props.point.note ?? undefined,
        }
      : {};

  const {
    control,
    handleSubmit,
  } = useForm<TValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = handleSubmit((values) => {
    if (props.mode === 'create') {
      const context = props.context;
      const dto: ICreateLocationPointDto = {
        ...values,
        note: values.note || undefined,
        ...('villageId' in context ? { villageId: context.villageId } : {}),
        ...('festivalEditionId' in context ? { festivalEditionId: context.festivalEditionId } : {}),
      };
      props.onSubmit(dto);
    } else {
      props.onSubmit({ ...values, note: values.note || undefined });
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="md">
        {props.error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {props.error}
          </Alert>
        )}

        <Controller
          name="type"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              label="Type"
              data={TYPE_OPTIONS}
              required
              error={fieldState.error?.message}
              value={field.value ?? null}
              onChange={(val) => field.onChange(val ?? undefined)}
            />
          )}
        />

        <Controller
          name="label"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Label"
              placeholder="e.g. Main entrance"
              required
              error={fieldState.error?.message}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />

        <Group grow>
          <Controller
            name="lat"
            control={control}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Latitude"
                placeholder="34.8494"
                required
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
          <Controller
            name="lng"
            control={control}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Longitude"
                placeholder="32.8108"
                required
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
        </Group>

        <Controller
          name="note"
          control={control}
          render={({ field, fieldState }) => (
            <Textarea
              label="Note"
              description="Optional — short note visible to admins only"
              autosize
              minRows={2}
              error={fieldState.error?.message}
              {...field}
              value={field.value ?? ''}
            />
          )}
        />

        <Group justify="flex-end">
          <Button type="submit" loading={props.isPending}>
            {props.mode === 'create' ? 'Add point' : 'Save changes'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
