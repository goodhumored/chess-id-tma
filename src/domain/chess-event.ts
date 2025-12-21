const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: undefined,
});

export type EventOrganizer = {
  id: number;
  username: string | null;
  telegram_id: string;
};

export type EventCity = {
  id: number;
  name: string;
};

export default class ChessEvent {
  id: number;
  title: string;
  type: string | null;
  date: Date;
  dateEnd: Date | null;
  location: string;
  description: string | null;
  organizer: EventOrganizer;
  city: EventCity;
  participants: number;
  maxParticipants: number | null;
  imageUrl: string;
  status: string;
  createdAt: Date;

  constructor(
    id: number,
    title: string,
    type: string | null,
    date: Date,
    dateEnd: Date | null,
    location: string,
    description: string | null,
    organizer: EventOrganizer,
    city: EventCity,
    participants: number,
    maxParticipants: number | null,
    imageUrl: string,
    status: string,
    createdAt: Date,
  ) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.date = date;
    this.dateEnd = dateEnd;
    this.location = location;
    this.description = description;
    this.organizer = organizer;
    this.city = city;
    this.participants = participants;
    this.maxParticipants = maxParticipants;
    this.imageUrl = imageUrl;
    this.status = status;
    this.createdAt = createdAt;
  }

  dateString() {
    return dateFormatter.format(this.date);
  }
}
