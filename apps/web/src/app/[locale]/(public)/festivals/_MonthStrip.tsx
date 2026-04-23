'use client';

import { useLocale } from 'next-intl';
import { ScrollArea } from '@mantine/core';
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
      .replace(/^\p{Ll}/u, (c) => c.toUpperCase()),
  }));

  return (
    <ScrollArea type="auto" scrollbarSize={4}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', paddingBottom: 4 }}>
        {months.map(({ value, label }) => {
          const hasData = activeMonths.has(value);
          const isSelected = filters.month === value;

          return (
            <button
              key={value}
              disabled={!hasData}
              onClick={() =>
                onChange({ ...filters, month: isSelected ? undefined : value })
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 52,
                padding: '5px 10px',
                borderRadius: 'var(--cv-radius-sm)',
                border: isSelected
                  ? '1.5px solid var(--cv-primary)'
                  : '1px solid var(--cv-line-strong)',
                background: isSelected ? 'var(--cv-primary-soft)' : 'transparent',
                color: isSelected ? 'var(--cv-primary-ink)' : 'var(--cv-ink-3)',
                fontFamily: 'var(--cv-font-mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: isSelected ? 600 : 400,
                cursor: hasData ? 'pointer' : 'default',
                opacity: hasData ? 1 : 0.3,
                flexShrink: 0,
                transition: 'background var(--cv-dur) var(--cv-ease), color var(--cv-dur) var(--cv-ease), border-color var(--cv-dur) var(--cv-ease)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
