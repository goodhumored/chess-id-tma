import ChessEvent from "../domain/chess-event";
import ChessEventsRepository, {
  ChessEventsQuery,
} from "../domain/chess-events-repository.interface";

// const randomPic =
//   ;

const eventsMock: ChessEvent[] = [];

export default class ChessEventsMockRepository
  implements ChessEventsRepository
{
  findEvents(query: ChessEventsQuery): Promise<ChessEvent[]> {
    return Promise.resolve(eventsMock).then((events) => {
      let filteredEvents = events;

      if (query.type) {
        filteredEvents = filteredEvents.filter(
          (event) => event.type === query.type,
        );
      }

      if (query.query) {
        const lowerQuery = query.query.toLowerCase();
        filteredEvents = filteredEvents.filter(
          (event) =>
            event.title.toLowerCase().includes(lowerQuery) ||
            (event.description?.toLowerCase().includes(lowerQuery) ?? false) ||
            event.location.toLowerCase().includes(lowerQuery) ||
            event.city.name.toLowerCase().includes(lowerQuery) ||
            (event.organizer.username?.toLowerCase().includes(lowerQuery) ?? false),
        );
      }

      const skip = query.skip ?? 0;
      const limit = query.limit ?? filteredEvents.length;

      return filteredEvents.slice(skip, skip + limit);
    });
  }

  getById(id: string): Promise<ChessEvent | null> {
    const numericId = parseInt(id, 10);
    return Promise.resolve(
      eventsMock.find((event) => event.id === numericId) || null,
    );
  }
}
