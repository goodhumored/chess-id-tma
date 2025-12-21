"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useTelegram } from "./TelegramProvider";
import { User } from "../domain/user-repo.interface";
import UsersService from "../domain/user-service";
import UsersRestRepository from "../infractructure/users-rest.repository";
import { authService } from "../services/auth.service";
import CitySelectionModal from "./CitySelectionModal";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user: tgUser, isReady, webApp } = useTelegram();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCitySelection, setShowCitySelection] = useState(false);

  useEffect(() => {
    async function authenticateUser() {
      if (!isReady || !tgUser?.id || !webApp) {
        setIsLoading(false);
        return;
      }

      try {
        // ШАГ 1: Получить initData от Telegram WebApp
        const initData = webApp.initData;
        if (!initData) {
          console.error("❌ No initData from Telegram WebApp");
          setIsLoading(false);
          return;
        }

        console.log("✅ Step 1: Got initData from Telegram");

        // ШАГ 2: Отправить initData на бэкенд для авторизации
        // Это установит JWT cookie И создаст пользователя если его нет
        console.log("🔄 Step 2: Authenticating with backend...");
        const authSuccess = await authService.authenticateWithTelegram(
          initData,
          undefined, // phone - можно добавить позже
          undefined, // city - можно добавить позже
        );

        if (!authSuccess) {
          console.error("❌ Step 2 failed: Telegram authentication failed");
          setIsLoading(false);
          return;
        }

        console.log("✅ Step 2: Authentication successful, JWT cookie set");

        // ШАГ 3: Теперь с установленным JWT cookie можем делать API запросы
        console.log("🔄 Step 3: Fetching user profile...");
        const userRepo = new UsersRestRepository();
        const userService = new UsersService(userRepo);

        // Получаем текущего пользователя через /profile (доступен всем авторизованным)
        const authenticatedUser = await userService.getCurrentUser();

        if (authenticatedUser) {
          console.log("✅ Step 3: User profile loaded:", authenticatedUser);
          setUser(authenticatedUser);

          // ШАГ 4: Проверяем, нужно ли выбрать город
          if (!authenticatedUser.city_id) {
            console.log("ℹ️ Step 4: User has no city, showing city selection");
            setShowCitySelection(true);
          }
        } else {
          console.error("❌ Step 3 failed: User not found after authentication");
        }
      } catch (error) {
        console.error("❌ Authentication flow failed:", error);
      } finally {
        setIsLoading(false);
      }
    }

    authenticateUser();
  }, [isReady, tgUser, webApp]);

  const handleCitySelected = async (cityId: number) => {
    if (!user) return;

    try {
      console.log(`🔄 Updating user with city_id=${cityId}`);
      const userRepo = new UsersRestRepository();
      const userService = new UsersService(userRepo);

      const updatedUser = await userService.updateCurrentUser({
        city_id: cityId,
      });

      console.log("✅ User updated with city:", updatedUser);
      setUser(updatedUser);
      setShowCitySelection(false);
      console.log("🚪 City selection modal closed");
    } catch (error) {
      console.error("❌ Failed to update user city:", error);
      alert("Не удалось сохранить город. Попробуйте ещё раз.");
    }
  };

  // Показываем загрузку пока идет авторизация
  if (isLoading) {
    return (
      <AuthContext.Provider
        value={{
          user,
          isLoading,
          isAuthenticated: user !== null,
        }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  // Debug: логируем состояние модального окна
  console.log("🔍 AuthProvider render:", {
    showCitySelection,
    hasUser: !!user,
    hasCityId: user?.city_id,
    isLoading
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
      }}
    >
      <CitySelectionModal
        isOpen={showCitySelection}
        onCitySelected={handleCitySelected}
      />
      {children}
    </AuthContext.Provider>
  );
};
