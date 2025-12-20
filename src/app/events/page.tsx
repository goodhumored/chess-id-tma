"use client"
import { redirect, useSearchParams } from "next/navigation";
import ChessEventsService from "../../domain/chess-events-service";
import ChessEventsMockRepository from "../../infractructure/chess-events-mock.repository";
import Image, { StaticImageData } from "next/image";
import CalendarIcon from '@/../public/calendar_month.svg';
import Location from '@/../public/location_on.svg';
import PersonIcon from '@/../public/person.svg';
import { useEffect, useState } from "react";
import ChessEvent from "../../domain/chess-event";

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: undefined });

export default function EventPage(
) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const repo = new ChessEventsMockRepository();
  const serv = new ChessEventsService(repo);
  const [event, setEvent] = useState<ChessEvent | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [r, setR] = useState<number>();

  useEffect(() => {
    if (id === null) {
      redirect('/404');
    }
    serv.getById(id).then((_event) => {
      if (_event === null) {
        redirect('/404');
      }
      setEvent(_event)
      setParticipants(Array.from({ length: _event.participants }, (_, i) => `https://i.pravatar.cc/150?img=${i + 1}`));
      setR(Math.random())
    });
  }, [id]);

  const [signed, setSigned] = useState(false)

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
        <InfoItem icon={Location} value={event.location} />
        <InfoItem icon={PersonIcon} value={event.organizer} />
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
        return r && r > 0.5 ?
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
              <button onClick={() => { setSigned(false) }} className="w-full bg-transparent  text-white font-bold py-3 px-4 rounded-xl text-base h-12 flex items-center justify-center">
                Отменить запись
              </button>
            </>
          ) : (
            <button onClick={() => { setSigned(true) }} className="bg-[rgb(43_140_238/0.2)] text-white rounded-lg p-3 text-center mb-4 w-full">
              Записаться на событие
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
