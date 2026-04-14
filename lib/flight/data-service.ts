import { Flight } from './types';
import { loadRawFlights, getCachedMtime } from './flight-loader';

type FlightIndex = Map<string, Map<number, Flight[]>>;
type ProvinceIndex = Map<string, Map<number, Flight[]>>;

class FlightDataService {
  private flights: Flight[] = [];
  private flightIndex: FlightIndex = new Map();
  private provinceIndex: ProvinceIndex = new Map();
  private loadedMtime = 0;

  // 调用方在每个 API 入口先 await ensureFresh()，之后所有同步 getter 才安全
  // 复用 loader 的 mtime 缓存：loader 没重载就跳过索引重建，零额外 fs.stat
  async ensureFresh(): Promise<void> {
    const flights = await loadRawFlights();
    const currentMtime = getCachedMtime();
    if (this.loadedMtime === currentMtime) {
      return;
    }
    this.flights = flights;
    this.buildIndex();
    this.loadedMtime = currentMtime;
    console.log(
      `[flight-data-service] 索引重建完成：${flights.length} 条航班，${this.flightIndex.size} 个出发城市`
    );
  }

  private buildIndex(): void {
    this.flightIndex.clear();
    this.provinceIndex.clear();

    for (const flight of this.flights) {
      if (!this.flightIndex.has(flight.origin_city)) {
        this.flightIndex.set(flight.origin_city, new Map());
      }
      const cityIndex = this.flightIndex.get(flight.origin_city)!;

      if (flight.origin_province) {
        if (!this.provinceIndex.has(flight.origin_province)) {
          this.provinceIndex.set(flight.origin_province, new Map());
        }
        const provinceIdx = this.provinceIndex.get(flight.origin_province)!;

        for (let dow = 1; dow <= 7; dow++) {
          const bitIndex = dow === 7 ? 6 : dow - 1;
          if (flight.dow_bitmap & (1 << bitIndex)) {
            if (!provinceIdx.has(dow)) {
              provinceIdx.set(dow, []);
            }
            provinceIdx.get(dow)!.push(flight);
          }
        }
      }

      for (let dow = 1; dow <= 7; dow++) {
        const bitIndex = dow === 7 ? 6 : dow - 1;
        if (flight.dow_bitmap & (1 << bitIndex)) {
          if (!cityIndex.has(dow)) {
            cityIndex.set(dow, []);
          }
          cityIndex.get(dow)!.push(flight);
        }
      }
    }

    for (const cityIndex of this.flightIndex.values()) {
      for (const flights of cityIndex.values()) {
        flights.sort((a, b) => a.dep_minutes - b.dep_minutes);
      }
    }
    for (const provinceIdx of this.provinceIndex.values()) {
      for (const flights of provinceIdx.values()) {
        flights.sort((a, b) => a.dep_minutes - b.dep_minutes);
      }
    }
  }

  private assertLoaded(): void {
    if (this.loadedMtime === 0) {
      throw new Error('航班数据尚未加载，请先调用 ensureFresh()');
    }
  }

  getFlightsByOriginAndDay(origin_city: string, dayOfWeek: number): Flight[] {
    this.assertLoaded();
    const cityIndex = this.flightIndex.get(origin_city);
    if (!cityIndex) return [];
    return cityIndex.get(dayOfWeek) || [];
  }

  getFlightsByProvinceAndDay(origin_province: string, dayOfWeek: number): Flight[] {
    this.assertLoaded();
    const provinceIdx = this.provinceIndex.get(origin_province);
    if (!provinceIdx) return [];
    return provinceIdx.get(dayOfWeek) || [];
  }

  getAllCities(): string[] {
    const cities = new Set<string>();
    for (const flight of this.flights) {
      cities.add(flight.origin_city);
      cities.add(flight.dest_city);
    }
    return Array.from(cities).sort();
  }

  getAllProvinces(): string[] {
    const provinces = new Set<string>();
    for (const flight of this.flights) {
      if (flight.origin_province) provinces.add(flight.origin_province);
      if (flight.dest_province) provinces.add(flight.dest_province);
    }
    return Array.from(provinces).sort();
  }

  getStats() {
    return {
      totalFlights: this.flights.length,
      totalCities: this.getAllCities().length,
      totalOriginCities: this.flightIndex.size,
    };
  }

  hasDirectFlight(originCity: string, destCity: string): boolean {
    if (this.loadedMtime === 0) return false;

    for (let dow = 1; dow <= 7; dow++) {
      const flights = this.getFlightsByOriginAndDay(originCity, dow);
      if (flights.some((flight) => flight.dest_city === destCity)) {
        return true;
      }
    }
    return false;
  }
}

export const flightDataService = new FlightDataService();
