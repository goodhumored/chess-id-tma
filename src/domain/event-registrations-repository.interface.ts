import EventRegistration from "./event-registration";

export type EventRegistrationCreate = {
  user_id: number;
  event_id: number;
};

export type EventRegistrationUpdate = {
  user_id?: number | null;
  event_id?: number | null;
  registration_number?: number | null;
};

export type GetRegistrationsQuery = {
  skip?: number;
  limit?: number;
  event_id?: number;
  user_id?: number;
};

export default interface EventRegistrationsRepository {
  getRegistrations(query: GetRegistrationsQuery): Promise<EventRegistration[]>;
  getById(id: number): Promise<EventRegistration | null>;
  create(registration: EventRegistrationCreate): Promise<EventRegistration>;
  update(
    id: number,
    registration: EventRegistrationUpdate,
  ): Promise<EventRegistration>;
  delete(id: number): Promise<void>;
  getUserRegistrations(
    userId: number,
    skip?: number,
    limit?: number,
  ): Promise<EventRegistration[]>;
  getEventRegistrations(
    eventId: number,
    skip?: number,
    limit?: number,
  ): Promise<EventRegistration[]>;
  getEventParticipants(
    eventId: number,
    skip?: number,
    limit?: number,
  ): Promise<EventRegistration[]>;
  checkRegistration(userId: number, eventId: number): Promise<boolean>;
  getEventStats(eventId: number): Promise<unknown>;
}
