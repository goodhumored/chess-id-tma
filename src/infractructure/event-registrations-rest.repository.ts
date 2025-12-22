import EventRegistration, {
  SimpleEvent,
  SimpleUser,
  SimpleCity,
  SimpleOrganizer,
} from "../domain/event-registration";
import EventRegistrationsRepository, {
  EventRegistrationCreate,
  EventRegistrationUpdate,
  GetRegistrationsQuery,
} from "../domain/event-registrations-repository.interface";
import { httpClient } from "../lib/http-client";

type SimpleUserDTO = {
  id: number;
  username: string | null;
  telegram_id: string;
};

type SimpleCityDTO = {
  id: number;
  name: string;
};

type SimpleOrganizerDTO = {
  id: number;
  username: string | null;
  telegram_id: string;
};

type SimpleEventDTO = {
  id: number;
  title: string;
  description: string | null;
  event_type: string;
  datetime_start: string;
  datetime_end: string;
  address: string;
  limit_participants: number;
  status: string;
  created_at: string;
  organizer: SimpleOrganizerDTO;
  city: SimpleCityDTO;
};

type EventRegistrationOutDTO = {
  id: number;
  user_id: number;
  event_id: number;
  registration_number: number;
  created_at: string;
};

type EventRegistrationFullDTO = {
  id: number;
  user_id: number;
  event_id: number;
  registration_number: number;
  created_at: string;
  user: SimpleUserDTO;
  event: SimpleEventDTO;
};

export default class EventRegistrationsRestRepository
  implements EventRegistrationsRepository
{
  private mapOutDTOToRegistration(
    dto: EventRegistrationOutDTO,
  ): EventRegistration {
    return new EventRegistration(
      dto.id,
      dto.user_id,
      dto.event_id,
      dto.registration_number,
      new Date(dto.created_at),
    );
  }

  private mapFullDTOToRegistration(
    dto: EventRegistrationFullDTO,
  ): EventRegistration {
    const user: SimpleUser = {
      id: dto.user.id,
      username: dto.user.username,
      telegram_id: dto.user.telegram_id,
    };

    const city: SimpleCity = {
      id: dto.event.city.id,
      name: dto.event.city.name,
    };

    const organizer: SimpleOrganizer = {
      id: dto.event.organizer.id,
      username: dto.event.organizer.username,
      telegram_id: dto.event.organizer.telegram_id,
    };

    const event: SimpleEvent = {
      id: dto.event.id,
      title: dto.event.title,
      description: dto.event.description,
      event_type: dto.event.event_type,
      datetime_start: new Date(dto.event.datetime_start),
      datetime_end: new Date(dto.event.datetime_end),
      address: dto.event.address,
      limit_participants: dto.event.limit_participants,
      status: dto.event.status,
      created_at: new Date(dto.event.created_at),
      organizer,
      city,
    };

    return new EventRegistration(
      dto.id,
      dto.user_id,
      dto.event_id,
      dto.registration_number,
      new Date(dto.created_at),
      user,
      event,
    );
  }

  async getRegistrations(
    query: GetRegistrationsQuery,
  ): Promise<EventRegistration[]> {
    try {
      const params = new URLSearchParams();

      if (query.skip !== undefined) {
        params.append("skip", query.skip.toString());
      }

      if (query.limit !== undefined) {
        params.append("limit", query.limit.toString());
      }

      if (query.event_id !== undefined) {
        params.append("event_id", query.event_id.toString());
      }

      if (query.user_id !== undefined) {
        params.append("user_id", query.user_id.toString());
      }

      const endpoint = `/api/v1/event-registrations/${params.toString() ? `?${params.toString()}` : ""}`;
      const data =
        await httpClient.get<EventRegistrationOutDTO[]>(endpoint);

      return data.map((dto) => this.mapOutDTOToRegistration(dto));
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      return [];
    }
  }

  async getById(id: number): Promise<EventRegistration | null> {
    try {
      const data = await httpClient.get<EventRegistrationFullDTO>(
        `/api/v1/event-registrations/id/${id}`,
      );
      return this.mapFullDTOToRegistration(data);
    } catch (error) {
      console.error(`Failed to fetch registration by id ${id}:`, error);
      return null;
    }
  }

  async create(
    registration: EventRegistrationCreate,
  ): Promise<EventRegistration> {
    const data = await httpClient.post<EventRegistrationFullDTO>(
      "/api/v1/event-registrations/",
      registration,
    );
    return this.mapFullDTOToRegistration(data);
  }

  async update(
    id: number,
    registration: EventRegistrationUpdate,
  ): Promise<EventRegistration> {
    const data = await httpClient.put<EventRegistrationFullDTO>(
      `/api/v1/event-registrations/id/${id}`,
      registration,
    );
    return this.mapFullDTOToRegistration(data);
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/event-registrations/id/${id}`);
  }

  async getMyRegistrations(
    skip: number = 0,
    limit: number = 100,
  ): Promise<EventRegistration[]> {
    try {
      const data = await httpClient.get<EventRegistrationFullDTO[]>(
        `/api/v1/event-registrations/my?skip=${skip}&limit=${limit}`,
      );
      return data.map((dto) => this.mapFullDTOToRegistration(dto));
    } catch (error) {
      console.error("Failed to fetch my registrations:", error);
      return [];
    }
  }

  async getUserRegistrations(
    userId: number,
    skip: number = 0,
    limit: number = 100,
  ): Promise<EventRegistration[]> {
    try {
      const data = await httpClient.get<EventRegistrationFullDTO[]>(
        `/api/v1/event-registrations/user/${userId}/registrations?skip=${skip}&limit=${limit}`,
      );
      return data.map((dto) => this.mapFullDTOToRegistration(dto));
    } catch (error) {
      console.error(
        `Failed to fetch registrations for user ${userId}:`,
        error,
      );
      return [];
    }
  }

  async getEventRegistrations(
    eventId: number,
    skip: number = 0,
    limit: number = 100,
  ): Promise<EventRegistration[]> {
    try {
      const data = await httpClient.get<EventRegistrationFullDTO[]>(
        `/api/v1/event-registrations/event/${eventId}/registrations?skip=${skip}&limit=${limit}`,
      );
      return data.map((dto) => this.mapFullDTOToRegistration(dto));
    } catch (error) {
      console.error(
        `Failed to fetch registrations for event ${eventId}:`,
        error,
      );
      return [];
    }
  }

  async getEventParticipants(
    eventId: number,
    skip: number = 0,
    limit: number = 100,
  ): Promise<EventRegistration[]> {
    try {
      const data = await httpClient.get<EventRegistrationFullDTO[]>(
        `/api/v1/event-registrations/event/${eventId}/participants?skip=${skip}&limit=${limit}`,
      );
      return data.map((dto) => this.mapFullDTOToRegistration(dto));
    } catch (error) {
      console.error(
        `Failed to fetch participants for event ${eventId}:`,
        error,
      );
      return [];
    }
  }

  async checkRegistration(userId: number, eventId: number): Promise<boolean> {
    try {
      await httpClient.get(
        `/api/v1/event-registrations/check/${userId}/${eventId}`,
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async getEventStats(eventId: number): Promise<unknown> {
    try {
      return await httpClient.get(
        `/api/v1/event-registrations/event/${eventId}/stats`,
      );
    } catch (error) {
      console.error(`Failed to fetch stats for event ${eventId}:`, error);
      return null;
    }
  }
}
