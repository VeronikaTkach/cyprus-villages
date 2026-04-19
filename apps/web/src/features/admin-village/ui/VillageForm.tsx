'use client';

import { z } from 'zod';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Badge,
  Button,
  Divider,
  Grid,
  NumberInput,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { LOCALE_LABELS } from '@/shared/i18n';
import type { TLocale } from '@/shared/i18n';
import type { ICreateVillageDto, IUpdateVillageDto } from '@/entities/village';
import { MapPickerControl } from '@/shared/ui';

// ─── Schemas ────────────────────────────────────────────────────────────────

const translationFields = {
  nameEn: z.string().min(1, 'Required').max(100, 'Max 100 characters'),
  nameRu: z.string().max(100, 'Max 100 characters').optional(),
  nameEl: z.string().max(100, 'Max 100 characters').optional(),
  descriptionEn: z.string().optional(),
  descriptionRu: z.string().optional(),
  descriptionEl: z.string().optional(),
};

const locationFields = {
  district: z.string().max(100, 'Max 100 characters').optional(),
  region: z.string().max(100, 'Max 100 characters').optional(),
  centerLat: z.number().min(-90, 'Min -90').max(90, 'Max 90').optional(),
  centerLng: z.number().min(-180, 'Min -180').max(180, 'Max 180').optional(),
};

const createSchema = z.object({
  slug: z
    .string()
    .min(2, 'Min 2 characters')
    .max(60, 'Max 60 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  ...translationFields,
  ...locationFields,
});

const editSchema = z.object({
  ...translationFields,
  ...locationFields,
});

type TCreateValues = z.infer<typeof createSchema>;
type TEditValues = z.infer<typeof editSchema>;

// ─── Locale tabs config ───────────────────────────────────────────────────────

const LOCALES: TLocale[] = ['en', 'ru', 'el'];

// Field names per locale
const LOCALE_FIELDS: Record<
  TLocale,
  { name: keyof TEditValues; description: keyof TEditValues }
> = {
  en: { name: 'nameEn', description: 'descriptionEn' },
  ru: { name: 'nameRu', description: 'descriptionRu' },
  el: { name: 'nameEl', description: 'descriptionEl' },
};

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

// ─── Shared form body ────────────────────────────────────────────────────────

interface IFormBodyProps {
  control: ReturnType<typeof useForm<TEditValues>>['control'];
  errors: ReturnType<typeof useForm<TEditValues>>['formState']['errors'];
}

interface ILocationFieldsProps extends IFormBodyProps {
  onMapPick: (lat: number, lng: number) => void;
}

function TranslationTabs({ control }: IFormBodyProps) {
  return (
    <Tabs defaultValue="en">
      <Tabs.List>
        {LOCALES.map((locale) => (
          <Tabs.Tab key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
            {locale === 'en' && (
              <Text component="span" c="red" ml={2}>
                *
              </Text>
            )}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {LOCALES.map((locale) => {
        const fields = LOCALE_FIELDS[locale];
        return (
          <Tabs.Panel key={locale} value={locale} pt="md">
            <Stack gap="md">
              <Controller
                name={fields.name}
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Name"
                    placeholder={locale === 'en' ? 'e.g. Omodos' : undefined}
                    required={locale === 'en'}
                    error={fieldState.error?.message}
                    {...field}
                    value={field.value ?? ''}
                  />
                )}
              />
              <Controller
                name={fields.description}
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Description"
                    autosize
                    minRows={3}
                    {...field}
                    value={field.value ?? ''}
                  />
                )}
              />
            </Stack>
          </Tabs.Panel>
        );
      })}
    </Tabs>
  );
}

function LocationFields({ control, errors, onMapPick }: ILocationFieldsProps) {
  const centerLat = useWatch({ control, name: 'centerLat' });
  const centerLng = useWatch({ control, name: 'centerLng' });

  return (
    <>
      <Divider label="Location" labelPosition="left" />

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

      <Text size="xs" c="dimmed">Click the map to set center coordinates</Text>
      <MapPickerControl
        lat={typeof centerLat === 'number' ? centerLat : undefined}
        lng={typeof centerLng === 'number' ? centerLng : undefined}
        onPick={onMapPick}
      />
    </>
  );
}

// ─── Create form ─────────────────────────────────────────────────────────────

function CreateForm({ onSubmit, isPending, error }: Extract<TVillageFormProps, { mode: 'create' }>) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TCreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { slug: '', nameEn: '' },
  });

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(cleanStrings(values) as ICreateVillageDto);
  });

  const handleMapPick = (lat: number, lng: number) => {
    setValue('centerLat', lat);
    setValue('centerLng', lng);
  };

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

        <Title order={5} c="dimmed">
          Translations
        </Title>
        <TranslationTabs
          control={control as unknown as IFormBodyProps['control']}
          errors={errors}
        />

        <LocationFields
          control={control as unknown as IFormBodyProps['control']}
          errors={errors}
          onMapPick={handleMapPick}
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
    setValue,
    formState: { errors },
  } = useForm<TEditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      nameEn: defaultValues.nameEn ?? '',
      nameRu: defaultValues.nameRu ?? '',
      nameEl: defaultValues.nameEl ?? '',
      descriptionEn: defaultValues.descriptionEn ?? '',
      descriptionRu: defaultValues.descriptionRu ?? '',
      descriptionEl: defaultValues.descriptionEl ?? '',
      district: defaultValues.district ?? '',
      region: defaultValues.region ?? '',
      centerLat: defaultValues.centerLat,
      centerLng: defaultValues.centerLng,
    },
  });

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(cleanStrings(values) as IUpdateVillageDto);
  });

  const handleMapPick = (lat: number, lng: number) => {
    setValue('centerLat', lat);
    setValue('centerLng', lng);
  };

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

        <Title order={5} c="dimmed">
          Translations
        </Title>
        <TranslationTabs control={control} errors={errors} />

        <LocationFields control={control} errors={errors} onMapPick={handleMapPick} />

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
