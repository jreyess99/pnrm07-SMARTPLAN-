import React, { useState, useEffect } from 'react';
import { fetchPanoramasFromTicketmaster } from '../data/mockData';
import PanoramaCard from '../components/PanoramaCard';
import WeatherWidget from '../components/WeatherWidget';
import { Category, CompanyType, Panorama } from '../types';
import toast, { Toast } from 'react-hot-toast';
import GoogleMapWidget from '../components/GoogleMapWidget';

const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedCompanyType, setSelectedCompanyType] = useState<CompanyType | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const toastId = 'welcome-toast';
    toast.custom(
      (t: Toast) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } bg-blue-600 text-white p-4 rounded-lg shadow-lg w-[320px] flex flex-col items-center`}
        >
          <h3 className="text-lg font-semibold mb-2">¡Bienvenido a Panorama! 🌟</h3>
          <p className="text-sm text-center">
            Descubre las mejores actividades para disfrutar en la ciudad de Santiago
          </p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="mt-2 px-3 py-1 text-sm bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      ),
      { id: toastId }
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPanoramasFromTicketmaster()
      .then(setPanoramas)
      .catch((err) => setError('Error al cargar panoramas'))
      .finally(() => setLoading(false));
  }, []);

  const categories: Category[] = [
    'gastronomia', 'deportes', 'cultura', 'naturaleza', 'indoor',
    'outdoor', 'cine', 'teatro', 'ferias', 'talleres'
  ];
  const companyTypes: CompanyType[] = ['individual', 'pareja', 'grupo', 'familia'];

  const filteredPanoramas = panoramas.filter(panorama => {
    const categoryMatch = selectedCategory === 'all' || panorama.category === selectedCategory;
    const companyTypeMatch = selectedCompanyType === 'all' || panorama.companyType.includes(selectedCompanyType);
    const priceMatch = panorama.price <= maxPrice;
    return categoryMatch && companyTypeMatch && priceMatch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">¡Descubre tu próximo panorama!</h1>

          {/* Filtros */}
          <div className="mb-8 space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Categorías</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full font-medium shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-white scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-primary/10'
                  }`}
                >
                  Todas
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      selectedCategory === category
                        ? 'bg-primary text-white scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-primary/10'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Tipo de compañía</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCompanyType('all')}
                  className={`px-4 py-2 rounded-full font-medium shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    selectedCompanyType === 'all'
                      ? 'bg-primary text-white scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-primary/10'
                  }`}
                >
                  Todos
                </button>
                {companyTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedCompanyType(type)}
                    className={`px-4 py-2 rounded-full font-medium shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      selectedCompanyType === type
                        ? 'bg-primary text-white scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-primary/10'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Precio máximo: ${maxPrice.toLocaleString()}</h2>
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary h-2 rounded-lg bg-gray-200 appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Lista de panoramas */}
          {loading ? (
            <div className="text-center text-gray-500">Cargando panoramas...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : filteredPanoramas.length === 0 ? (
            <div className="text-center text-gray-500">No se encontraron panoramas.</div>
          ) : (
            filteredPanoramas.map(panorama => (
              <PanoramaCard key={panorama.id} panorama={panorama} />
            ))
          )}
        </div>

        {/* Sidebar con widget del clima y mapa */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white/80 rounded-xl shadow p-4">
            <WeatherWidget />
          </div>
          <div className="bg-white/80 rounded-xl shadow p-4">
            <GoogleMapWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;