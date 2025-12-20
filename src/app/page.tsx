"use client";

import { useEffect, useState } from "react";
import { useTelegram } from "../components/TelegramProvider";
import { useAuth } from "../components/AuthProvider";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../lib/utils";
import ChessEvent from "../domain/chess-event";
import ChessEventsService from "../domain/chess-events-service";
import ChessEventsMockRepository from "../infractructure/chess-events-mock.repository";
import EventCard from "../components/event-card";


const filters = {
  all: "Все",
  tournament: "Турниры",
  training: "Тренировки",
  meeting: "Встречи",
  lectures: "Лекции",
}

export default function Home() {
  const repo = new ChessEventsMockRepository();
  const service = new ChessEventsService(repo);
  const [events, setEvents] = useState<ChessEvent[]>([]);
  const [selected, setSelected] = useState<string>("all");

  // Используем AuthProvider для получения текущего пользователя
  const { user: profile, isLoading: authLoading } = useAuth();

  useEffect(() => {
    service
      .findEvents(selected === "all" ? {} : { type: selected })
      .then(setEvents);
  }, [selected]);

  const { isReady } = useTelegram();

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
          className="block relative rounded-full overflow-hidden w-10 h-10"
        >
          {profile && (
            <Image fill alt="profile pic" src={profile.getAvatarUrl()} />
          )}
        </Link>
      </div>
      {/* <SearchField value={searchValue} onChange={setSearchValue} placeholder="Найти" className="mb-5" /> */}
      <div className="max-w-full overflow-x-scroll">
        <Filters onChange={setSelected} filters={filters} />
      </div>
      <div className="mt-6 space-y-4 flex flex-col  max-w-3xl mx-auto">
        {events.map((event, i) => (
          <EventCard key={i} event={event} />
        ))}
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
