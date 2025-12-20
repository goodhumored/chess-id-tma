import ChessEventsRepository, {
  ChessEventsQuery,
} from "./chess-events-repository.interface";

export default class ChessEventsService {
  constructor(private readonly _repo: ChessEventsRepository) {}

  async findEvents(query: ChessEventsQuery) {
    return this._repo.findEvents(query);
  }

  async getById(id: string) {
    return this._repo.getById(id);
  }
}
