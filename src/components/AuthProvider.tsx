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
  const { user: tgUser, isReady } = useTelegram();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function authenticateUser() {
      if (!isReady || !tgUser?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const userRepo = new UsersRestRepository();
        const userService = new UsersService(userRepo);

        // Получаем или создаем пользователя по Telegram ID
        const authenticatedUser =
          await userService.getOrCreateUserByTelegram(
            String(tgUser.id),
            tgUser.username || tgUser.first_name || null,
          );

        setUser(authenticatedUser);
      } catch (error) {
        console.error("Failed to authenticate user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    authenticateUser();
  }, [isReady, tgUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
