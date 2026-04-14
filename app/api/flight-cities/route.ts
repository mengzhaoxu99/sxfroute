import { NextResponse } from 'next/server';
import { FlightService } from '@/services/flight';

// 强制动态渲染：底层依赖 data/airport.csv，需要跟随 mtime 热更新而变化
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allFlights = await FlightService.getAllFlights();
    
    // 获取所有唯一的城市和机场映射
    const cities = new Set<string>();
    const cityAirportMap = new Map<string, Set<string>>();
    const airportCityMap = new Map<string, string>();
    
    // 收集所有城市和机场信息
    allFlights.forEach(flight => {
      // 起飞城市和机场
      cities.add(flight.origin_city);
      if (!cityAirportMap.has(flight.origin_city)) {
        cityAirportMap.set(flight.origin_city, new Set());
      }
      if (flight.origin_airport) {
        cityAirportMap.get(flight.origin_city)!.add(flight.origin_airport);
        airportCityMap.set(flight.origin_airport, flight.origin_city);
      }
      
      // 到达城市和机场
      cities.add(flight.dest_city);
      if (!cityAirportMap.has(flight.dest_city)) {
        cityAirportMap.set(flight.dest_city, new Set());
      }
      if (flight.dest_airport) {
        cityAirportMap.get(flight.dest_city)!.add(flight.dest_airport);
        airportCityMap.set(flight.dest_airport, flight.dest_city);
      }
    });
    
    // 转换城市机场映射为对象格式
    const cityAirports: { [city: string]: string[] } = {};
    cityAirportMap.forEach((airports, city) => {
      cityAirports[city] = Array.from(airports).sort();
    });
    
    // 转换机场城市映射为对象格式
    const airportCity: { [airport: string]: string } = {};
    airportCityMap.forEach((city, airport) => {
      airportCity[airport] = city;
    });
    
    const cityList = Array.from(cities).sort();
    
    // 热门城市列表
    const hotCities = [
      '北京', '上海', '广州', '深圳', '成都', '重庆', '西安', '昆明',
      '杭州', '南京', '武汉', '天津', '青岛', '厦门', '三亚', '大连',
      '哈尔滨', '长沙', '郑州', '济南', '福州', '贵阳', '南宁', '海口',
      '拉萨', '乌鲁木齐', '兰州', '西宁', '银川', '呼和浩特', '太原', '石家庄'
    ].filter(city => cities.has(city));
    
    // 识别有多个机场的城市
    const multiAirportCities = Object.entries(cityAirports)
      .filter(([, airports]) => airports.length > 1)
      .map(([city]) => city);
    
    return NextResponse.json({
      cities: cityList,
      hotCities,
      cityAirports,
      airportCity,
      multiAirportCities,
      total: cityList.length
    });
    
  } catch (error) {
    console.error('获取城市列表时出错:', error);
    return NextResponse.json(
      { error: '获取城市列表时发生错误' },
      { status: 500 }
    );
  }
}