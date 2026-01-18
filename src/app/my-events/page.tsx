"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import EventCard from "../../components/event-card";
import ChessEvent, { EventOrganizer, EventCity } from "../../domain/chess-event";
import { SimpleEvent } from "../../domain/event-registration";
import EventRegistrationsRestRepository from "../../infractructure/event-registrations-rest.repository";
import { useAuth } from "../../components/AuthProvider";
import { useTelegram } from "../../components/TelegramProvider";
import { useRole } from "../../hooks/useRole";

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
    0, // participants - пока неизвестно сколько
    simpleEvent.limit_participants,
    `https://picsum.photos/seed/${simpleEvent.id}/800/600`, // placeholder image
    simpleEvent.status,
    simpleEvent.created_at,
  );
}

export default function MyEvents() {
  const [events, setEvents] = useState<ChessEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: profile } = useAuth();
  const { user: tgUser } = useTelegram();
  const { canCreateEvent } = useRole();

  useEffect(() => {
    async function fetchMyEvents() {
      try {
        const repo = new EventRegistrationsRestRepository();
        const registrations = await repo.getMyRegistrations();

        // Конвертируем SimpleEvent в ChessEvent
        const chessEvents = registrations
          .map(reg => reg.event)
          .filter((event): event is SimpleEvent => event !== undefined)
          .map(simpleEventToChessEvent);

        setEvents(chessEvents);
      } catch (error) {
        console.error("Failed to fetch my events:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-lg text-gray-600 text-center">
          У вас пока нет записей на события
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 relative pb-24">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Мои события
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

      {/* Кнопка создания события для партнёров и админов */}
      {canCreateEvent() && (
        <Link
          href="/events/create"
          className="block w-full mb-6 p-4 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
        >
          <div className="flex items-center justify-center gap-2 text-white font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Создать событие</span>
          </div>
        </Link>
      )}

      <div className="mt-6 space-y-4 flex flex-col max-w-3xl mx-auto">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
