import Link from "next/link";
import ChessEvent from "../domain/chess-event";
import Image from "next/image";

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: undefined });

export default function EventCard({ event }: { event: ChessEvent }) {
  return (
    <Link href={"/events?id=" + event.id} className="aspect-4/3 relative block rounded-3xl overflow-hidden">
      <div className="abolute inset-0 ">
        <Image alt="" className="object-cover object-center" fill src={event.imageUrl} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
      </div>
      <div className="text-white absolute bottom-4 font-jakarta left-4 right-4 ">
        <h2 className="tracking-tight text-2xl font-bold">{event.title}</h2>
        <p className="text-base leading-notmal font-medium text-gray-200">{dateFormatter.format(event.date)}, {event.date.getHours()}:{event.date.getMinutes()} - {event.location}</p>
      </div>
    </Link>
  )
}
