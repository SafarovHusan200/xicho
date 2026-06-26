// components/MapPicker.jsx
'use client';
import { renderToStaticMarkup } from 'react-dom/server';
import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

const iconHtml = renderToStaticMarkup(<MapPin size={32} color="#01ABFF" fill="#fff" />);

const purpleIcon = L.divIcon({
  className: '',
  html: iconHtml,
  iconSize: [50, 50],
  iconAnchor: [25, 50],
});

function ClickHandler({ onSelect, initial }) {
  const [pos, setPos] = useState(initial || null);
  useMapEvents({
    click(e) {
      setPos(e.latlng);
      onSelect(e.latlng);
    },
  });
  return pos ? <Marker position={[pos.lat, pos.lng]} icon={purpleIcon} /> : null;
}

export default function MapPicker({ onChange, initialCoords = null }) {
  const mapRef = useRef(null);
  const center = initialCoords ? [initialCoords.lat, initialCoords.lng] : [41.2995, 69.2401];

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return (
    <div className="relative z-0 rounded-lg overflow-hidden">
      <MapContainer ref={mapRef} center={center} zoom={13} style={{ height: 280 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler
          initial={initialCoords}
          onSelect={({ lat, lng }) => onChange({ latitude: lat, longitude: lng })}
        />
      </MapContainer>
    </div>
  );
}
