"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { useTelegram } from "../../components/TelegramProvider";
import ChessEvent from "../../domain/chess-event";
import { SimpleEvent } from "../../domain/event-registration";
import EventRegistrationsRestRepository from "../../infractructure/event-registrations-rest.repository";
import LocationIcon from "@/../public/location_on.svg";
import Image from "next/image";
import Tabs from "../../components/tabs";
import { EventOrganizer, EventCity } from "../../domain/chess-event";
import CitySelectionModal from "../../components/CitySelectionModal";
import UsersRestRepository from "../../infractructure/users-rest.repository";
import UsersService from "../../domain/user-service";

function simpleEventToChessEvent(simpleEvent: SimpleEvent): ChessEvent {
  const organizer: EventOrganizer = {
    id: simpleEvent.organizer.id,
    username: simpleEvent.organizer.username,
    telegram_id: simpleEvent.organizer.telegram_id,
  };

  const city: EventCity = {
    id: simpleEvent.city.id,
    name: simpleEvent.city.name,
  };

  return new ChessEvent(
    simpleEvent.id,
    simpleEvent.title,
    simpleEvent.event_type,
    simpleEvent.datetime_start,
    simpleEvent.datetime_end,
    simpleEvent.address,
    simpleEvent.description || "",
    organizer,
    city,
    0,
    simpleEvent.limit_participants,
    `https://picsum.photos/seed/${simpleEvent.id}/800/600`,
    simpleEvent.status,
    simpleEvent.created_at,
  );
}

