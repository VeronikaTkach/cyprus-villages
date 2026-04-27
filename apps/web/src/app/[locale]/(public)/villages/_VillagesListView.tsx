import { getLocale, getTranslations } from 'next-intl/server';
import { SimpleGrid, Text } from '@mantine/core';
import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/shared/ui';
import { serverGet } from '@/shared/api/server-fetch';
import { VillageCard } from '@/entities/village';
import type { IVillage } from '@/entities/village';

export async function VillagesListView() {
  const locale = await getLocale();
  const t = await getTranslations('villages');

  let villages: IVillage[] = [];
  try {
    villages = await serverGet<IVillage[]>('/villages');
  } catch {
    return <Text c="red">{t('loadError')}</Text>;
  }

  if (!villages.length) return <EmptyState description={t('empty')} />;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={20}>
      {villages.map((village) => (
        <Link
          key={village.id}
          href={`/villages/${village.slug}`}
          style={{ textDecoration: 'none' }}
        >
          <VillageCard village={village} locale={locale} />
        </Link>
      ))}
    </SimpleGrid>
  );
}
