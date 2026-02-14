import { API_CONFIG } from "../config/api.config";

export class HttpClient {
  private baseURL: string;
  private secret: string;

  constructor(
    baseURL: string = API_CONFIG.BASE_URL,
    secret: string = API_CONFIG.SECRET,
  ) {
    this.baseURL = baseURL;
    this.secret = secret;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      // Не устанавливаем Content-Type для FormData - браузер сам его установит
      // "Content-Type": "application/json",
    };

    if (this.secret) {
      headers["X-API-Secret"] = this.secret;
    }

    // Проверяем, есть ли в options.headers какие-либо заголовки
    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          headers[key] = value;
        }
      });
    }

    try {
      console.log(`🌐 ${options?.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options?.headers, // Позволяем переопределять заголовки из options
        },
        credentials: "include", // Отправляем cookies с каждым запросом
      });

      if (!response.ok) {
        console.error(`❌ ${options?.method || 'GET'} ${url}: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`✅ ${options?.method || 'GET'} ${url}: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error(`❌ Request failed for ${url}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    // Если данные являются FormData, не преобразуем их в JSON
    if (data instanceof FormData) {
      return this.request<T>(endpoint, {
        ...options,
        method: "POST",
        body: data,
        // Не устанавливаем Content-Type, браузер сам это сделает
      });
    }
    
    // Для обычных данных используем JSON
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    // Если данные являются FormData, не преобразуем их в JSON
    if (data instanceof FormData) {
      return this.request<T>(endpoint, {
        ...options,
        method: "PUT",
        body: data,
        // Не устанавливаем Content-Type, браузер сам это сделает
      });
    }
    
    // Для обычных данных используем JSON
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const httpClient = new HttpClient();
