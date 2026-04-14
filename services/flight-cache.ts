import { FlightService } from './flight'
import { convertCsvToJson } from '@/lib/flight/csv-converter'
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
  private flightDataCache: FlightData[] | null = null
  
  private constructor() {}
  
  static getInstance(): FlightCacheManager {
    if (!FlightCacheManager.instance) {
      FlightCacheManager.instance = new FlightCacheManager()
    }
    return FlightCacheManager.instance
  }
  
  async initialize() {
    console.log('正在初始化航班数据缓存...')
    
    // 首先将 CSV 转换为 JSON
    console.log('正在同步 CSV 数据...')
    convertCsvToJson()
    
    await this.refreshCache()
    console.log('航班数据缓存初始化完成')
  }
  
  async refreshCache() {
    try {
      // 加载所有航班数据
      const allFlights = await FlightService.getAllFlights()
      this.flightDataCache = allFlights
      
      // 计算统计数据
      const stats = await FlightService.getFlightStats()
      this.statsCache = {
        ...stats,
        lastUpdated: new Date()
      }
      
      console.log(`缓存更新完成: ${stats.totalFlights} 条航班, ${stats.totalCities} 个城市, ${stats.totalRoutes} 条航线`)
    } catch (error) {
      console.error('更新缓存失败:', error)
    }
  }
  
  getStats(): FlightStatsCache | null {
    return this.statsCache
  }
  
  getFlightData(): FlightData[] | null {
    return this.flightDataCache
  }
  
  // 检查缓存是否需要更新（例如超过1小时）
  needsRefresh(): boolean {
    if (!this.statsCache) return true
    const hoursSinceUpdate = (Date.now() - this.statsCache.lastUpdated.getTime()) / (1000 * 60 * 60)
    return hoursSinceUpdate > 1
  }
}

export const flightCache = FlightCacheManager.getInstance()