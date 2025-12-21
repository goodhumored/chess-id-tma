import ChessEvent, { EventCity, EventOrganizer } from "../domain/chess-event";
import ChessEventsRepository, {
  ChessEventsQuery,
} from "../domain/chess-events-repository.interface";
import { httpClient } from "../lib/http-client";

type UserShortDTO = {
  id: number;
  username: string | null;
  telegram_id: string;
};

type CityShortDTO = {
  id: number;
  name: string;
};

type EventOutDTO = {
  id: number;
  city_id: number;
  title: string;
  description: string | null;
  event_type: string | null;
  datetime_start: string;
  datetime_end: string | null;
  address: string;
  limit_participants: number | null;
  status: string;
  organizer: UserShortDTO;
  city: CityShortDTO;
  created_at: string;
};

type EventCreateDTO = {
  organizer_id: number;
  city_id: number;
  title: string;
  description?: string | null;
  event_type?: string | null;
  datetime_start: string;
  datetime_end?: string | null;
  address: string;
  limit_participants?: number | null;
  status?: string;
};

type EventUpdateDTO = {
  organizer_id?: number | null;
  city_id?: number | null;
  title?: string | null;
  description?: string | null;
  event_type?: string | null;
  datetime_start?: string | null;
  datetime_end?: string | null;
  address?: string | null;
  limit_participants?: number | null;
  status?: string | null;
};

export default class ChessEventsRestRepository
  implements ChessEventsRepository
{
  private readonly defaultImageUrl =
    "https://i.pravatar.cc/400?img=" + Math.floor(Math.random() * 70);

  private mapDTOToEvent(dto: EventOutDTO, participants: number = 0): ChessEvent {
    const organizer: EventOrganizer = {
      id: dto.organizer.id,
      username: dto.organizer.username,
      telegram_id: dto.organizer.telegram_id,
    };

    const city: EventCity = {
      id: dto.city.id,
      name: dto.city.name,
    };

    return new ChessEvent(
      dto.id,
      dto.title,
      dto.event_type,
      new Date(dto.datetime_start),
      dto.datetime_end ? new Date(dto.datetime_end) : null,
      dto.address,
      dto.description,
      organizer,
      city,
      participants,
      dto.limit_participants,
      this.defaultImageUrl,
      dto.status,
      new Date(dto.created_at),
    );
  }

  async findEvents(query: ChessEventsQuery): Promise<ChessEvent[]> {
    try {
      const params = new URLSearchParams();

      if (query.skip !== undefined) {
        params.append("skip", query.skip.toString());
      }

      if (query.limit !== undefined) {
        params.append("limit", query.limit.toString());
      }

      if (query.type) {
        params.append("event_type", query.type);
      }

      if (query.city_id !== undefined) {
        params.append("city_id", query.city_id.toString());
      }

      if (query.dateFrom !== undefined) {
        params.append("datetime_start_from", query.dateFrom.toISOString());
      }

      const endpoint = `/api/v1/events/${params.toString() ? `?${params.toString()}` : ""}`;
      const data = await httpClient.get<EventOutDTO[]>(endpoint);

      return data.map((dto) => this.mapDTOToEvent(dto));
    } catch (error) {
      console.error("Failed to fetch events:", error);
      return [];
    }
  }

  async getById(id: string): Promise<ChessEvent | null> {
    try {
      const data = await httpClient.get<EventOutDTO>(`/api/v1/events/id/${id}`);
      return this.mapDTOToEvent(data);
    } catch (error) {
      console.error(`Failed to fetch event by id ${id}:`, error);
      return null;
    }
  }

  async getUpcoming(limit: number = 10): Promise<ChessEvent[]> {
    try {
      const data = await httpClient.get<EventOutDTO[]>(
        `/api/v1/events/upcoming?limit=${limit}`,
      );
      return data.map((dto) => this.mapDTOToEvent(dto));
    } catch (error) {
      console.error("Failed to fetch upcoming events:", error);
      return [];
    }
  }

  async search(
    searchQuery: string,
    skip: number = 0,
    limit: number = 50,
  ): Promise<ChessEvent[]> {
    try {
      const data = await httpClient.get<EventOutDTO[]>(
        `/api/v1/events/search/${encodeURIComponent(searchQuery)}?skip=${skip}&limit=${limit}`,
      );
      return data.map((dto) => this.mapDTOToEvent(dto));
    } catch (error) {
      console.error(`Failed to search events with query "${searchQuery}":`, error);
      return [];
    }
  }

  async create(event: EventCreateDTO): Promise<ChessEvent> {
    const data = await httpClient.post<EventOutDTO>("/api/v1/events/", event);
    return this.mapDTOToEvent(data);
  }

  async update(id: number, event: EventUpdateDTO): Promise<ChessEvent> {
    const data = await httpClient.put<EventOutDTO>(
      `/api/v1/events/id/${id}`,
      event,
    );
    return this.mapDTOToEvent(data);
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/events/id/${id}`);
  }
}
