import ChessEvent from "./chess-event";

export type ChessEventType = "tournament" | "training" | "meeting" | "lectures";

export type ChessEventsQuery = {
  type?: string;
  query?: string;
  limit?: number;
  skip?: number;
  participantId?: string;
};

export default interface ChessEventsRepository {
  findEvents(query: ChessEventsQuery): Promise<ChessEvent[]>;
  getById(id: string): Promise<ChessEvent | null>;
}
