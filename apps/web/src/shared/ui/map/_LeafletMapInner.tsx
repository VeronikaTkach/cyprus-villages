'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { IMapMarker, TMapMarkerKind } from './types';

// ─── Marker colors ─────────────────────────────────────────────────────────────
// village = teal (matches app theme), venue = blue, parking = orange

const MARKER_COLORS: Record<TMapMarkerKind, string> = {
  village: '#12b886',
  venue: '#228be6',
  parking: '#fd7e14',
};

function makeIcon(kind: TMapMarkerKind) {
  const color = MARKER_COLORS[kind];
  return L.divIcon({
    html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

// Create icons at module level — safe because this module is only ever evaluated
// client-side (loaded via dynamic() with ssr: false).
const ICONS: Record<TMapMarkerKind, L.DivIcon> = {
  village: makeIcon('village'),
  venue: makeIcon('venue'),
  parking: makeIcon('parking'),
};

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface ILeafletMapInnerProps {
  markers: IMapMarker[];
  center: [number, number];
  zoom: number;
  height: number | string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function LeafletMapInner({ markers, center, zoom, height }: ILeafletMapInnerProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div style={{ height: heightStyle, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <Marker
            key={i}
            position={[m.lat, m.lng]}
            icon={ICONS[m.kind]}
          >
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
