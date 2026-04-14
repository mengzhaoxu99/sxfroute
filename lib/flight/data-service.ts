import { Flight } from './types';

// 航班索引：origin_city -> dow -> flights[]
type FlightIndex = Map<string, Map<number, Flight[]>>;
// 省份索引：origin_province -> dow -> flights[]
type ProvinceIndex = Map<string, Map<number, Flight[]>>;

class FlightDataService {
  private flights: Flight[] = [];
  private flightIndex: FlightIndex = new Map();
  private provinceIndex: ProvinceIndex = new Map();
  private isLoaded = false;

  constructor() {
    // 自动加载数据
    this.loadData();
  }

  // 加载CSV数据
  private async loadData(): Promise<void> {
    try {
      console.log('开始加载航班数据...');
      
      // 在Next.js中使用动态导入加载数据
      const flightData = await import('./flight-data.json');
      const flights = flightData.default as Flight[];
      
      this.flights = flights;
      this.buildIndex();
      this.isLoaded = true;
      
      console.log(`成功加载 ${flights.length} 条航班数据`);
      console.log(`覆盖 ${this.flightIndex.size} 个出发城市`);
      
    } catch (error) {
      console.error('加载航班数据失败:', error);
      // 如果加载失败，使用模拟数据
      this.loadMockData();
    }
  }

  // 加载模拟数据（备用方案）
  private loadMockData(): void {
    // 模拟数据，实际应用中应该从CSV转换
    const mockFlights: Flight[] = [
      {
        carrier_name: "海南航空",
        flight_no: "HU7148",
        origin_city: "北京",
        origin_airport: "北京首都国际机场",
        origin_iata_code: "PEK",
        origin_province: "北京市",
        dest_city: "三亚",
        dest_airport: "三亚凤凰国际机场",
        dest_iata_code: "SYX",
        dest_province: "海南省",
        dow_bitmap: 127, // 每天
        dep_minutes: 1380, // 23:00
        arr_minutes: 180, // 03:00
        overnight: true
      },
      {
        carrier_name: "海南航空",
        flight_no: "HU7248",
        origin_city: "上海",
        origin_airport: "上海浦东国际机场",
        origin_iata_code: "PVG",
        origin_province: "上海市",
        dest_city: "海口",
        dest_airport: "海口美兰国际机场",
        dest_iata_code: "HAK",
        dest_province: "海南省",
        dow_bitmap: 127,
        dep_minutes: 1320, // 22:00
        arr_minutes: 60, // 01:00
        overnight: true
      },
      // 添加更多模拟航班...
    ];

    this.flights = mockFlights;
    this.buildIndex();
    this.isLoaded = true;
  }

  // 构建索引
  private buildIndex(): void {
    this.flightIndex.clear();
    this.provinceIndex.clear();
    
    for (const flight of this.flights) {
      // 获取或创建城市索引
      if (!this.flightIndex.has(flight.origin_city)) {
        this.flightIndex.set(flight.origin_city, new Map());
      }
      const cityIndex = this.flightIndex.get(flight.origin_city)!;
      
      // 获取或创建省份索引
      if (flight.origin_province) {
        if (!this.provinceIndex.has(flight.origin_province)) {
          this.provinceIndex.set(flight.origin_province, new Map());
        }
        const provinceIdx = this.provinceIndex.get(flight.origin_province)!;
        
        // 对于每个班期日，将航班加入省份索引
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
      
      // 对于每个班期日，将航班加入城市索引
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
    
    // 对每个城市的每天航班按起飞时间排序
    for (const cityIndex of this.flightIndex.values()) {
      for (const flights of cityIndex.values()) {
        flights.sort((a, b) => a.dep_minutes - b.dep_minutes);
      }
    }
    
    // 对每个省份的每天航班按起飞时间排序
    for (const provinceIdx of this.provinceIndex.values()) {
      for (const flights of provinceIdx.values()) {
        flights.sort((a, b) => a.dep_minutes - b.dep_minutes);
      }
    }
  }

  // 获取某个城市某天的航班
  getFlightsByOriginAndDay(origin_city: string, dayOfWeek: number): Flight[] {
    if (!this.isLoaded) {
      throw new Error('航班数据尚未加载');
    }
    
    const cityIndex = this.flightIndex.get(origin_city);
    if (!cityIndex) {
      return [];
    }
    
    return cityIndex.get(dayOfWeek) || [];
  }

  // 获取某个省份某天的航班
  getFlightsByProvinceAndDay(origin_province: string, dayOfWeek: number): Flight[] {
    if (!this.isLoaded) {
      throw new Error('航班数据尚未加载');
    }
    
    const provinceIdx = this.provinceIndex.get(origin_province);
    if (!provinceIdx) {
      return [];
    }
    
    return provinceIdx.get(dayOfWeek) || [];
  }

  // 获取所有城市列表
  getAllCities(): string[] {
    const cities = new Set<string>();
    for (const flight of this.flights) {
      cities.add(flight.origin_city);
      cities.add(flight.dest_city);
    }
    return Array.from(cities).sort();
  }

  // 获取所有省份列表
  getAllProvinces(): string[] {
    const provinces = new Set<string>();
    for (const flight of this.flights) {
      if (flight.origin_province) {
        provinces.add(flight.origin_province);
      }
      if (flight.dest_province) {
        provinces.add(flight.dest_province);
      }
    }
    return Array.from(provinces).sort();
  }

  // 检查数据是否已加载
  isDataLoaded(): boolean {
    return this.isLoaded;
  }

  // 获取统计信息
  getStats() {
    return {
      totalFlights: this.flights.length,
      totalCities: this.getAllCities().length,
      totalOriginCities: this.flightIndex.size
    };
  }

  // 检查两个城市之间是否有直飞航班（用于检查可往返）
  hasDirectFlight(originCity: string, destCity: string): boolean {
    if (!this.isLoaded) {
      return false;
    }
    
    // 检查所有可能的航班日期
    for (let dow = 1; dow <= 7; dow++) {
      const flights = this.getFlightsByOriginAndDay(originCity, dow);
      if (flights.some(flight => flight.dest_city === destCity)) {
        return true;
      }
    }
    
    return false;
  }
}

// 创建单例实例
export const flightDataService = new FlightDataService();