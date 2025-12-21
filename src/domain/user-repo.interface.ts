export type City = {
  id: number;
  name: string;
};

export class User {
  constructor(
    public id: number,
    public telegram_id: string,
    public username: string | null,
    public phone: string | null,
    public city: City | null,
    public role_id: number | null,
    public skill_level: string | null,
  ) {}

  // Для обратной совместимости
  get city_id(): number | null {
    return this.city?.id ?? null;
  }

  // Helper для получения аватара через Telegram API или дефолтный
  getAvatarUrl(): string {
    return `https://i.pravatar.cc/150?img=${this.id}`;
  }

  // Helper для получения отображаемого имени
  getDisplayName(): string {
    return this.username || `User ${this.telegram_id}`;
  }

  // Helper для получения названия города
  getCityName(): string {
    return this.city?.name || "Город не указан";
  }
}

export interface UsersRepository {
  findById(id: number): Promise<User | null>;
  findByTelegramId(telegramId: string): Promise<User | null>;
  create(user: UserCreate): Promise<User>;
  update(id: number, user: UserUpdate): Promise<User>;
  getCurrentUser(): Promise<User | null>;
  updateCurrentUser(user: UserUpdate): Promise<User>;
}

export type UserCreate = {
  telegram_id: string;
  username?: string | null;
  phone?: string | null;
  city_id?: number | null;
  role_id?: number | null;
  skill_level?: string | null;
};

export type UserUpdate = {
  username?: string | null;
  phone?: string | null;
  city_id?: number | null;
  role_id?: number | null;
  skill_level?: string | null;
};
