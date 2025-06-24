import { Panorama } from '../types';
import fetch from 'cross-fetch';


function mapTicketmasterEventToPanorama(event: any): Panorama {
  return {
    id: event.id,
    title: event.name,
    description: event.info || event.pleaseNote || 'Sin descripción',
    category: event.classifications?.[0]?.segment?.name?.toLowerCase() || 'cultura',
    companyType: ['individual', 'pareja', 'grupo', 'familia'],
    price: event.priceRanges?.[0]?.min || event.priceRanges?.[0]?.max || 0,
    location: {
      lat: event._embedded?.venues?.[0]?.location?.latitude
        ? parseFloat(event._embedded.venues[0].location.latitude)
        : 19.4326, // CDMX lat por defecto
      lng: event._embedded?.venues?.[0]?.location?.longitude
        ? parseFloat(event._embedded.venues[0].location.longitude)
        : -99.1332, // CDMX lng por defecto
      address: event._embedded?.venues?.[0]?.address?.line1 || 'Dirección no disponible',
      city: event._embedded?.venues?.[0]?.city?.name || 'Ciudad de México',
    },
    weatherDependent: event.outdoorEvent || false, // Si existe la propiedad
    indoor: !event.outdoorEvent, // Si existe la propiedad
    availability: {
      startDate: event.dates?.start?.localDate || '2024-01-01',
      endDate: event.dates?.end?.localDate || event.dates?.start?.localDate || '2024-12-31',
      capacity: 100,
      currentOccupancy: 0,
    },
    imageUrl: event.images?.[0]?.url || 'https://via.placeholder.com/400x300',
    rating: event.rating || (event.priceRanges?.[0]?.min ? 4.7 : 4.5), // Si hay precio, sube el rating
    date: event.dates?.start?.localDate || '',
    time: event.dates?.start?.localTime || '',
    url: event.url || '',
  };
}

export async function fetchPanoramasFromTicketmaster(category?: string): Promise<Panorama[]> {
  let url = 'http://localhost:4000/api/ticketmaster';
  if (category && category !== 'all') {
    url += `?classificationName=${encodeURIComponent(category)}`;
  }
  const response = await fetch(url);
  const data = await response.json();
  if (!data._embedded?.events) return [];
  // Eliminar duplicados por id
  const uniqueEvents = new Map();
  for (const event of data._embedded.events) {
    if (!uniqueEvents.has(event.id)) {
      uniqueEvents.set(event.id, event);
    }
  }
  return Array.from(uniqueEvents.values()).map(mapTicketmasterEventToPanorama);
}

export const mockPanoramas: Panorama[] = [
  {
    id: '1',
    title: 'Tour Gastronómico por el Barrio Lastarria',
    description: 'Descubre los sabores más auténticos de Santiago en este tour gastronómico por el histórico barrio Lastarria.',
    category: 'gastronomia',
    companyType: ['individual', 'pareja', 'grupo'],
    price: 25000,
    location: {
      lat: -33.4372,
      lng: -70.6306,
      address: 'Barrio Lastarria, Santiago',
      city: 'Santiago',
    },
    weatherDependent: true,
    indoor: false,
    availability: {
      startDate: '2024-04-15',
      endDate: '2024-12-31',
      capacity: 20,
      currentOccupancy: 8
    },
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    rating: 4.8,
    date: '2024-04-15',
    time: '10:00',
    url: '',
  },
  {
    id: '2',
    title: 'Clase de Yoga en el Parque',
    description: 'Disfruta de una clase de yoga al aire libre en el hermoso Parque Forestal.',
    category: 'deportes',
    companyType: ['individual', 'pareja', 'grupo'],
    price: 15000,
    location: {
      lat: -33.4355,
      lng: -70.6412,
      address: 'Parque Forestal, Santiago',
      city: 'Santiago',
    },
    weatherDependent: true,
    indoor: false,
    availability: {
      startDate: '2024-04-15',
      endDate: '2024-12-31',
      capacity: 30,
      currentOccupancy: 15
    },
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
    rating: 4.9,
    date: '2024-04-15',
    time: '09:00',
    url: '',
  },
  {
    id: '3',
    title: 'Visita al Museo de Bellas Artes',
    description: 'Explora las obras maestras del arte chileno e internacional en el Museo Nacional de Bellas Artes.',
    category: 'cultura',
    companyType: ['individual', 'pareja', 'grupo', 'familia'],
    price: 5000,
    location: {
      lat: -33.4358,
      lng: -70.6415,
      address: 'Museo Nacional de Bellas Artes, Santiago',
      city: 'Santiago',
    },
    weatherDependent: false,
    indoor: true,
    availability: {
      startDate: '2024-04-15',
      endDate: '2024-12-31',
      capacity: 100,
      currentOccupancy: 40
    },
    imageUrl: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb',
    rating: 4.7,
    date: '2024-04-15',
    time: '12:00',
    url: '',
  }
];