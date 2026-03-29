'use client';

import { useLocale } from 'next-intl';
import { Button, Group, ScrollArea } from '@mantine/core';
import type { IPublicFestivalsFilter } from '@/entities/festival';

interface IMonthStripProps {
  /** Months (1–12) that have at least one festival in the current result set. */
  activeMonths: Set<number>;
  filters: IPublicFestivalsFilter;
  onChange: (filters: IPublicFestivalsFilter) => void;
}

export function MonthStrip({ activeMonths, filters, onChange }: IMonthStripProps) {
  const locale = useLocale();

  if (activeMonths.size === 0) return null;

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Intl.DateTimeFormat(locale, { month: 'short' })
      .format(new Date(2024, i, 1))
      // Capitalise first letter so it looks right regardless of locale
      .replace(/^\p{Ll}/u, (c) => c.toUpperCase()),
  }));

  return (
    <ScrollArea type="auto" scrollbarSize={4}>
      <Group gap={6} wrap="nowrap" pb={4}>
        {months.map(({ value, label }) => {
          const hasData = activeMonths.has(value);
          const isSelected = filters.month === value;

          return (
            <Button
              key={value}
              size="compact-sm"
              variant={isSelected ? 'filled' : 'light'}
              color="teal"
              disabled={!hasData}
              onClick={() =>
                onChange({ ...filters, month: isSelected ? undefined : value })
              }
              style={{ minWidth: 46, flexShrink: 0, opacity: hasData ? 1 : 0.35 }}
            >
              {label}
            </Button>
          );
        })}
      </Group>
    </ScrollArea>
  );
}
