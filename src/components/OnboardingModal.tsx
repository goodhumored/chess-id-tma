"use client";

import { useState, useEffect } from "react";
import City from "../domain/city";
import CitiesRestRepository from "../infractructure/cities-rest.repository";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: {
    cityId: number;
    skillLevel: string;
    phone?: string;
  }) => void;
}

type SkillLevel = "новичок" | "любитель" | "профессионал";

const SKILL_LEVELS: { value: SkillLevel; label: string; description: string }[] =
  [
    {
      value: "новичок",
      label: "Новичок",
      description: "Только начинаю изучать шахматы",
    },
    {
      value: "любитель",
      label: "Любитель",
      description: "Играю регулярно, знаю основные стратегии",
    },
    {
      value: "профессионал",
      label: "Профессионал",
      description: "Участвую в турнирах, имею разряд",
    },
  ];

export default function OnboardingModal({
  isOpen,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState<"city" | "skill" | "phone">("city");
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] =
    useState<SkillLevel | null>(null);
  const [phone, setPhone] = useState("");
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

  const handleContinueFromCity = () => {
    if (selectedCityId) {
      setStep("skill");
    }
  };

  const handleContinueFromSkill = () => {
    if (selectedSkillLevel) {
      setStep("phone");
    }
  };

  const handleComplete = () => {
    if (selectedCityId && selectedSkillLevel) {
      onComplete({
        cityId: selectedCityId,
        skillLevel: selectedSkillLevel,
        phone: phone.trim() || undefined,
      });
    }
  };

  const handleSkipPhone = () => {
    if (selectedCityId && selectedSkillLevel) {
      onComplete({
        cityId: selectedCityId,
        skillLevel: selectedSkillLevel,
      });
    }
  };

  if (!isOpen) return null;

  console.log("🎭 OnboardingModal rendered (isOpen=true, step=" + step + ")");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-700">
        {/* Step indicator */}
        <div className="flex justify-center mb-6 space-x-2">
          <div
            className={`h-2 w-2 rounded-full transition-colors ${
              step === "city" ? "bg-blue-500" : "bg-slate-600"
            }`}
          />
          <div
            className={`h-2 w-2 rounded-full transition-colors ${
              step === "skill" ? "bg-blue-500" : "bg-slate-600"
            }`}
          />
          <div
            className={`h-2 w-2 rounded-full transition-colors ${
              step === "phone" ? "bg-blue-500" : "bg-slate-600"
            }`}
          />
        </div>

        {/* City selection step */}
        {step === "city" && (
          <>
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
                  onClick={handleContinueFromCity}
                  disabled={!selectedCityId}
                  className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  Продолжить
                </button>
              </>
            )}
          </>
        )}

        {/* Skill level selection step */}
        {step === "skill" && (
          <>
            <h2 className="text-white text-2xl font-bold mb-2">
              Ваш уровень игры ♟️
            </h2>
            <p className="text-slate-400 text-base mb-6">
              Это поможет подобрать подходящие мероприятия
            </p>

            <div className="space-y-3 mb-6">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedSkillLevel(level.value)}
                  className={`w-full text-left px-4 py-4 rounded-lg transition-colors ${
                    selectedSkillLevel === level.value
                      ? "bg-blue-500/20 border-2 border-blue-500"
                      : "bg-slate-800 border-2 border-transparent hover:bg-slate-700"
                  }`}
                >
                  <div className="text-white font-semibold mb-1">
                    {level.label}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {level.description}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep("city")}
                className="flex-1 bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-base hover:bg-slate-600 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={handleContinueFromSkill}
                disabled={!selectedSkillLevel}
                className="flex-1 bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                Продолжить
              </button>
            </div>
          </>
        )}

        {/* Phone input step */}
        {step === "phone" && (
          <>
            <h2 className="text-white text-2xl font-bold mb-2">
              Контактный телефон 📞
            </h2>
            <p className="text-slate-400 text-base mb-6">
              Организаторы смогут связаться с вами при необходимости
              (необязательно)
            </p>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (___) ___-__-__"
              className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg mb-6 border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
            />

            <div className="flex space-x-3">
              <button
                onClick={() => setStep("skill")}
                className="flex-1 bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-base hover:bg-slate-600 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={handleSkipPhone}
                className="flex-1 bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-base hover:bg-slate-600 transition-colors"
              >
                Пропустить
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-base hover:bg-blue-600 transition-colors"
              >
                Готово
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
