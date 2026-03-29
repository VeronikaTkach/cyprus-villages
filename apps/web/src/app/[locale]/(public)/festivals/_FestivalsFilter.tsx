'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Button, Group, Select } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { usePublicVillages } from '@/entities/village';
import { CATEGORY_LABELS } from '@/entities/festival';
import type { IPublicFestivalsFilter, TFestivalCategory } from '@/entities/festival';

interface IFestivalsFilterProps {
  filters: IPublicFestivalsFilter;
  onChange: (filters: IPublicFestivalsFilter) => void;
}

const FESTIVAL_CATEGORIES: TFestivalCategory[] = [
  'WINE',
  'FOOD',
  'CULTURAL',
  'RELIGIOUS',
  'MUSIC',
  'ARTS',
  'SPORT',
  'OTHER',
];

function getMonthOptions(locale: string) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, i, 1)),
  }));
}

function getYearOptions() {
  const current = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => {
    const year = current + 1 - i;
    return { value: String(year), label: String(year) };
  });
}

export function FestivalsFilter({ filters, onChange }: IFestivalsFilterProps) {
  const t = useTranslations('festivals');
  const locale = useLocale();
  const { data: villages } = usePublicVillages();

  const hasFilters = !!(filters.category || filters.villageId || filters.year || filters.month);

  const categoryOptions = FESTIVAL_CATEGORIES.map((cat) => ({
    value: cat,
    label: CATEGORY_LABELS[cat],
  }));

  const villageOptions = (villages ?? []).map((v) => ({
    value: String(v.id),
    label: v.nameEl ?? v.slug,
  }));

  const monthOptions = getMonthOptions(locale);
  const yearOptions = getYearOptions();

  return (
    <Group gap="sm" wrap="wrap" align="flex-end">
      <Select
        placeholder={t('filters.category')}
        data={categoryOptions}
        value={filters.category ?? null}
        onChange={(val) => onChange({ ...filters, category: val ?? undefined })}
        clearable
        size="sm"
        style={{ flex: '1 1 140px', minWidth: 130, maxWidth: 180 }}
      />
      <Select
        placeholder={t('filters.village')}
        data={villageOptions}
        value={filters.villageId !== undefined ? String(filters.villageId) : null}
        onChange={(val) => onChange({ ...filters, villageId: val !== null ? Number(val) : undefined })}
        clearable
        searchable
        size="sm"
        style={{ flex: '1 1 160px', minWidth: 150, maxWidth: 220 }}
      />
      <Select
        placeholder={t('filters.year')}
        data={yearOptions}
        value={filters.year !== undefined ? String(filters.year) : null}
        onChange={(val) => onChange({ ...filters, year: val !== null ? Number(val) : undefined })}
        clearable
        size="sm"
        style={{ flex: '1 1 90px', minWidth: 90, maxWidth: 110 }}
      />
      <Select
        placeholder={t('filters.month')}
        data={monthOptions}
        value={filters.month !== undefined ? String(filters.month) : null}
        onChange={(val) => onChange({ ...filters, month: val !== null ? Number(val) : undefined })}
        clearable
        size="sm"
        style={{ flex: '1 1 130px', minWidth: 130, maxWidth: 160 }}
      />
      {hasFilters && (
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          leftSection={<IconX size={14} />}
          onClick={() => onChange({})}
        >
          {t('filters.clearFilters')}
        </Button>
      )}
    </Group>
  );
}
