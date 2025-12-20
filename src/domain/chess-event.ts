const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: undefined,
});

export default class ChessEvent {
  id: string;
  title: string;
  type: "tournament" | "training" | "meeting" | "lectures";
  date: Date;
  location: string;
  description: string;
  organizer: string;
  participants: number;
  maxParticipants: number;
  imageUrl: string;

  constructor(
    id: string,
    title: string,
    type: "tournament" | "training" | "meeting" | "lectures",
    date: Date,
    location: string,
    description: string,
    organizer: string,
    participants: number,
    maxParticipants: number,
    imageUrl: string,
  ) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.date = date;
    this.location = location;
    this.description = description;
    this.organizer = organizer;
    this.participants = participants;
    this.maxParticipants = maxParticipants;
    this.imageUrl = imageUrl;
  }

  dateString() {
    return dateFormatter.format(this.date);
  }
}
