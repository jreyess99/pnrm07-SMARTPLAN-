import React, { useState, useEffect } from 'react';
import { Panorama } from '../types';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface PanoramaCardProps {
  panorama: Panorama;
}

const PanoramaCard: React.FC<PanoramaCardProps> = ({ panorama }) => {
  const { user, token, login } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const panoramaId = panorama.id;

  useEffect(() => {
    if (user) {
      setIsFavorite(user.favorites.includes(panoramaId));
    } else {
      setIsFavorite(false);
    }
    // Obtener el conteo global de favoritos
    axios.get(`/api/favorites-count/${panoramaId}`)
      .then(res => setFavoriteCount(res.data.count))
      .catch(() => setFavoriteCount(0));
  }, [user, panoramaId]);

  const handleFavorite = async () => {
    if (!user || !token) return;
    try {
      if (isFavorite) {
        const res = await axios.delete(`/api/favorites/${panoramaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
        setFavoriteCount(favoriteCount - 1);
        // Actualizar favoritos del usuario en el contexto global
        login({ ...user, favorites: res.data.favorites }, token);
      } else {
        const res = await axios.post(`/api/favorites/${panoramaId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(true);
        setFavoriteCount(favoriteCount + 1);
        // Actualizar favoritos del usuario en el contexto global
        login({ ...user, favorites: res.data.favorites }, token);
      }
    } catch (err) {
      // Opcional: mostrar error
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-xs mx-auto">
      <img
        src={panorama.imageUrl}
        alt={panorama.title}
        className="w-full h-32 object-cover"
      />
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-gray-800 line-clamp-1">{panorama.title}</h3>
          <button
            onClick={handleFavorite}
            className={`ml-2 text-xl ${isFavorite ? 'text-red-600' : 'text-gray-400'} hover:text-red-600 transition-colors`}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            disabled={!user}
          >
            ♥
          </button>
        </div>
        <p className="text-gray-600 mb-2 text-sm line-clamp-2">{panorama.description}</p>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            {/* Se eliminó la visualización del precio y el mensaje aclaratorio */}
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-1">
          {panorama.date && (
            <span className="mr-1">📅 {panorama.date}</span>
          )}
          {panorama.time && (
            <span className="mr-1">🕒 {panorama.time}</span>
          )}
          {panorama.location.city && (
            <span>📍 {panorama.location.city}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-pink-600 text-xs font-semibold">{favoriteCount} favoritos</span>
        </div>
        {/* Botón de compra si hay url */}
        {panorama.url ? (
          <a
            href={panorama.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block w-full bg-accent text-white py-1.5 px-2 rounded-md hover:bg-yellow-600 transition-colors text-center text-sm"
          >
            Comprar entrada
          </a>
        ) : (
          <button className="mt-2 w-full bg-primary text-white py-1.5 px-2 rounded-md hover:bg-blue-600 transition-colors text-sm">
            Ver detalles
          </button>
        )}
      </div>
    </div>
  );
};

export default PanoramaCard;