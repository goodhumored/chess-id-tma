"use client";

import { useEffect, useState } from "react";
import { useTelegram } from "../components/TelegramProvider";
import { useAuth } from "../components/AuthProvider";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../lib/utils";
import ChessEvent from "../domain/chess-event";
import ChessEventsService from "../domain/chess-events-service";
import ChessEventsRestRepository from "../infractructure/chess-events-rest.repository";
import EventCard from "../components/event-card";


const filters = {
  all: "Все",
  tournament: "Турниры",
  training: "Тренировки",
  meeting: "Встречи",
  lectures: "Лекции",
}

export default function Home() {
  const repo = new ChessEventsRestRepository();
  const service = new ChessEventsService(repo);
  const [events, setEvents] = useState<ChessEvent[]>([]);
  const [selected, setSelected] = useState<string>("all");
  const [eventsLoading, setEventsLoading] = useState(true);

  // Используем AuthProvider для получения текущего пользователя
  const { user: profile, isLoading: authLoading } = useAuth();

  // Используем Telegram WebApp для получения фото профиля
  const { isReady, user: tgUser } = useTelegram();

  useEffect(() => {
    // Не загружаем события пока не загрузится профиль
    if (authLoading) {
      return;
    }

    // Устанавливаем loading state перед загрузкой
    setEventsLoading(true);

    const filters: { type?: string; city_id?: number; dateFrom?: Date } = {};

    // Добавляем фильтр по типу события (если не "all")
    if (selected !== "all") {
      filters.type = selected;
    }

    // Добавляем фильтр по городу пользователя (если указан)
    if (profile?.city_id) {
      filters.city_id = profile.city_id;
    }

    // Не показываем события старше 1 дня
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    filters.dateFrom = oneDayAgo;

    service.findEvents(filters).then((loadedEvents) => {
      setEvents(loadedEvents);
      setEventsLoading(false);
    });
  }, [selected, profile, authLoading]);

  if (!isReady || authLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading Telegram Mini App...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          События
        </h1>
        <Link
          href="/profile"
          className="block relative rounded-full overflow-hidden w-10 h-10 bg-gray-700"
        >
          {tgUser?.photo_url ? (
            <Image fill alt="profile pic" src={tgUser.photo_url} />
          ) : profile ? (
            <div className="flex items-center justify-center w-full h-full text-white font-bold text-lg">
              {profile.username?.[0]?.toUpperCase() || "?"}
            </div>
          ) : null}
        </Link>
      </div>
      {/* <SearchField value={searchValue} onChange={setSearchValue} placeholder="Найти" className="mb-5" /> */}
      <div className="max-w-full overflow-x-scroll scrollbar-hidden">
        <Filters onChange={setSelected} filters={filters} />
      </div>
      <div className="mt-6 space-y-4 flex flex-col  max-w-3xl mx-auto">
        {eventsLoading ? (
          // Показываем skeleton loader пока события загружаются
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-slate-800/50 rounded-xl p-4 animate-pulse"
              >
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          // Показываем события когда они загружены
          events.map((event, i) => (
            <EventCard key={i} event={event} />
          ))
        ) : (
          // Показываем сообщение если событий нет
          <div className="text-center py-8">
            <p className="text-slate-400">Нет событий для отображения</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Filters({ filters, onChange }: { filters: { [key: string]: string }, onChange?: (key: string) => void }) {
  const [selectedItem, setSelectedItem] = useState<string | undefined>(undefined);
  return <div className="flex max-w-none items-center space-x-3">
    {Object.entries(filters).map(([val, label]) => (
      <div key={val} className={cn("rounded-full leading-normal py-2 px-4 transition-colors", val == selectedItem ? "bg-[#2B8CEE] text-white  font-bold" : "bg-[#1F2937] text-[#D1D5DB] font-medium")} onClick={() => { setSelectedItem(val); onChange?.(val) }}>
        {label}
      </div>))}
  </div>
}
