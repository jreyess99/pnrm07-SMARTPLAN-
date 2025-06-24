import React, { useState, useEffect } from 'react';
import { fetchPanoramasFromTicketmaster } from '../data/mockData';
import PanoramaCard from '../components/PanoramaCard';
import WeatherWidget from '../components/WeatherWidget';
import { Category, Panorama } from '../types';
import toast, { Toast } from 'react-hot-toast';
import GoogleMapWidget from '../components/GoogleMapWidget';

const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const toastId = 'welcome-toast';
    toast.custom(
      (t: Toast) => (
        <div
          className={`$
            t.visible ? 'animate-enter' : 'animate-leave'
          } bg-blue-600 text-white p-4 rounded-lg shadow-lg w-[320px] flex flex-col items-center`}
        >
          <h3 className="text-lg font-semibold mb-2">¡Bienvenido a SmartPlan! 🌟</h3>
          <p className="text-sm text-center">
            Descubre las mejores actividades para disfrutar en la ciudad de Ciudad de México
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
    fetchPanoramasFromTicketmaster(selectedCategory)
      .then(setPanoramas)
      .catch((err) => setError('Error al cargar panoramas'))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const categories: Category[] = [
    'gastronomia', 'deportes', 'cultura', 'naturaleza', 'indoor',
    'outdoor', 'cine', 'teatro', 'ferias', 'talleres'
  ];

  const filteredPanoramas = panoramas.filter(panorama => {
    const categoryMatch = selectedCategory === 'all' || panorama.category === selectedCategory;
    return categoryMatch;
  });

  return (
    <div className="container mx-auto px-2 py-4 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Columna principal panoramas */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Descubre tu próximo panorama!</h1>

          {/* Filtros */}
          <div className="mb-4 space-y-2">
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
          </div>

          {/* Lista de panoramas */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              <div className="text-center text-gray-500 col-span-full">Cargando panoramas...</div>
            ) : error ? (
              <div className="text-center text-red-500 col-span-full">{error}</div>
            ) : filteredPanoramas.length === 0 ? (
              <div className="text-center text-gray-500 col-span-full">No se encontraron panoramas.</div>
            ) : (
              filteredPanoramas.map(panorama => (
                <PanoramaCard key={panorama.id} panorama={panorama} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white/80 rounded-xl shadow p-4">
            <WeatherWidget />
          </div>
          <div className="bg-white/80 rounded-xl shadow p-4">
            <GoogleMapWidget
              events={filteredPanoramas.map(p => ({
                lat: p.location.lat,
                lng: p.location.lng,
                title: p.title,
                url: p.url
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;