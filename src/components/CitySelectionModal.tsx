"use client";

import { useState, useEffect } from "react";
import City from "../domain/city";
import CitiesRestRepository from "../infractructure/cities-rest.repository";

interface CitySelectionModalProps {
  isOpen: boolean;
  onCitySelected: (cityId: number) => void;
}

export default function CitySelectionModal({
  isOpen,
  onCitySelected,
}: CitySelectionModalProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCities() {
      const citiesRepo = new CitiesRestRepository();
      const loadedCities = await citiesRepo.getAll();
      setCities(loadedCities);
      setIsLoading(false);
    }

    if (isOpen) {
      loadCities();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (selectedCityId) {
      onCitySelected(selectedCityId);
    }
  };

  if (!isOpen) return null;

  console.log("🎭 CitySelectionModal rendered (isOpen=true)");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-700">
        <h2 className="text-white text-2xl font-bold mb-2">
          Добро пожаловать! 👋
        </h2>
        <p className="text-slate-400 text-base mb-6">
          Выберите ваш город, чтобы видеть релевантные шахматные события
        </p>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => setSelectedCityId(city.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCityId === city.id
                      ? "bg-blue-500/20 border-2 border-blue-500 text-white"
                      : "bg-slate-800 border-2 border-transparent text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedCityId}
              className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              Продолжить
            </button>
          </>
        )}
      </div>
    </div>
  );
}
