import { useAuth } from "../components/AuthProvider";

// Роли в системе
export const ROLES = {
  USER: 1,
  PARTNER: 2,
  ADMIN: 3,
} as const;

export type RoleId = (typeof ROLES)[keyof typeof ROLES];

/**
 * Хук для проверки роли текущего пользователя
 */
export function useRole() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const roleId = user?.role_id ?? null;

  /**
   * Проверяет, имеет ли пользователь указанную роль
   */
  const hasRole = (targetRoleId: RoleId): boolean => {
    return roleId === targetRoleId;
  };

  /**
   * Проверяет, является ли пользователь обычным пользователем
   */
  const isUser = (): boolean => {
    return hasRole(ROLES.USER);
  };

  /**
   * Проверяет, является ли пользователь партнёром
   */
  const isPartner = (): boolean => {
    return hasRole(ROLES.PARTNER);
  };

  /**
   * Проверяет, является ли пользователь администратором
   */
  const isAdmin = (): boolean => {
    return hasRole(ROLES.ADMIN);
  };

  /**
   * Проверяет, может ли пользователь создавать события
   * (партнёр или администратор)
   */
  const canCreateEvent = (): boolean => {
    return isPartner() || isAdmin();
  };

  /**
   * Проверяет, может ли пользователь редактировать события
   * (партнёр или администратор)
   */
  const canEditEvent = (): boolean => {
    return isPartner() || isAdmin();
  };

  /**
   * Проверяет, имеет ли пользователь доступ к админ-панели
   */
  const canAccessAdmin = (): boolean => {
    return isAdmin();
  };

  /**
   * Проверяет, является ли пользователь организатором указанного события
   */
  const isEventOrganizer = (eventOrganizerId: number): boolean => {
    return user?.id === eventOrganizerId;
  };

  /**
   * Проверяет, может ли пользователь редактировать конкретное событие
   * (организатор события или администратор)
   */
  const canEditSpecificEvent = (eventOrganizerId: number): boolean => {
    return isEventOrganizer(eventOrganizerId) || isAdmin();
  };

  /**
   * Получить название роли
   */
  const getRoleName = (): string => {
    switch (roleId) {
      case ROLES.USER:
        return "Пользователь";
      case ROLES.PARTNER:
        return "Партнёр";
      case ROLES.ADMIN:
        return "Администратор";
      default:
        return "Неизвестная роль";
    }
  };

  return {
    // Состояние
    roleId,
    isLoading,
    isAuthenticated,

    // Проверки ролей
    hasRole,
    isUser,
    isPartner,
    isAdmin,

    // Проверки разрешений
    canCreateEvent,
    canEditEvent,
    canAccessAdmin,
    isEventOrganizer,
    canEditSpecificEvent,

    // Утилиты
    getRoleName,
  };
}
