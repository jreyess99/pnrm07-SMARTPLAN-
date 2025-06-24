export type Category = 'gastronomia' | 'deportes' | 'cultura' | 'naturaleza' | 'indoor' | 'outdoor' | 'cine' | 'teatro' | 'ferias' | 'talleres';

export type CompanyType = 'individual' | 'pareja' | 'grupo' | 'familia';

export interface Panorama {
  id: string;
  title: string;
  description: string;
  category: Category | string;
  companyType: CompanyType[];
  price: number;
  location: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
  };
  weatherDependent: boolean;
  indoor: boolean;
  availability: {
    startDate: string;
    endDate: string;
    capacity: number;
    currentOccupancy: number;
  };
  imageUrl: string;
  rating: number;
  date?: string;
  time?: string;
  url?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

export interface UserPreferences {
  categories: Category[];
  companyType: CompanyType;
  maxPrice: number;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  _id: string;
  email: string;
  favorites: string[];
  attending: string[];
}