"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import ChessEvent from "../../domain/chess-event";
import ChessEventsMockRepository from "../../infractructure/chess-events-mock.repository";
import ChessEventsService from "../../domain/chess-events-service";
import LocationIcon from "@/../public/location_on.svg";
import Image from "next/image";
import Tabs from "../../components/tabs";

export default function Profile() {
  // Используем AuthProvider для получения текущего пользователя
  const { user: profile, isLoading } = useAuth();

  const eventsRepo = new ChessEventsMockRepository();
  const eventsService = new ChessEventsService(eventsRepo);
  const [relatedEvents, setRelatedEvents] = useState<ChessEvent[]>([]);

  useEffect(() => {
    if (profile) {
      eventsService
        .findEvents({ participantId: String(profile.id) })
        .then(setRelatedEvents);
    }
  }, [profile]);

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

  return profile ? (
    <main className="">
      <div className="flex p-4 @container">
        <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
          <div className="flex gap-4">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-20 w-20 min-h-20 min-w-20"
              data-alt="User avatar from Telegram"
              style={{ backgroundImage: `url('${profile.getAvatarUrl()}')` }}
            ></div>
            <div className="flex flex-col justify-center">
              <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                {profile.getDisplayName()}
              </p>
              <p className="text-slate-400 text-base font-normal leading-normal">
                {profile.city_id ? `Город ID: ${profile.city_id}` : "Город не указан"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 px-4 py-3">
        <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-1 rounded-xl bg-slate-800/50 p-3 items-start">
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            {profile.skill_level || "N/A"}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-slate-400 text-sm font-normal leading-normal">
              Уровень мастерства
            </p>
          </div>
        </div>
        <div className="flex min-w-[111px] flex-1 basis-[fit-content] flex-col gap-1 rounded-xl bg-slate-800/50 p-3 items-start">
          <p className="text-white tracking-light text-2xl font-bold leading-tight">
            {profile.role_id || "N/A"}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-slate-400 text-sm font-normal leading-normal">
              Роль
            </p>
          </div>
        </div>
      </div>
      {/* <!-- Tabs --> */}
      <Tabs className="sticky top-[68px] z-10 pb-3 " tabs={["Мои События", "История", "Настройки"]} >
        <div className="flex flex-col gap-4 pb-8">
          {relatedEvents.length > 0 && (
            <EventCard event={relatedEvents[0]!} />
          )}
        </div>
        <div className="flex flex-col gap-4 pb-8">
          {relatedEvents.length > 0 && (
            <>
              {relatedEvents[0] && <EventCard event={relatedEvents[0]} />}
              {relatedEvents[1] && <EventCard event={relatedEvents[1]} />}
            </>
          )}
        </div>
        <div className="flex flex-col gap-4 pb-8">
          <p className="text-white text-base font-normal leading-normal px-4 pt-4">Настройки пока недоступны</p>
        </div>
      </Tabs>
    </main >
  ) : <></>;
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

