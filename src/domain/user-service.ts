import {
  User,
  UserCreate,
  UserUpdate,
  UsersRepository,
} from "./user-repo.interface";

export default class UsersService {
  constructor(private readonly _userRepo: UsersRepository) {}

  async getUserById(id: number): Promise<User | null> {
    return this._userRepo.findById(id);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    return this._userRepo.findByTelegramId(telegramId);
  }

  async createUser(user: UserCreate): Promise<User> {
    return this._userRepo.create(user);
  }

  async updateUser(id: number, user: UserUpdate): Promise<User> {
    return this._userRepo.update(id, user);
  }

  async getCurrentUser(): Promise<User | null> {
    return this._userRepo.getCurrentUser();
  }

  async updateCurrentUser(user: UserUpdate): Promise<User> {
    return this._userRepo.updateCurrentUser(user);
  }

  // Метод для получения или создания пользователя при авторизации через Telegram
  async getOrCreateUserByTelegram(
    telegramId: string,
    username?: string | null,
  ): Promise<User> {
    const existingUser = await this.getUserByTelegramId(telegramId);

    if (existingUser) {
      return existingUser;
    }

    return this.createUser({
      telegram_id: telegramId,
      username: username || null,
    });
  }
}