export default function Profile() {
  // Используем AuthProvider для получения текущего пользователя
  const { user: profile, isLoading } = useAuth();
  const { user: tgUser } = useTelegram();

  const registrationsRepo = new EventRegistrationsRestRepository();
  const [upcomingEvents, setUpcomingEvents] = useState<ChessEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<ChessEvent[]>([]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  useEffect(() => {
    async function fetchUserEvents() {
      if (localProfile) {
        try {
          const registrations = await registrationsRepo.getMyRegistrations();
          const now = new Date();

          const events = registrations
            .map(reg => reg.event)
            .filter((event): event is SimpleEvent => event !== undefined)
            .map(simpleEventToChessEvent);

          // Разделяем на предстоящие и прошедшие
          const upcoming = events.filter(e => new Date(e.date) >= now);
          const past = events.filter(e => new Date(e.date) < now);

          setUpcomingEvents(upcoming);
          setPastEvents(past);
        } catch (error) {
          console.error("Failed to fetch user events:", error);
        }
      }
    }
    fetchUserEvents();
  }, [localProfile]);

  const handleCityChange = async (cityId: number) => {
    if (!localProfile) return;

    try {
      const userRepo = new UsersRestRepository();
      const userService = new UsersService(userRepo);

      const updatedUser = await userService.updateCurrentUser({
        city_id: cityId,
      });

      setLocalProfile(updatedUser);
      setShowCityModal(false);
    } catch (error) {
      console.error("Failed to update city:", error);
      alert("Не удалось изменить город. Попробуйте ещё раз.");
    }
  };

  const handleSkillLevelChange = async (skillLevel: string) => {
    if (!localProfile) return;

    try {
      const userRepo = new UsersRestRepository();
      const userService = new UsersService(userRepo);

      const updatedUser = await userService.updateCurrentUser({
        skill_level: skillLevel,
      });

      setLocalProfile(updatedUser);
      setShowSkillModal(false);
    } catch (error) {
      console.error("Failed to update skill level:", error);
      alert("Не удалось изменить уровень игры. Попробуйте ещё раз.");
    }
  };

  const handlePhoneChange = async (phone: string) => {
    if (!localProfile) return;

    try {
      const userRepo = new UsersRestRepository();
      const userService = new UsersService(userRepo);

      const updatedUser = await userService.updateCurrentUser({
        phone: phone.trim() || null,
      });

      setLocalProfile(updatedUser);
      setShowPhoneModal(false);
    } catch (error) {
      console.error("Failed to update phone:", error);
      alert("Не удалось изменить телефон. Попробуйте ещё раз.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return localProfile ? (
    <main className="">
      <CitySelectionModal
        isOpen={showCityModal}
        onCitySelected={handleCityChange}
      />
      <SkillLevelModal
        isOpen={showSkillModal}
        currentLevel={localProfile.skill_level}
        onSkillSelected={handleSkillLevelChange}
        onClose={() => setShowSkillModal(false)}
      />
      <PhoneModal
        isOpen={showPhoneModal}
        currentPhone={localProfile.phone}
        onPhoneSubmit={handlePhoneChange}
        onClose={() => setShowPhoneModal(false)}
      />
      <div className="flex p-4 @container">
        <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
          <div className="flex gap-4">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-20 w-20 min-h-20 min-w-20 bg-gray-700"
              data-alt="User avatar from Telegram"
              style={{ backgroundImage: tgUser?.photo_url ? `url('${tgUser.photo_url}')` : undefined }}
            >
              {!tgUser?.photo_url && localProfile && (
                <div className="flex items-center justify-center w-full h-full text-white font-bold text-3xl">
                  {localProfile.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                {localProfile.getDisplayName()}
              </p>
              <p className="text-slate-400 text-base font-normal leading-normal">
                {localProfile.getCityName()}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 px-4 py-3">
        <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-1 rounded-xl bg-slate-800/50 p-3 items-start">
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            {localProfile.skill_level || "Не указан"}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-slate-400 text-sm font-normal leading-normal">
              Уровень игры
            </p>
          </div>
        </div>
        {localProfile.phone && (
          <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-1 rounded-xl bg-slate-800/50 p-3 items-start">
            <p className="text-white tracking-light text-lg font-bold leading-tight">
              {localProfile.phone}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-slate-400 text-sm font-normal leading-normal">
                Телефон
              </p>
            </div>
          </div>
        )}
      </div>
      {/* <!-- Tabs --> */}
      <Tabs className="sticky top-[68px] z-10 pb-3 " tabs={["Мои События", "История", "Настройки"]} >
        <div className="flex flex-col gap-4 pb-8">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <p className="text-slate-400 text-base font-normal leading-normal px-4 pt-4">
              У вас нет предстоящих событий
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4 pb-8">
          {pastEvents.length > 0 ? (
            pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <p className="text-slate-400 text-base font-normal leading-normal px-4 pt-4">
              У вас нет прошедших событий
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4 pb-8 px-4 pt-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-lg font-semibold">Основные настройки</h3>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex flex-col gap-1">
                <p className="text-white text-base font-medium">Город</p>
                <p className="text-slate-400 text-sm">{localProfile.getCityName()}</p>
              </div>
              <button
                onClick={() => setShowCityModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Изменить
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex flex-col gap-1">
                <p className="text-white text-base font-medium">Уровень игры</p>
                <p className="text-slate-400 text-sm">{localProfile.skill_level || "Не указан"}</p>
              </div>
              <button
                onClick={() => setShowSkillModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Изменить
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex flex-col gap-1">
                <p className="text-white text-base font-medium">Телефон</p>
                <p className="text-slate-400 text-sm">{localProfile.phone || "Не указан"}</p>
              </div>
              <button
                onClick={() => setShowPhoneModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {localProfile.phone ? "Изменить" : "Добавить"}
              </button>
            </div>
          </div>
        </div>
      </Tabs>
    </main >
  ) : <></>;
}

function SkillLevelModal({
  isOpen,
  currentLevel,
  onSkillSelected,
  onClose,
}: {
  isOpen: boolean;
  currentLevel: string | null;
  onSkillSelected: (level: string) => void;
  onClose: () => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);

  const SKILL_LEVELS = [
    { value: "новичок", label: "Новичок", description: "Только начинаю изучать шахматы" },
    { value: "любитель", label: "Любитель", description: "Играю регулярно, знаю основные стратегии" },
    { value: "профессионал", label: "Профессионал", description: "Участвую в турнирах, имею разряд" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-700">
        <h2 className="text-white text-2xl font-bold mb-2">Уровень игры ♟️</h2>
        <p className="text-slate-400 text-base mb-6">
          Выберите ваш уровень игры в шахматы
        </p>

        <div className="space-y-3 mb-6">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setSelectedLevel(level.value)}
              className={`w-full text-left px-4 py-4 rounded-lg transition-colors ${
                selectedLevel === level.value
                  ? "bg-blue-500/20 border-2 border-blue-500"
                  : "bg-slate-800 border-2 border-transparent hover:bg-slate-700"
              }`}
            >
              <div className="text-white font-semibold mb-1">{level.label}</div>
              <div className="text-slate-400 text-sm">{level.description}</div>
            </button>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-base hover:bg-slate-600 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={() => selectedLevel && onSkillSelected(selectedLevel)}
            disabled={!selectedLevel}
            className="flex-1 bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

function PhoneModal({
  isOpen,
  currentPhone,
  onPhoneSubmit,
  onClose,
}: {
  isOpen: boolean;
  currentPhone: string | null;
  onPhoneSubmit: (phone: string) => void;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState(currentPhone || "");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-700">
        <h2 className="text-white text-2xl font-bold mb-2">Контактный телефон 📞</h2>
        <p className="text-slate-400 text-base mb-6">
          Организаторы смогут связаться с вами при необходимости
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
            onClick={onClose}
            className="flex-1 bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-base hover:bg-slate-600 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={() => onPhoneSubmit(phone)}
            className="flex-1 bg-blue-500 text-white font-bold py-3 px-4 rounded-xl text-base hover:bg-blue-600 transition-colors"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: ChessEvent }) {
  return (
    <div className="px-4">
      <div className="flex flex-col gap-4 rounded-xl bg-slate-800/50 p-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <p className="text-white text-base font-bold leading-normal">{event.title}</p>
            <p className="text-slate-400 text-sm font-normal">{event.dateString()}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-cover bg-center" data-alt="Volleyball tournament banner image" style={{ backgroundImage: `url('${event.imageUrl}')` }}></div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Image src={LocationIcon} alt="" />
          <p className="text-sm">Парк Горького, Москва</p>
        </div>
      </div>
    </div>)
}

