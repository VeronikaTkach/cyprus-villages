'use client';

import dynamic from 'next/dynamic';
import { Box, Skeleton } from '@mantine/core';
import type { IMapPickerInnerProps } from './_MapPickerInner';

export type IMapPickerControlProps = IMapPickerInnerProps;

const MapPickerInner = dynamic(
  () => import('./_MapPickerInner').then((m) => ({ default: m.MapPickerInner })),
  {
    ssr: false,
    loading: () => <Skeleton height={280} style={{ borderRadius: 8 }} />,
  },
);

export function MapPickerControl(props: IMapPickerControlProps) {
  return (
    <Box>
      <MapPickerInner {...props} />
    </Box>
  );
}
