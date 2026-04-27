'use client';

import { LoadingState } from '@/shared/ui';
import { useAdminVillages, getTranslation } from '@/entities/village';
import { useAdminFestivals, getFestivalTranslation } from '@/entities/festival';
import { AdminDashboard } from './_AdminDashboard';

export function AdminDashboardView() {
  const { data: villages, isLoading: villagesLoading } = useAdminVillages();
  const { data: festivals, isLoading: festivalsLoading } = useAdminFestivals();

  if (villagesLoading || festivalsLoading) return <LoadingState />;

  const villageList = villages ?? [];
  const festivalList = festivals ?? [];

  return (
    <AdminDashboard
      stats={{
        villages: villageList.length,
        festivals: festivalList.length,
        editions: festivalList.reduce((sum, f) => sum + f.editions.length, 0),
      }}
      attention={{
        festivalsWithoutEditions: festivalList
          .filter((f) => f.editions.length === 0)
          .map((f) => ({ id: f.id, title: getFestivalTranslation(f, 'en')?.title ?? f.slug })),
        tbaEditionsCount: festivalList
          .flatMap((f) => f.editions)
          .filter((e) => e.isDateTba).length,
        villagesWithoutDescription: villageList
          .filter((v) => !getTranslation(v, 'en')?.description)
          .map((v) => ({ id: v.id, name: getTranslation(v, 'en')?.name ?? v.slug })),
      }}
    />
  );
}
