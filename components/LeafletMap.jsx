'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/icons/location-icon-2x.png',
  iconUrl: '/icons/location-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FitBounds({ items }) {
  const map = useMap();
  useEffect(() => {
    if (!items.length) return;
    if (items.length === 1) {
      map.setView([items[0].latitude, items[0].longitude], 13);
      return;
    }
    const bounds = L.latLngBounds(items.map((loc) => [loc.latitude, loc.longitude]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, items]);
  return null;
}

export default function LeafletMap({ locations = [], lat, lng, label }) {
  const items = locations.length
    ? locations
    : lat != null && lng != null
    ? [{ id: 'single', latitude: lat, longitude: lng, facility_name: label, address_line: '' }]
    : [];

  if (!items.length) return null;

  return (
    <MapContainer
      center={[items[0].latitude, items[0].longitude]}
      zoom={6}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds items={items} />
      {items.map((loc) => (
        <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
          <Popup>
            <strong>{loc.facility_name}</strong>
            {loc.address_line && (
              <>
                <br />
                {loc.address_line}
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
