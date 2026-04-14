import { FlightService } from './flight'
import { getCachedMtime } from '@/lib/flight/flight-loader'
import type { FlightData } from '@/types/flight'

interface FlightStatsCache {
  totalFlights: number
  totalCities: number
  totalRoutes: number
  lastUpdated: Date
}

class FlightCacheManager {
  private static instance: FlightCacheManager
  private statsCache: FlightStatsCache | null = null
  private loadedMtime = 0

  private constructor() {}

  static getInstance(): FlightCacheManager {
    if (!FlightCacheManager.instance) {
      FlightCacheManager.instance = new FlightCacheManager()
    }
    return FlightCacheManager.instance
  }

  async initialize() {
    console.log('正在初始化航班数据缓存...')
    await this.ensureFresh()
    console.log('航班数据缓存初始化完成')
  }

  // 复用 loader 的 mtime 缓存：loader 没重载就跳过 stats 重算，零额外 fs.stat
  async ensureFresh(): Promise<void> {
    const flights = await FlightService.getAllFlights()
    const currentMtime = getCachedMtime()
    if (this.statsCache && this.loadedMtime === currentMtime) {
      return
    }
    this.statsCache = {
      totalFlights: flights.length,
      totalCities: this.countCities(flights),
      totalRoutes: this.countRoutes(flights),
      lastUpdated: new Date(),
    }
    this.loadedMtime = currentMtime
    console.log(
      `缓存更新完成: ${this.statsCache.totalFlights} 条航班, ${this.statsCache.totalCities} 个城市, ${this.statsCache.totalRoutes} 条航线`
    )
  }

  private countCities(flights: FlightData[]): number {
    const cities = new Set<string>()
    for (const f of flights) {
      cities.add(f.origin_city)
      cities.add(f.dest_city)
    }
    return cities.size
  }

  private countRoutes(flights: FlightData[]): number {
    const routes = new Set<string>()
    for (const f of flights) {
      routes.add(`${f.origin_city}-${f.dest_city}`)
    }
    return routes.size
  }

  getStats(): FlightStatsCache | null {
    return this.statsCache
  }
}

export const flightCache = FlightCacheManager.getInstance()
