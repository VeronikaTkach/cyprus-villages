'use client';

import dynamic from 'next/dynamic';
import { Box, Skeleton } from '@mantine/core';
import type { IMapMarker } from './types';

export interface ILeafletMapProps {
  markers: IMapMarker[];
  /** Map center. Defaults to Cyprus geographic center. */
  center?: [number, number];
  /** Zoom level. Defaults to 13 for detail views, 9 for overview. */
  zoom?: number;
  /** Height of the map container. Defaults to 300 (px). */
  height?: number | string;
}

// Cyprus geographic center — used when no center is specified
const CYPRUS_CENTER: [number, number] = [35.1264, 33.4299];

const LeafletMapInner = dynamic(
  () => import('./_LeafletMapInner').then((m) => ({ default: m.LeafletMapInner })),
  {
    ssr: false,
    loading: () => (
      <Skeleton
        style={{
          height: typeof undefined === 'undefined' ? 300 : undefined,
          borderRadius: 8,
        }}
        height={300}
      />
    ),
  },
);

export function LeafletMap({
  markers,
  center = CYPRUS_CENTER,
  zoom = 13,
  height = 300,
}: ILeafletMapProps) {
  return (
    <Box>
      <LeafletMapInner
        markers={markers}
        center={center}
        zoom={zoom}
        height={height}
      />
    </Box>
  );
}
