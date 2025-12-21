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
      "Content-Type": "application/json",
    };

    if (this.secret) {
      headers["X-API-Secret"] = this.secret;
    }

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
        headers,
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
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const httpClient = new HttpClient();
