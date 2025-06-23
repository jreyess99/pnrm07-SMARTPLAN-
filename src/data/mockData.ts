import { Panorama } from '../types';
import fetch from 'cross-fetch';


function mapTicketmasterEventToPanorama(event: any): Panorama {
  
  return {
    id: event.id,
    title: event.name,
    description: event.info || event.pleaseNote || 'Sin descripción',
    category: 'cultura', 
    companyType: ['individual', 'pareja', 'grupo', 'familia'], 
    price: event.priceRanges?.[0]?.min || 10000, 
    location: {
      lat: event._embedded?.venues?.[0]?.location?.latitude ? parseFloat(event._embedded.venues[0].location.latitude) : -33.4489,
      lng: event._embedded?.venues?.[0]?.location?.longitude ? parseFloat(event._embedded.venues[0].location.longitude) : -70.6693,
      address: event._embedded?.venues?.[0]?.address?.line1 || 'Dirección no disponible',
    },
    weatherDependent: false, // No hay info, por defecto false
    indoor: true, // No hay info, por defecto true
    availability: {
      startDate: event.dates?.start?.localDate || '2024-01-01',
      endDate: event.dates?.end?.localDate || event.dates?.start?.localDate || '2024-12-31',
      capacity: 100, // No hay info, valor por defecto
      currentOccupancy: 0, // No hay info, valor por defecto
    },
    imageUrl: event.images?.[0]?.url || 'https://via.placeholder.com/400x300',
    rating: 4.5, // No hay rating en Ticketmaster, valor por defecto
  };
}

export async function fetchPanoramasFromTicketmaster(): Promise<Panorama[]> {
  const response = await fetch('http://localhost:4000/api/ticketmaster');
  const data = await response.json();
  if (!data._embedded?.events) return [];
  return data._embedded.events.map(mapTicketmasterEventToPanorama);
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
      address: 'Barrio Lastarria, Santiago'
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
    rating: 4.8
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
      address: 'Parque Forestal, Santiago'
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
    rating: 4.9
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
      address: 'Museo Nacional de Bellas Artes, Santiago'
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
    rating: 4.7
  }
];