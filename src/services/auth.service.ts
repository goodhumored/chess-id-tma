import { API_CONFIG } from "@/config/api.config";

export type TelegramAuthRequest = {
  init_data: string;
  phone?: string | null;
  city?: string | null;
};

export class AuthService {
  async authenticateWithTelegram(
    initData: string,
    phone?: string,
    city?: string,
  ): Promise<boolean> {
    try {
      console.log("📤 Sending auth request to backend...");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/v1/auth/telegram`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Secret": API_CONFIG.SECRET,
          },
          credentials: "include", // ВАЖНО! Для cookies
          // redirect: "follow" по умолчанию - следуем за редиректом на /profile
          body: JSON.stringify({
            init_data: initData,
            phone: phone || null,
            city: city || null,
          }),
        },
      );

      console.log(`📥 Auth response: status=${response.status}`);

      // Backend возвращает 200 OK с данными пользователя и устанавливает cookie
      return response.ok;
    } catch (error: any) {
      console.error("❌ Telegram auth request failed:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
