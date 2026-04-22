'use client';

import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Badge,
  Button,
  Select,
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
import { useAdminVillages } from '@/entities/village';
import { CATEGORY_LABELS } from '@/entities/festival';
import type { TFestivalCategory, ICreateFestivalDto, IUpdateFestivalDto } from '@/entities/festival';

// ─── Constants ───────────────────────────────────────────────────────────────

const LOCALES: TLocale[] = ['en', 'ru', 'el'];

const CATEGORY_OPTIONS = (
  Object.keys(CATEGORY_LABELS) as TFestivalCategory[]
).map((v) => ({ value: v, label: CATEGORY_LABELS[v] }));

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2024, i, 1)),
}));

// ─── Schemas ─────────────────────────────────────────────────────────────────

const translationFields = {
  titleEn: z.string().min(1, 'Required').max(200, 'Max 200 characters'),
  titleRu: z.string().max(200, 'Max 200 characters').optional(),
  titleEl: z.string().max(200, 'Max 200 characters').optional(),
  descriptionEn: z.string().optional(),
  descriptionRu: z.string().optional(),
  descriptionEl: z.string().optional(),
};

const typicalMonthField = {
  typicalMonth: z.number().int().min(1).max(12).nullable().optional(),
};

const createSchema = z.object({
  slug: z
    .string()
    .min(2, 'Min 2 characters')
    .max(80, 'Max 80 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  villageId: z.number({ error: 'Required' }).int().min(1, 'Required'),
  category: z
    .enum(['WINE', 'FOOD', 'CULTURAL', 'RELIGIOUS', 'MUSIC', 'ARTS', 'SPORT', 'OTHER'])
    .optional(),
  ...typicalMonthField,
  ...translationFields,
});

const editSchema = z.object({
  category: z
    .enum(['WINE', 'FOOD', 'CULTURAL', 'RELIGIOUS', 'MUSIC', 'ARTS', 'SPORT', 'OTHER'])
    .optional(),
  ...typicalMonthField,
  ...translationFields,
});

type TCreateValues = z.infer<typeof createSchema>;
type TEditValues = z.infer<typeof editSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

type TFestivalFormProps =
  | {
      mode: 'create';
      onSubmit: (values: ICreateFestivalDto) => void;
      isPending: boolean;
      error?: string | null;
    }
  | {
      mode: 'edit';
      slug: string;
      defaultValues: IUpdateFestivalDto & { category?: TFestivalCategory };
      onSubmit: (values: IUpdateFestivalDto) => void;
      isPending: boolean;
      error?: string | null;
    };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanStrings<T extends Record<string, unknown>>(values: T): T {
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, v === '' ? undefined : v]),
  ) as T;
}

// ─── Shared translation tabs ──────────────────────────────────────────────────

interface ITranslationTabsProps {
  control: ReturnType<typeof useForm<TEditValues>>['control'];
}

const LOCALE_FIELDS: Record<
  TLocale,
  { title: keyof TEditValues; description: keyof TEditValues }
> = {
  en: { title: 'titleEn', description: 'descriptionEn' },
  ru: { title: 'titleRu', description: 'descriptionRu' },
  el: { title: 'titleEl', description: 'descriptionEl' },
};

function TranslationTabs({ control }: ITranslationTabsProps) {
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
                name={fields.title}
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Title"
                    placeholder={locale === 'en' ? 'e.g. Omodos Wine Festival' : undefined}
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
                    label="Short description"
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

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateForm({
  onSubmit,
  isPending,
  error,
}: Extract<TFestivalFormProps, { mode: 'create' }>) {
  const { data: villages } = useAdminVillages();
  const villageOptions =
    villages?.map((v) => ({
      value: String(v.id),
      label: v.nameEl
        ? `${v.nameEl} — ${v.translations.find((t) => t.locale === 'en')?.name ?? v.slug}`
        : (v.translations.find((t) => t.locale === 'en')?.name ?? v.slug),
    })) ?? [];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TCreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { slug: '', titleEn: '' },
  });

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(cleanStrings(values) as unknown as ICreateFestivalDto);
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
              placeholder="e.g. wine-festival-omodos"
              required
              error={errors.slug?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="villageId"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              label="Village"
              placeholder="Select a village"
              required
              searchable
              data={villageOptions}
              error={fieldState.error?.message}
              value={field.value ? String(field.value) : null}
              onChange={(val) => field.onChange(val ? Number(val) : undefined)}
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              label="Category"
              data={CATEGORY_OPTIONS}
              clearable
              error={fieldState.error?.message}
              value={field.value ?? null}
              onChange={(val) => field.onChange(val ?? undefined)}
            />
          )}
        />

        <Controller
          name="typicalMonth"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              label="Typical month"
              description="Approximate month this festival usually occurs. Shown publicly only when no confirmed edition date is available."
              data={MONTH_OPTIONS}
              clearable
              error={fieldState.error?.message}
              value={field.value != null ? String(field.value) : null}
              onChange={(val) => field.onChange(val ? Number(val) : null)}
            />
          )}
        />

        <Title order={5} c="dimmed">
          Translations
        </Title>
        <TranslationTabs
          control={control as unknown as ITranslationTabsProps['control']}
        />

        <Button type="submit" loading={isPending} mt="sm">
          Create festival
        </Button>
      </Stack>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditForm({
  slug,
  defaultValues,
  onSubmit,
  isPending,
  error,
}: Extract<TFestivalFormProps, { mode: 'edit' }>) {
  const {
    control,
    handleSubmit,
    formState: {},
  } = useForm<TEditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      titleEn: defaultValues.titleEn ?? '',
      titleRu: defaultValues.titleRu ?? '',
      titleEl: defaultValues.titleEl ?? '',
      descriptionEn: defaultValues.descriptionEn ?? '',
      descriptionRu: defaultValues.descriptionRu ?? '',
      descriptionEl: defaultValues.descriptionEl ?? '',
      category: defaultValues.category,
      typicalMonth: defaultValues.typicalMonth ?? undefined,
    },
  });

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(cleanStrings(values) as IUpdateFestivalDto);
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

        <Controller
          name="category"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              label="Category"
              data={CATEGORY_OPTIONS}
              clearable
              error={fieldState.error?.message}
              value={field.value ?? null}
              onChange={(val) => field.onChange(val ?? undefined)}
            />
          )}
        />

        <Controller
          name="typicalMonth"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              label="Typical month"
              description="Approximate month this festival usually occurs. Shown publicly only when no confirmed edition date is available."
              data={MONTH_OPTIONS}
              clearable
              error={fieldState.error?.message}
              value={field.value != null ? String(field.value) : null}
              onChange={(val) => field.onChange(val ? Number(val) : null)}
            />
          )}
        />

        <Title order={5} c="dimmed">
          Translations
        </Title>
        <TranslationTabs control={control} />

        <Button type="submit" loading={isPending} mt="sm">
          Save changes
        </Button>
      </Stack>
    </form>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function FestivalForm(props: TFestivalFormProps) {
  if (props.mode === 'create') {
    return <CreateForm {...props} />;
  }
  return <EditForm {...props} />;
}
