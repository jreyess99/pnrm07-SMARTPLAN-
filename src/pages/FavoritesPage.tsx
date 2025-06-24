import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Panorama } from '../types';
import PanoramaCard from '../components/PanoramaCard';
import axios from 'axios';

const FavoritesPage: React.FC = () => {
  const { user, token } = useAuth();
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      setPanoramas([]);
      setLoading(false);
      return;
    }
    // Obtener todos los panoramas y filtrar por favoritos del usuario
    axios.get('/api/ticketmaster')
      .then(res => {
        const events = res.data._embedded?.events || [];
        const allPanoramas: Panorama[] = events.map((event: any) => ({
          id: event.id,
          title: event.name,
          description: event.info || event.pleaseNote || 'Sin descripción',
          category: event.classifications?.[0]?.segment?.name?.toLowerCase() || 'cultura',
          companyType: ['individual', 'pareja', 'grupo', 'familia'],
          price: event.priceRanges?.[0]?.min || 10000,
          location: {
            lat: event._embedded?.venues?.[0]?.location?.latitude
              ? parseFloat(event._embedded.venues[0].location.latitude)
              : 19.4326,
            lng: event._embedded?.venues?.[0]?.location?.longitude
              ? parseFloat(event._embedded.venues[0].location.longitude)
              : -99.1332,
            address: event._embedded?.venues?.[0]?.address?.line1 || 'Dirección no disponible',
            city: event._embedded?.venues?.[0]?.city?.name || 'Ciudad de México',
          },
          weatherDependent: event.outdoorEvent || false,
          indoor: !event.outdoorEvent,
          availability: {
            startDate: event.dates?.start?.localDate || '2024-01-01',
            endDate: event.dates?.end?.localDate || event.dates?.start?.localDate || '2024-12-31',
            capacity: 100,
            currentOccupancy: 0,
          },
          imageUrl: event.images?.[0]?.url || 'https://via.placeholder.com/400x300',
          rating: 4.5,
          date: event.dates?.start?.localDate || '',
          time: event.dates?.start?.localTime || '',
          url: event.url || '',
        }));
        setPanoramas(allPanoramas.filter(p => user.favorites.includes(p.id)));
      })
      .finally(() => setLoading(false));
  }, [user, token]);

  if (!user) return <div className="text-center text-gray-500 mt-8">Inicia sesión para ver tus favoritos.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h2 className="text-2xl font-bold mb-6 text-primary">Mis Favoritos</h2>
      {loading ? (
        <div className="text-center text-gray-500">Cargando favoritos...</div>
      ) : panoramas.length === 0 ? (
        <div className="text-center text-gray-500">No tienes panoramas favoritos aún.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {panoramas.map(panorama => (
            <PanoramaCard key={panorama.id} panorama={panorama} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
