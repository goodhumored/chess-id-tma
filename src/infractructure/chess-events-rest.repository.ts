import ChessEvent from "../domain/chess-event";
import ChessEventsRepository, {
  ChessEventsQuery,
} from "../domain/chess-events-repository.interface";

export default class ChessEventsRestRepository
  implements ChessEventsRepository
{
  findEvents(_: ChessEventsQuery): Promise<ChessEvent[]> {
    throw new Error("Method not implemented.");
  }
  getById(_: string): Promise<ChessEvent | null> {
    console.log(this.apiUrl);
    throw new Error("Method not implemented.");
  }
  // This is a placeholder for the actual REST API base URL
  private readonly apiUrl: string = "https://api.chess-events.com";
}
