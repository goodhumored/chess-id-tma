"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "../../hooks/useRole";
import ChessEvent from "../../domain/chess-event";
import ChessEventsRestRepository from "../../infractructure/chess-events-rest.repository";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { canAccessAdmin, isLoading, isAuthenticated, getRoleName } =
    useRole();
  const [events, setEvents] = useState<ChessEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<ChessEvent | null>(null);

  const hasAdminAccess = canAccessAdmin();

  useEffect(() => {
    if (!isLoading && hasAdminAccess) {
      loadEvents();
    }
  }, [isLoading, hasAdminAccess]);

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const repo = new ChessEventsRestRepository();
      // Загружаем все события без фильтров (можно добавить limit если нужно)
      const allEvents = await repo.findEvents({ limit: 100 });
      setEvents(allEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleDeleteClick = (event: ChessEvent) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      const repo = new ChessEventsRestRepository();
      await repo.delete(eventToDelete.id);
      console.log("✅ Event deleted:", eventToDelete.id);

      // Обновляем список событий
      setEvents(events.filter((e) => e.id !== eventToDelete.id));
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Не удалось удалить событие. Попробуйте ещё раз.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

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
            Для доступа к админ-панели необходимо войти в приложение.
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
            Доступ к админ-панели имеют только администраторы.
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

  return (
    <main className="min-h-screen pb-24 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">
              Панель администратора
            </h1>
            <p className="text-slate-400">Управление событиями</p>
          </div>
          <Link
            href="/events/create"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            + Создать событие
          </Link>
        </div>

        {eventsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="bg-slate-800/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Тип
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Город
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Организатор
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">
                        {event.id}
                      </td>
                      <td className="px-4 py-4 text-sm text-white font-medium">
                        <Link
                          href={`/events?id=${event.id}`}
                          className="hover:text-blue-400 transition-colors"
                        >
                          {event.title}
                        </Link>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">
                        {event.type || "—"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">
                        {event.city.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">
                        {event.dateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-300">
                        {event.organizer.username || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDeleteClick(event)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">Событий пока нет</p>
            <Link
              href="/events/create"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Создать первое событие
            </Link>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteModalOpen && eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-700">
            <h2 className="text-white text-2xl font-bold mb-2">
              Удалить событие?
            </h2>
            <p className="text-slate-400 text-base mb-6">
              Вы уверены, что хотите удалить событие "{eventToDelete.title}"?
              Это действие нельзя отменить.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-base hover:bg-slate-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded-xl text-base hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
