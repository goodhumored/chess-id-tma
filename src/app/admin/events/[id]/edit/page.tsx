"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRole } from "../../../../../hooks/useRole";
import EventForm from "../../../../../components/forms/EventForm";
import ChessEvent from "../../../../../domain/chess-event";
import ChessEventsRestRepository from "../../../../../infractructure/chess-events-rest.repository";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params['id'] as string;
  const { canAccessAdmin, isLoading, isAuthenticated, getRoleName } =
    useRole();
  const [event, setEvent] = useState<ChessEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(true);

  // Load event
  useEffect(() => {
    if (!isLoading && canAccessAdmin() && eventId) {
      loadEvent();
    }
  }, [isLoading, eventId]);

  const loadEvent = async () => {
    setEventLoading(true);
    try {
      const repo = new ChessEventsRestRepository();
      const loadedEvent = await repo.getById(eventId);
      setEvent(loadedEvent);
    } catch (error) {
      console.error("Failed to load event:", error);
    } finally {
      setEventLoading(false);
    }
  };

  const handleSuccess = (_updatedEvent: ChessEvent) => {
    console.log("✅ Event updated successfully, redirecting...");
    router.push("/admin");
  };

  const handleCancel = () => {
    router.push("/admin");
  };

  // Loading state
  if (isLoading || eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Требуется авторизация
          </h1>
          <p className="text-slate-400 mb-6">
            Для редактирования событий необходимо войти в приложение.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  // No permission
  if (!canAccessAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Недостаточно прав
          </h1>
          <p className="text-slate-400 mb-2">
            Редактировать события могут только администраторы.
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Ваша роль: {getRoleName()}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  // Event not found
  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Событие не найдено
          </h1>
          <p className="text-slate-400 mb-6">
            Событие с ID {eventId} не существует или было удалено.
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Вернуться в админку
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-2">
            Редактировать событие
          </h1>
          <p className="text-slate-400">
            Внесите изменения в информацию о событии
          </p>
        </div>

        <EventForm
          event={event}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </main>
  );
}
