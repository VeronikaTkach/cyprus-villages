'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const CYPRUS_CENTER: [number, number] = [35.1264, 33.4299];

const pickerIcon = L.divIcon({
  html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:#e03131;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export interface IMapPickerInnerProps {
  lat?: number;
  lng?: number;
  onPick: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  height?: number | string;
}

export function MapPickerInner({
  lat,
  lng,
  onPick,
  center,
  zoom = 10,
  height = 280,
}: IMapPickerInnerProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  const hasCoords = lat !== undefined && lng !== undefined;
  const mapCenter: [number, number] = hasCoords ? [lat, lng] : (center ?? CYPRUS_CENTER);

  return (
    <div
      style={{
        height: heightStyle,
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'crosshair',
      }}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onPick} />
        {hasCoords && <Marker position={[lat, lng]} icon={pickerIcon} />}
      </MapContainer>
    </div>
  );
}
