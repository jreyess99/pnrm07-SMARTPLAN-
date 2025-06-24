import React, { useEffect, useState } from 'react';

interface WeatherData {
  main: {
    temp: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  name: string;
}

const CITY = "Mexico City,MX";
const API_KEY = "b895f2a5ac7d6078015be7093ef582f6"; 

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=es`
    )
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener el clima");
        return res.json();
      })
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center text-gray-500">Cargando clima...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;
  if (!weather) return null;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-2">Clima en {weather.name}</h3>
      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
        alt={weather.weather[0].description}
        className="w-16 h-16"
      />
      <div className="text-2xl font-bold">{Math.round(weather.main.temp)}°C</div>
      <div className="capitalize text-gray-700">{weather.weather[0].description}</div>
    </div>
  );
};

export default WeatherWidget;