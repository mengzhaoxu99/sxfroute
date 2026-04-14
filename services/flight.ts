import { FlightData } from '@/types/flight'
import fs from 'fs/promises'
import path from 'path'
import { parse } from 'csv-parse/sync'


export class FlightService {
  static async getAllFlights(): Promise<FlightData[]> {
    try {
      // 首先尝试读取转换后的 JSON 文件
      const jsonPath = path.join(process.cwd(), 'lib', 'flight', 'flight-data.json')
      
      try {
        const jsonData = await fs.readFile(jsonPath, 'utf-8')
        const flights = JSON.parse(jsonData)
        
        // 创建城市对映射以检查返程航班
        const cityPairMap = new Map<string, boolean>()
        flights.forEach((flight: any) => {
          const key = `${flight.origin_city}-${flight.dest_city}`
          cityPairMap.set(key, true)
        })
        
        // 转换为 FlightData 格式
        return flights.map((flight: any, index: number) => {
          const reverseKey = `${flight.dest_city}-${flight.origin_city}`
          const hasReturn = cityPairMap.has(reverseKey)
          const is2666Exclusive = this.is2666Exclusive(flight.dep_minutes)
          
          return {
            id: index + 1,
            flight_no: flight.flight_no,
            carrier_name: flight.carrier_name,
            days: this.bitmapToWeekStr(flight.dow_bitmap),
            origin_airport: flight.origin_airport,
            origin_city: flight.origin_city,
            origin_province: flight.origin_province || '',
            origin_iata_code: flight.origin_iata_code,
            dest_airport: flight.dest_airport,
            dest_city: flight.dest_city,
            dest_province: flight.dest_province || '',
            dest_iata_code: flight.dest_iata_code,
            dep_time: this.minutesToTimeStr(flight.dep_minutes),
            arr_time: this.minutesToTimeStr(flight.arr_minutes),
            is_2666_exclusive: is2666Exclusive,
            hasReturn: hasReturn
          }
        })
      } catch (jsonError) {
        // 如果 JSON 文件不存在，直接读取 CSV 文件
        const csvPath = path.join(process.cwd(), 'public', 'airport.csv')
        const fileContent = await fs.readFile(csvPath, 'utf-8')
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          delimiter: ',',
          trim: true
        }) as Record<string, string>[]

        const getField = (record: Record<string, string>, keys: string[]) => {
          for (const key of keys) {
            const value = record[key]
            if (value !== undefined && value !== null && String(value).trim() !== '') {
              return String(value).trim()
            }
          }
          return ''
        }
        
        // 先创建城市对映射
        const cityPairMap = new Map<string, boolean>()
        records.forEach(record => {
          const originCity = getField(record, ['出港城市', '起飞城市'])
          const destCity = getField(record, ['到港城市', '降落城市'])
          if (originCity && destCity) {
            const key = `${originCity}-${destCity}`
            cityPairMap.set(key, true)
          }
        })
        
        const flights: FlightData[] = []
        
        for (let i = 0; i < records.length; i++) {
          const record = records[i]
          const carrierName = getField(record, ['航空公司'])
          const flightNo = getField(record, ['航班号'])
          const days = getField(record, ['班期'])
          const originAirport = getField(record, ['起飞城市机场名称'])
          const originCity = getField(record, ['出港城市', '起飞城市'])
          const originProvince = getField(record, ['起飞城市所属省/市'])
          const originIataCode = getField(record, ['起飞机场IATA代码'])
          const destAirport = getField(record, ['降落城市机场名称'])
          const destCity = getField(record, ['到港城市', '降落城市'])
          const destProvince = getField(record, ['降落城市所属省/市'])
          const destIataCode = getField(record, ['降落机场IATA代码'])
          const depTimeRaw = getField(record, ['出发时刻', '出港时刻'])
          const arrTimeRaw = getField(record, ['降落时刻', '降落时间'])
          
          if (!flightNo || !carrierName) continue
          
          const depTime = depTimeRaw 
            ? (depTimeRaw.includes(':') ? depTimeRaw.replace(':', '') : depTimeRaw.padStart(4, '0'))
            : ''
          const arrTime = arrTimeRaw 
            ? (arrTimeRaw.includes(':') ? arrTimeRaw.replace(':', '') : arrTimeRaw.padStart(4, '0'))
            : ''

          const depMinutesForTier = this.parseTimeToMinutes(depTimeRaw)
          const is2666Exclusive = this.is2666Exclusive(depMinutesForTier)
          
          // 检查是否有返程航班
          const reverseKey = `${destCity}-${originCity}`
          const hasReturn = cityPairMap.has(reverseKey)
          
          flights.push({
            id: i + 1,
            flight_no: flightNo,
            carrier_name: carrierName,
            days: days,
            origin_airport: originAirport,
            origin_city: originCity,
            origin_province: originProvince,
            origin_iata_code: originIataCode,
            dest_airport: destAirport,
            dest_city: destCity,
            dest_province: destProvince,
            dest_iata_code: destIataCode,
            dep_time: depTime,
            arr_time: arrTime,
            is_2666_exclusive: is2666Exclusive,
            hasReturn: hasReturn
          })
        }
        
        return flights
      }
    } catch (error) {
      console.error('读取航班数据失败:', error)
      throw new Error('无法读取航班数据')
    }
  }
  
  // 将位图转换为周几字符串
  private static bitmapToWeekStr(bitmap: number): string {
    let weekStr = ''
    for (let day = 1; day <= 7; day++) {
      const bitIndex = day === 7 ? 6 : day - 1
      if (bitmap & (1 << bitIndex)) {
        weekStr += day.toString()
      }
    }
    return weekStr
  }
  
  // 将分钟数转换为时间字符串
  private static minutesToTimeStr(minutes: number): string {
    const hours = Math.floor(minutes / 60) % 24
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}${mins.toString().padStart(2, '0')}`
  }

  // 将 HH:mm 或 HHmm 转为分钟数（仅用于 2666 判断）
  private static parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0
    const normalized = timeStr.includes(':') ? timeStr : `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}`
    const [hours, minutes] = normalized.split(':').map(Number)
    return (hours || 0) * 60 + (minutes || 0)
  }
  
  // 判断是否是2666版本特有时段
  private static is2666Exclusive(depMinutes: number): boolean {
    const depHour = Math.floor(depMinutes / 60)
    const depMinute = depMinutes % 60
    return depHour === 19 || (depHour === 8 && depMinute > 0) || (depHour === 9 && depMinute === 0)
  }

  static async searchFlights(origin?: string, destination?: string): Promise<FlightData[]> {
    const allFlights = await this.getAllFlights()
    
    let filteredFlights = allFlights
    
    if (origin && origin !== 'all') {
      // 支持按城市、机场名或IATA代码搜索
      filteredFlights = filteredFlights.filter(flight => 
        flight.origin_city === origin || 
        flight.origin_airport === origin ||
        flight.origin_iata_code === origin
      )
    }
    
    if (destination && destination !== 'all') {
      // 支持按城市、机场名或IATA代码搜索
      filteredFlights = filteredFlights.filter(flight => 
        flight.dest_city === destination || 
        flight.dest_airport === destination ||
        flight.dest_iata_code === destination
      )
    }
    
    return filteredFlights
  }

  static async getFlightStats() {
    const allFlights = await this.getAllFlights()
    
    // 计算航班总数
    const totalFlights = allFlights.length
    
    // 计算覆盖城市数（使用新的城市字段）
    const cities = new Set<string>()
    allFlights.forEach(flight => {
      cities.add(flight.origin_city)
      cities.add(flight.dest_city)
    })
    const totalCities = cities.size
    
    // 计算直飞航线数（唯一的起点-终点组合）
    const routes = new Set<string>()
    allFlights.forEach(flight => {
      routes.add(`${flight.origin_city}-${flight.dest_city}`)
    })
    const totalRoutes = routes.size
    
    return {
      totalFlights,
      totalCities,
      totalRoutes
    }
  }
}
