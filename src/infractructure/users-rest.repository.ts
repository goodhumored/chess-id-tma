import {
  User,
  UserCreate,
  UserUpdate,
  UsersRepository,
} from "../domain/user-repo.interface";
import { httpClient } from "../lib/http-client";

type CityDTO = {
  id: number;
  name: string;
};

type RoleDTO = {
  id: number;
  role: string;
  permissions: number;
};

type UserOutDTO = {
  id: number;
  telegram_id: string;
  username: string | null;
  phone: string | null;
  city: CityDTO | null;
  role: RoleDTO | null;
  skill_level: string | null;
  points: number;
};

export default class UsersRestRepository implements UsersRepository {
  private mapDTOToUser(dto: UserOutDTO): User {
    return new User(
      dto.id,
      dto.telegram_id,
      dto.username,
      dto.phone,
      dto.city ? { id: dto.city.id, name: dto.city.name } : null,
      dto.role?.id ?? null,
      dto.skill_level,
    );
  }

  async findById(id: number): Promise<User | null> {
    try {
      const data = await httpClient.get<UserOutDTO>(
        `/api/v1/users/id/${id}`,
      );
      return this.mapDTOToUser(data);
    } catch (error) {
      console.error(`Failed to fetch user by id ${id}:`, error);
      return null;
    }
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const data = await httpClient.get<UserOutDTO>(
        `/api/v1/users/telegram/${telegramId}`,
      );
      return this.mapDTOToUser(data);
    } catch (error) {
      console.error(
        `Failed to fetch user by telegram_id ${telegramId}:`,
        error,
      );
      return null;
    }
  }

  async create(user: UserCreate): Promise<User> {
    const data = await httpClient.post<UserOutDTO>("/api/v1/users/", user);
    return this.mapDTOToUser(data);
  }

  async update(id: number, user: UserUpdate): Promise<User> {
    const data = await httpClient.put<UserOutDTO>(
      `/api/v1/users/id/${id}`,
      user,
    );
    return this.mapDTOToUser(data);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await httpClient.get<UserOutDTO>("/api/v1/users/profile");
      return this.mapDTOToUser(data);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      return null;
    }
  }

  async updateCurrentUser(user: UserUpdate): Promise<User> {
    const data = await httpClient.put<UserOutDTO>(
      "/api/v1/users/profile",
      user,
    );
    return this.mapDTOToUser(data);
  }
}
