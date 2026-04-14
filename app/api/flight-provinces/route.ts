import { NextResponse } from 'next/server';
import { FlightService } from '@/services/flight';

// 强制动态渲染：底层依赖 data/airport.csv，需要跟随 mtime 热更新而变化
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allFlights = await FlightService.getAllFlights();
    
    // 获取所有唯一的省份
    const provinces = new Set<string>();
    allFlights.forEach(flight => {
      if (flight.origin_province) {
        provinces.add(flight.origin_province);
      }
      if (flight.dest_province) {
        provinces.add(flight.dest_province);
      }
    });
    
    const provinceList = Array.from(provinces).sort();
    
    // 热门省份列表
    const hotProvinces = [
      '北京市', '上海市', '广东省', '四川省', '云南省', '海南省', 
      '新疆维吾尔自治区', '西藏自治区', '浙江省', '江苏省', '山东省',
      '福建省', '湖北省', '湖南省', '陕西省', '重庆市'
    ].filter(province => provinces.has(province));
    
    return NextResponse.json({
      provinces: provinceList,
      hotProvinces,
      total: provinceList.length
    });
    
  } catch (error) {
    console.error('获取省份列表时出错:', error);
    return NextResponse.json(
      { error: '获取省份列表时发生错误' },
      { status: 500 }
    );
  }
}