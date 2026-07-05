'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/icons/location-icon-2x.png',
  iconUrl: '/icons/location-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LeafletMap({ locations = [], lat, lng, label }) {
  const items = locations.length
    ? locations
    : lat != null && lng != null
    ? [{ id: 'single', latitude: lat, longitude: lng, facility_name: label, address_line: '' }]
    : [];

  if (!items.length) return null;
  const center = [items[0].latitude, items[0].longitude];
  const zoom = items.length === 1 ? 14 : 8;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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
