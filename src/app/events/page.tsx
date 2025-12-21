"use client"
import { redirect, useSearchParams } from "next/navigation";
import ChessEventsService from "../../domain/chess-events-service";
import ChessEventsRestRepository from "../../infractructure/chess-events-rest.repository";
import EventRegistrationsRestRepository from "../../infractructure/event-registrations-rest.repository";
import Image, { StaticImageData } from "next/image";
import CalendarIcon from '@/../public/calendar_month.svg';
import Location from '@/../public/location_on.svg';
import PersonIcon from '@/../public/person.svg';
import { useEffect, useState } from "react";
import ChessEvent from "../../domain/chess-event";
import { useAuth } from "../../components/AuthProvider";

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: undefined });

export default function EventPage(
) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { user } = useAuth();
  const eventsRepo = new ChessEventsRestRepository();
  const eventsServ = new ChessEventsService(eventsRepo);
  const registrationsRepo = new EventRegistrationsRestRepository();

  const [event, setEvent] = useState<ChessEvent | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [signed, setSigned] = useState(false);
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id === null) {
      redirect('/404');
    }
    eventsServ.getById(id).then((_event) => {
      if (_event === null) {
        redirect('/404');
      }
      setEvent(_event);
      setParticipants(Array.from({ length: _event.participants }, (_, i) => `https://i.pravatar.cc/150?img=${i + 1}`));
    });
  }, [id]);

  // Проверяем зарегистрирован ли пользователь на это событие
  useEffect(() => {
    async function checkRegistration() {
      if (!user || !id) return;

      try {
        const registrations = await registrationsRepo.getMyRegistrations();
        const registration = registrations.find(reg => reg.eventId === Number(id));
        if (registration) {
          setSigned(true);
          setRegistrationId(registration.id);
        }
      } catch (error) {
        console.error("Failed to check registration:", error);
      }
    }

    checkRegistration();
  }, [user, id]);

  async function handleRegister() {
    console.log("🔘 Register button clicked", { user, id, isLoading });
    if (!user || !id) {
      console.log("❌ Cannot register: user or id missing", { user: !!user, id });
      return;
    }

    setIsLoading(true);
    try {
      const registration = await registrationsRepo.create({
        user_id: user.id,
        event_id: Number(id),
      });
      setSigned(true);
      setRegistrationId(registration.id);
    } catch (error: any) {
      console.error("Failed to register for event:", error);

      // Всегда перезапрашиваем регистрации после ошибки чтобы обновить UI
      try {
        const registrations = await registrationsRepo.getMyRegistrations();
        const registration = registrations.find(reg => reg.eventId === Number(id));
        if (registration) {
          console.log("✅ Found existing registration:", registration);
          setSigned(true);
          setRegistrationId(registration.id);
          // Не показываем ошибку если пользователь уже записан
          return;
        }
      } catch (e) {
        console.error("Failed to fetch registrations after error:", e);
      }

      // Показываем ошибку только если пользователь действительно не записан
      alert("Не удалось записаться на событие. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnregister() {
    if (!registrationId) return;

    setIsLoading(true);
    try {
      await registrationsRepo.delete(registrationId);
      setSigned(false);
      setRegistrationId(null);
    } catch (error) {
      console.error("Failed to unregister from event:", error);
      alert("Не удалось отменить запись");
    } finally {
      setIsLoading(false);
    }
  }

  return event ? (<main className="mx-auto">
    <div className="p-4">
      <div className="w-full flex items-center justify-center relative aspect-2/1 rounded-xl overflow-hidden">
        <Image src={event!.imageUrl} className="object-cover " fill alt={event.title} />
      </div>
      <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight text-left pb-3 pt-6">
        {event.title}
      </h1>
      <div className="mt-3 flex flex-col gap-6">
        <InfoItem icon={CalendarIcon} value={dateFormatter.format(event.date)} />
        <InfoItem icon={Location} value={`${event.city.name}, ${event.location}`} />
        <InfoItem icon={PersonIcon} value={event.organizer.username || event.organizer.telegram_id} />
      </div>
      <h2 className="text-white text-xl font-bold mb-2 mt-6">Описание</h2>
      <p className="mt-3 text-lg leading-7 text-gray-300">
        {event.description}
      </p>
      <h2 className="text-white text-xl font-bold mt-8">Участники</h2>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex -space-x-3">
          {participants.slice(0, 3).map((p, i) => (
            <div key={i} className="rounded-full size-10 overflow-hidden relative">
              <Image src={p} alt={`participant ${i}`} fill />
            </div>
          ))}
          {
            event.participants > 3 &&
            (
              <div className="rounded-full size-10 overflow-hidden text-center bg-gray-700 text-white flex items-center justify-center text-sm font-medium">
                +{Math.floor(event.participants) - 3}
              </div>
            )
          }
        </div>
        Записалось {Math.floor(event.participants)} из {event.maxParticipants} человек
      </div>
    </div>

    <div className="p-4 border-t border-white/10 font-bold">
      {(() => {
        // Проверяем, является ли текущий пользователь организатором
        const isOrganizer = user && event && user.id === event.organizer.id;
        return isOrganizer ?
          (
            <>
              <button className="bg-[rgb(43_140_238/0.2)] rounded-lg p-3 text-center mb-4 w-full text-[rgb(43_140_238/1)]">
                Вы организатор
              </button>
              <button className="w-full bg-[rgb(43_140_238/1)]  text-white font-bold py-3 px-4 rounded-xl text-base h-12 flex items-center justify-center">
                Список участников
              </button>
            </>
          )
          : signed ? (
            <>
              <button className="bg-[rgb(52_199_89/1)] text-white rounded-lg p-3 text-center mb-4 w-full">
                Вы записаны
              </button>
              <button
                onClick={handleUnregister}
                disabled={isLoading}
                className="w-full bg-transparent text-white font-bold py-3 px-4 rounded-xl text-base h-12 flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? "Отменяем..." : "Отменить запись"}
              </button>
            </>
          ) : (
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="bg-[rgb(43_140_238/0.2)] text-white rounded-lg p-3 text-center mb-4 w-full disabled:opacity-50"
            >
              {isLoading ? "Записываемся..." : "Записаться на событие"}
            </button>
          )
      })()}
    </div>
  </main>) : <></>;
}


export function InfoItem({ icon, value }: { icon: StaticImageData, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="size-10 p-2 relative rounded-xl bg-[rgb(43_140_238/0.2)] ">
        <Image src={icon} alt="" className="object-contain fill-[rgb(43_140_238/1)]" />
      </div>
      <span className="text-lg font-medium">{value}</span>
    </div>
  )
}
