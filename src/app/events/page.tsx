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
import { SimpleUser } from "../../domain/event-registration";

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
  const [participants, setParticipants] = useState<SimpleUser[]>([]);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [signed, setSigned] = useState(false);
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);

  // Функция для загрузки участников
  const loadParticipants = async (eventId: string) => {
    try {
      console.log("🔄 Loading participants for event:", eventId);
      const registrations = await registrationsRepo.getEventParticipants(Number(eventId));
      console.log("✅ Loaded registrations:", registrations);
      const users = registrations.map(reg => reg.user).filter((u): u is SimpleUser => u !== undefined);
      console.log("✅ Extracted users:", users);
      setParticipants(users);
      setParticipantsCount(users.length);
      console.log("✅ Updated state - participants count:", users.length);
    } catch (error) {
      console.error("❌ Failed to load participants:", error);
    }
  };

  useEffect(() => {
    if (id === null) {
      redirect('/404');
    }
    eventsServ.getById(id).then((_event) => {
      if (_event === null) {
        redirect('/404');
      }
      setEvent(_event);
      // Загружаем реальных участников
      loadParticipants(id);
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
      // Обновляем список участников после успешной регистрации
      await loadParticipants(id);
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
          // Обновляем список участников
          await loadParticipants(id);
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
    if (!registrationId || !id) return;

    setIsLoading(true);
    try {
      await registrationsRepo.delete(registrationId);
      setSigned(false);
      setRegistrationId(null);
      // Обновляем список участников после отмены регистрации
      await loadParticipants(id);
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
      <div className="flex items-center justify-between mt-8">
        <h2 className="text-white text-xl font-bold">Участники</h2>
        {participantsCount > 0 && (
          <button 
            onClick={() => setShowParticipantsModal(true)}
            className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
          >
            Показать всех
          </button>
        )}
      </div>
      <div 
        className="flex items-center gap-4 mt-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => participantsCount > 0 && setShowParticipantsModal(true)}
      >
        {participantsCount > 0 ? (
          <>
            <div className="flex -space-x-3">
              {participants.slice(0, 5).map((participant) => (
                <div 
                  key={participant.id} 
                  className="relative rounded-full size-12 overflow-hidden border-2 border-gray-800 bg-gray-700 hover:z-10 transition-transform hover:scale-110" 
                  title={participant.username || `User ${participant.telegram_id}`}
                >
                  <Image
                    src={`https://i.pravatar.cc/150?img=${participant.id}`}
                    alt={participant.username || `User ${participant.telegram_id}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {
                participantsCount > 5 &&
                (
                  <div className="rounded-full size-12 overflow-hidden text-center bg-blue-600 text-white flex items-center justify-center text-sm font-bold border-2 border-gray-800">
                    +{participantsCount - 5}
                  </div>
                )
              }
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium">Записалось {participantsCount} {event.maxParticipants && `из ${event.maxParticipants}`}</span>
              <span className="text-gray-400 text-sm">
                {participantsCount === 1 ? 'участник' : participantsCount < 5 ? 'участника' : 'участников'}
              </span>
            </div>
          </>
        ) : (
          <span className="text-gray-400">Пока никто не записался. Будьте первым!</span>
        )}
      </div>
    </div>

    <div className="p-4 border-t border-white/10 font-bold">
      {(() => {
        // Проверяем статус события
        const now = new Date();
        const eventStarted = event.date < now;
        const eventEnded = event.dateEnd ? event.dateEnd < now : false;

        // Проверяем, является ли текущий пользователь организатором
        const isOrganizer = user && event && user.id === event.organizer.id;

        // Если событие закончилось или идёт
        if (eventEnded && !isOrganizer) {
          return (
            <button
              disabled
              className="bg-gray-600 text-gray-300 rounded-lg p-3 text-center mb-4 w-full cursor-not-allowed opacity-60"
            >
              Событие завершено
            </button>
          );
        }

        if (eventStarted && !eventEnded && !isOrganizer) {
          return (
            <button
              disabled
              className="bg-gray-600 text-gray-300 rounded-lg p-3 text-center mb-4 w-full cursor-not-allowed opacity-60"
            >
              Событие уже идёт
            </button>
          );
        }

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

    {/* Модальное окно со списком участников */}
    {showParticipantsModal && (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={() => setShowParticipantsModal(false)}
      >
        <div 
          className="bg-gray-900 rounded-t-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
            <h3 className="text-white text-xl font-bold">Участники ({participantsCount})</h3>
            <button 
              onClick={() => setShowParticipantsModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div 
                  key={participant.id}
                  className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <div className="relative rounded-full size-12 overflow-hidden bg-gray-700 flex-shrink-0">
                    <Image
                      src={`https://i.pravatar.cc/150?img=${participant.id}`}
                      alt={participant.username || `User ${participant.telegram_id}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {participant.username || `User ${participant.telegram_id}`}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Участник #{index + 1}
                    </div>
                  </div>
                  {user && user.id === participant.id && (
                    <div className="text-blue-400 text-sm font-medium">Вы</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
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
