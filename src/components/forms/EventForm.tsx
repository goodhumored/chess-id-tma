"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChessEvent from "../../domain/chess-event";
import City from "../../domain/city";
import CitiesRestRepository from "../../infractructure/cities-rest.repository";
import ChessEventsRestRepository from "../../infractructure/chess-events-rest.repository";
import ImageUploader from "../ImageUploader";
import { useAuth } from "../AuthProvider";

const EVENT_TYPES = [
  { value: "tournament", label: "Турнир" },
  { value: "training", label: "Тренировка" },
  { value: "meeting", label: "Встреча" },
  { value: "lectures", label: "Лекция" },
];

interface EventFormProps {
  event?: ChessEvent | null;
  onSuccess?: (event: ChessEvent) => void;
  onCancel?: () => void;
}

export default function EventForm({
  event,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState(event?.title || "");
  const [eventType, setEventType] = useState<string>(event?.type || "");
  const [dateStart, setDateStart] = useState<string>(
    event?.date ? formatDateTimeLocal(event.date) : ""
  );
  const [dateEnd, setDateEnd] = useState<string>(
    event?.dateEnd ? formatDateTimeLocal(event.dateEnd) : ""
  );
  const [address, setAddress] = useState(event?.location || "");
  const [description, setDescription] = useState(event?.description || "");
  const [cityId, setCityId] = useState<number | null>(
    event?.city.id || user?.city_id || null
  );
  const [limitParticipants, setLimitParticipants] = useState<string>(
    event?.maxParticipants?.toString() || ""
  );
  const [imageUrl, setImageUrl] = useState(event?.imageUrl || "");

  // Load cities
  useEffect(() => {
    async function loadCities() {
      const citiesRepo = new CitiesRestRepository();
      const loadedCities = await citiesRepo.getAll();
      setCities(loadedCities);
    }
    loadCities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Необходима авторизация");
      return;
    }

    if (!title.trim()) {
      setError("Заполните название события");
      return;
    }

    if (!address.trim()) {
      setError("Заполните адрес проведения");
      return;
    }

    if (!dateStart) {
      setError("Укажите дату и время начала");
      return;
    }

    if (!cityId) {
      setError("Выберите город");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const eventsRepo = new ChessEventsRestRepository();

      const eventData = {
        organizer_id: user.id,
        city_id: cityId,
        title: title.trim(),
        description: description.trim() || null,
        event_type: eventType || null,
        datetime_start: new Date(dateStart).toISOString(),
        datetime_end: dateEnd ? new Date(dateEnd).toISOString() : null,
        address: address.trim(),
        limit_participants: limitParticipants
          ? parseInt(limitParticipants)
          : null,
        status: "active",
      };

      let createdEvent: ChessEvent;

      if (event) {
        // Update existing event
        createdEvent = await eventsRepo.update(event.id, eventData);
        console.log("✅ Event updated:", createdEvent);
      } else {
        // Create new event
        createdEvent = await eventsRepo.create(eventData);
        console.log("✅ Event created:", createdEvent);
      }

      if (onSuccess) {
        onSuccess(createdEvent);
      } else {
        router.push(`/events?id=${createdEvent.id}`);
      }
    } catch (err: any) {
      console.error("Failed to save event:", err);
      setError(
        err?.message || "Не удалось сохранить событие. Попробуйте ещё раз."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Название события */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-base font-medium">
          Название события *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Шахматный турнир для начинающих"
          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Тип события */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-base font-medium">Тип события</label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
        >
          <option value="">Не указан</option>
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Дата и время начала */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-base font-medium">
          Дата и время начала *
        </label>
        <input
          type="datetime-local"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Дата и время окончания */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-base font-medium">
          Дата и время окончания
        </label>
        <input
          type="datetime-local"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Город */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-base font-medium">Город *</label>
        <select
          value={cityId || ""}
          onChange={(e) => setCityId(parseInt(e.target.value))}
          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
          required
        >
          <option value="">Выберите город</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {/* Адрес */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-base font-medium">Адрес *</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Например: ул. Ленина, 10, зал №3"
          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Описание */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-base font-medium">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Расскажите подробнее о событии..."
          rows={4}
          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors resize-vertical"
        />
      </div>

      {/* Лимит участников */}
      <div className="flex flex-col gap-2">
        <label className="text-white text-base font-medium">
          Максимальное количество участников
        </label>
        <input
          type="number"
          value={limitParticipants}
          onChange={(e) => setLimitParticipants(e.target.value)}
          placeholder="Не ограничено"
          min="1"
          className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Изображение */}
      <ImageUploader
        currentImageUrl={imageUrl}
        onImageSelected={setImageUrl}
        label="Изображение события"
        description="Добавьте привлекательную картинку для вашего события"
      />

      {/* Кнопки */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl text-base transition-colors"
          >
            Отмена
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading
            ? "Сохранение..."
            : event
              ? "Сохранить изменения"
              : "Создать событие"}
        </button>
      </div>
    </form>
  );
}

// Утилита для форматирования даты в формат datetime-local
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
