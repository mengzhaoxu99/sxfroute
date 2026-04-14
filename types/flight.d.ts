// 航班数据类型
export interface FlightData {
  id: number
  flight_no: string
  carrier_name: string
  days: string
  origin_airport: string
  origin_city: string
  origin_province: string
  origin_iata_code: string
  dest_airport: string
  dest_city: string
  dest_province: string
  dest_iata_code: string
  dep_time: string
  arr_time: string
  is_2666_exclusive?: boolean
  hasReturn?: boolean  // 是否有返程直飞航班
}

// 航班搜索参数
export interface FlightSearchParams {
  origin?: string
  destination?: string
  date?: string
}

// 航班列表响应
export interface FlightListResponse {
  flights: FlightData[]
  total: number
}