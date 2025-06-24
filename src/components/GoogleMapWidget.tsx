import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
  }
}
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
console.log('GOOGLE_MAPS_API_KEY:', GOOGLE_MAPS_API_KEY); // <-- Log para depuración

const MAP_CENTER = { lat: 19.4326, lng: -99.1332 }; // Ciudad de México, MX

interface EventMarker {
  lat: number;
  lng: number;
  title: string;
  url?: string;
}

interface GoogleMapWidgetProps {
  events: EventMarker[];
}

const GoogleMapWidget: React.FC<GoogleMapWidgetProps> = ({ events }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (mapRef.current && window.google) {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: MAP_CENTER,
          zoom: 12,
        });
        // Agregar marcadores
        events.forEach(event => {
          const marker = new window.google.maps.Marker({
            position: { lat: event.lat, lng: event.lng },
            map: mapInstance.current,
            title: event.title,
          });
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div><strong>${event.title}</strong><br/>${event.url ? `<a href='${event.url}' target='_blank' rel='noopener noreferrer'><button style='margin-top:6px;padding:4px 10px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;'>Comprar</button></a>` : ''}</div>`
          });
          marker.addListener('click', () => {
            infoWindow.open(mapInstance.current, marker);
          });
        });
      }
    }
  }, [events]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0, margin: 0 }}>
      <h3 className="text-lg font-semibold mb-2" style={{ margin: 0 }}>Mapa de Ciudad de México</h3>
      <div
        ref={mapRef}
        style={{ width: '100%', maxWidth: '700px', height: '420px', borderRadius: '0.75rem', boxShadow: '0 2px 8px #0001', margin: 0, padding: 0 }}
      />
    </div>
  );
};

export default GoogleMapWidget;
