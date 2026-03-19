export type SimpleUser = {
  id: number;
  username: string | null;
  telegram_id: string;
};

export type SimpleCity = {
  id: number;
  name: string;
};

export type SimpleOrganizer = {
  id: number;
  username: string | null;
  telegram_id: string;
};

export type SimpleEvent = {
  id: number;
  title: string;
  description: string | null;
  event_type: string;
  datetime_start: Date;
  datetime_end: Date;
  address: string;
  limit_participants: number;
  status: string;
  created_at: Date;
  organizer: SimpleOrganizer;
  city: SimpleCity;
  image_url: string;
};

export default class EventRegistration {
  id: number;
  userId: number;
  eventId: number;
  registrationNumber: number;
  createdAt: Date;
  user: SimpleUser;
  event: SimpleEvent;

  constructor(
    id: number,
    userId: number,
    eventId: number,
    registrationNumber: number,
    createdAt: Date,
    user: SimpleUser,
    event: SimpleEvent,
  ) {
    this.id = id;
    this.userId = userId;
    this.eventId = eventId;
    this.registrationNumber = registrationNumber;
    this.createdAt = createdAt;
    this.user = user;
    this.event = event;
  }
}
