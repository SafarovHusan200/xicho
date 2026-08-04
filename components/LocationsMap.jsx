'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin, ExternalLink } from 'lucide-react';

const activeIconHtml = renderToStaticMarkup(<MapPin size={32} color="#1d4ed8" fill="#dbeafe" />);
const defaultIconHtml = renderToStaticMarkup(<MapPin size={28} color="#3b82f6" fill="#eff6ff" />);

const createIcon = (isActive) =>
  L.divIcon({
    className: '',
    html: isActive ? activeIconHtml : defaultIconHtml,
    iconSize: isActive ? [36, 36] : [28, 28],
    iconAnchor: isActive ? [18, 36] : [14, 28],
    popupAnchor: [0, -36],
  });

function MapController({ locations, activeLocationId }) {
  const map = useMap();

  useEffect(() => {
    if (activeLocationId) {
      const loc = locations.find((l) => l.id === activeLocationId);
      if (loc) {
        map.flyTo([loc.latitude, loc.longitude], 15, { duration: 0.8 });
      }
    } else if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [activeLocationId, locations, map]);

  return null;
}

export default function LocationsMap({ locations, facilityMap, activeLocationId, onMarkerClick }) {
  const center =
    locations.length > 0 ? [locations[0].latitude, locations[0].longitude] : [41.2995, 69.2401];
  const activeLocation = locations.find((l) => l.id === activeLocationId);

  return (
    <div className="flex-1 relative z-0">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ZoomControl position="bottomright" />
        <MapController locations={locations} activeLocationId={activeLocationId} />

        {locations.map((location) => {
          const isActive = location.id === activeLocationId;
          const facility = facilityMap?.[location.facility_id];
          return (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={createIcon(isActive)}
              zIndexOffset={isActive ? 1000 : 0}
              eventHandlers={{ click: () => onMarkerClick(location.id) }}
            >
              <Popup>
                <div className="min-w-40">
                  <p className="font-semibold text-sm text-gray-800">
                    {facility?.name ?? "Noma'lum ob'ekt"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{location.address_line}</p>
                  <p className="text-xs font-mono text-gray-600 mt-1">
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {activeLocation && (
        <a
          href={`https://www.google.com/maps?q=${activeLocation.latitude},${activeLocation.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 z-400 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold border shadow-sm transition-opacity  bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
        >
          <ExternalLink size={11} />
          Google Maps
        </a>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-4 py-1.5 rounded-full pointer-events-none">
        LAT: {center[0].toFixed(4)} &nbsp;|&nbsp; LNG: {center[1].toFixed(4)}
      </div>
    </div>
  );
}
