"use client";

import { useRouter } from "next/navigation";
import { useRole } from "../../../hooks/useRole";
import EventForm from "../../../components/forms/EventForm";
import ChessEvent from "../../../domain/chess-event";

export default function CreateEventPage() {
  const router = useRouter();
  const { canCreateEvent, isLoading, isAuthenticated, getRoleName } = useRole();

  // Loading state
  if (isLoading) {
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
            Для создания событий необходимо войти в приложение через Telegram.
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
  if (!canCreateEvent()) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Недостаточно прав
          </h1>
          <p className="text-slate-400 mb-2">
            Создавать события могут только партнёры и администраторы.
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

  const handleSuccess = (event: ChessEvent) => {
    console.log("✅ Event created successfully, redirecting...");
    router.push(`/events?id=${event.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <main className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-2">
            Создать событие
          </h1>
          <p className="text-slate-400">
            Заполните информацию о вашем шахматном мероприятии
          </p>
        </div>

        <EventForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </main>
  );
}
