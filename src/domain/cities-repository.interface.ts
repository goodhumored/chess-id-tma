import City from "./city";

export type CityCreate = {
  name: string;
};

export type CityUpdate = {
  name?: string | null;
};

export default interface CitiesRepository {
  getAll(): Promise<City[]>;
  getById(id: number): Promise<City | null>;
  create(city: CityCreate): Promise<City>;
  update(id: number, city: CityUpdate): Promise<City>;
  delete(id: number): Promise<void>;
}
