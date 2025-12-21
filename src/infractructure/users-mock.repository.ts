import {
  User,
  UserCreate,
  UserUpdate,
  UsersRepository,
} from "../domain/user-repo.interface";

const usersMock: User[] = [
  new User(1, "321", "Иван Петров", null, { id: 1, name: "Москва" }, 1, "1500"),
  new User(2, "123", "Анна Иванова", null, { id: 2, name: "Санкт-Петербург" }, 1, "1200"),
  new User(3, "3210", "Сергей Сидоров", null, { id: 3, name: "Казань" }, 1, "1800"),
];

export default class UsersMockRepository implements UsersRepository {
  private users: User[] = [...usersMock];
  private nextId = 4;

  findById(id: number): Promise<User | null> {
    return Promise.resolve(this.users.find((user) => user.id === id) || null);
  }

  findByTelegramId(telegramId: string): Promise<User | null> {
    return Promise.resolve(
      this.users.find((user) => user.telegram_id === telegramId) || null,
    );
  }

  create(user: UserCreate): Promise<User> {
    const newUser = new User(
      this.nextId++,
      user.telegram_id,
      user.username || null,
      user.phone || null,
      user.city_id ? { id: user.city_id, name: "Mock City" } : null,
      user.role_id || null,
      user.skill_level || null,
    );
    this.users.push(newUser);
    return Promise.resolve(newUser);
  }

  update(id: number, userUpdate: UserUpdate): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    const existingUser = this.users[userIndex]!;
    const updatedUser = new User(
      existingUser.id,
      existingUser.telegram_id,
      userUpdate.username !== undefined
        ? userUpdate.username
        : existingUser.username,
      userUpdate.phone !== undefined ? userUpdate.phone : existingUser.phone,
      userUpdate.city_id !== undefined
        ? (userUpdate.city_id ? { id: userUpdate.city_id, name: "Mock City" } : null)
        : existingUser.city,
      userUpdate.role_id !== undefined
        ? userUpdate.role_id
        : existingUser.role_id,
      userUpdate.skill_level !== undefined
        ? userUpdate.skill_level
        : existingUser.skill_level,
    );

    this.users[userIndex] = updatedUser;
    return Promise.resolve(updatedUser);
  }

  getCurrentUser(): Promise<User | null> {
    // Для mock возвращаем первого пользователя
    return Promise.resolve(this.users[0] || null);
  }

  updateCurrentUser(userUpdate: UserUpdate): Promise<User> {
    // Для mock обновляем первого пользователя
    const currentUser = this.users[0];
    if (!currentUser) {
      throw new Error("No current user found");
    }
    return this.update(currentUser.id, userUpdate);
  }
}
