import City from "../domain/city";
import CitiesRepository, {
  CityCreate,
  CityUpdate,
} from "../domain/cities-repository.interface";
import { httpClient } from "../lib/http-client";

type CityOutDTO = {
  id: number;
  name: string;
};

export default class CitiesRestRepository implements CitiesRepository {
  private mapDTOToCity(dto: CityOutDTO): City {
    return new City(dto.id, dto.name);
  }

  async getAll(): Promise<City[]> {
    try {
      const data = await httpClient.get<CityOutDTO[]>("/api/v1/cities/");
      return data.map((dto) => this.mapDTOToCity(dto));
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      return [];
    }
  }

  async getById(id: number): Promise<City | null> {
    try {
      const data = await httpClient.get<CityOutDTO>(`/api/v1/cities/id/${id}`);
      return this.mapDTOToCity(data);
    } catch (error) {
      console.error(`Failed to fetch city by id ${id}:`, error);
      return null;
    }
  }

  async create(city: CityCreate): Promise<City> {
    const data = await httpClient.post<CityOutDTO>("/api/v1/cities/", city);
    return this.mapDTOToCity(data);
  }

  async update(id: number, city: CityUpdate): Promise<City> {
    const data = await httpClient.put<CityOutDTO>(
      `/api/v1/cities/id/${id}`,
      city,
    );
    return this.mapDTOToCity(data);
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/api/v1/cities/id/${id}`);
  }
}
