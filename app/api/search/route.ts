import { NextRequest, NextResponse } from 'next/server';
import { SearchParams, SearchResponse, RoundtripRoute } from '@/lib/flight/types';
import { flightSearchService } from '@/lib/flight/search-service';
import { flightDataService } from '@/lib/flight/data-service';
import { FlightService } from '@/services/flight';

// 机场到城市的映射数据（惰性初始化，避免模块加载时自调用 HTTP）
let airportCityMap: { [key: string]: string } = {};
let mappingsInitialized = false;

async function ensureAirportMappings() {
  if (mappingsInitialized) return;
  try {
    const allFlights = await FlightService.getAllFlights();
    const airportCity: { [key: string]: string } = {};
    const cityAirports: { [key: string]: Set<string> } = {};

    allFlights.forEach(flight => {
      if (flight.origin_airport) {
        airportCity[flight.origin_airport] = flight.origin_city;
        if (!cityAirports[flight.origin_city]) cityAirports[flight.origin_city] = new Set();
        cityAirports[flight.origin_city].add(flight.origin_airport);
      }
      if (flight.dest_airport) {
        airportCity[flight.dest_airport] = flight.dest_city;
        if (!cityAirports[flight.dest_city]) cityAirports[flight.dest_city] = new Set();
        cityAirports[flight.dest_city].add(flight.dest_airport);
      }
    });

    airportCityMap = airportCity;
    mappingsInitialized = true;
  } catch (error) {
    console.error('加载机场映射数据失败:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 确保机场映射数据已加载
    await ensureAirportMappings();

    // 确保航班数据已加载
    if (!flightDataService.isDataLoaded()) {
      return NextResponse.json(
        { error: '航班数据正在加载中，请稍后再试' },
        { status: 503 }
      );
    }

    // 解析请求参数
    const body = await request.json();
    
    // 验证必需参数
    if (!body.origin_city || !body.dest_city || !body.date) {
      return NextResponse.json(
        { error: '缺少必需参数：origin_city, dest_city, date' },
        { status: 400 }
      );
    }
    
    // 处理机场选择：如果输入的是机场名，转换为城市名
    let originCity = body.origin_city;
    let destCity = body.dest_city;
    let originAirport = null;
    let destAirport = null;
    
    // 检查起点是否是机场
    if (airportCityMap[originCity]) {
      originAirport = originCity;
      originCity = airportCityMap[originCity];
    }
    
    // 检查终点是否是机场
    if (airportCityMap[destCity]) {
      destAirport = destCity;
      destCity = airportCityMap[destCity];
    }

    // 构建搜索参数
    const searchParams: SearchParams = {
      origin_city: originCity,
      dest_city: destCity,
      date: body.date,
      windows: body.windows || ['early', 'late'],
      max_stops: body.max_stops !== undefined ? body.max_stops : 1,
      version: body.version || '666',  // 默认使用666版本
      trip_type: body.trip_type || 'oneway',
      return_date: body.return_date,
      return_windows: body.return_windows
    };

    // 验证参数值
    if (searchParams.max_stops < 0 || searchParams.max_stops > 2) {
      return NextResponse.json(
        { error: 'max_stops 必须在 0-2 之间' },
        { status: 400 }
      );
    }

    const validWindows = ['early', 'late'];
    for (const window of searchParams.windows) {
      if (!validWindows.includes(window)) {
        return NextResponse.json(
          { error: '无效的时间窗口，必须是 early 或 late' },
          { status: 400 }
        );
      }
    }

    // 如果是往返，验证返程参数
    if (searchParams.trip_type === 'roundtrip') {
      if (!searchParams.return_date) {
        return NextResponse.json(
          { error: '往返行程必须提供返程日期' },
          { status: 400 }
        );
      }
      
      if (searchParams.return_windows) {
        for (const window of searchParams.return_windows) {
          if (!validWindows.includes(window)) {
            return NextResponse.json(
              { error: '无效的返程时间窗口，必须是 early 或 late' },
              { status: 400 }
            );
          }
        }
      }
    }

    // 执行搜索
    console.log('搜索参数:', searchParams);
    console.log('机场过滤:', { originAirport, destAirport });
    
    if (searchParams.trip_type === 'roundtrip') {
      // 往返搜索：分别搜索去程和返程
      // 去程搜索
      const outboundResult = flightSearchService.searchFlights({
        ...searchParams,
        trip_type: 'oneway'
      });
      
      // 返程搜索
      const returnResult = flightSearchService.searchFlights({
        origin_city: searchParams.dest_city,
        dest_city: searchParams.origin_city,
        date: searchParams.return_date!,
        windows: searchParams.return_windows || searchParams.windows,
        max_stops: searchParams.max_stops,
        version: searchParams.version,
        trip_type: 'oneway'
      });
      
      // 组合往返结果
      const roundtripRoutes: RoundtripRoute[] = [];
      
      // 为了避免结果过多，智能选择航班组合
      // 按中转次数分组，确保多样性
      const groupByStops = (routes: typeof outboundResult.routes) => {
        const groups: { [key: number]: typeof routes } = { 0: [], 1: [], 2: [] };
        routes.forEach(route => {
          if (groups[route.stops]) {
            groups[route.stops].push(route);
          }
        });
        return groups;
      };
      
      const outboundGroups = groupByStops(outboundResult.routes);
      const returnGroups = groupByStops(returnResult.routes);
      
      // 从每个分组中选择航班，确保多样性
      const selectRoutes = (groups: ReturnType<typeof groupByStops>, maxPerGroup = 15) => {
        const selected = [];
        // 优先级：直飞 > 1次中转 > 2次中转
        for (const stops of [0, 1, 2]) {
          if (groups[stops] && groups[stops].length > 0) {
            selected.push(...groups[stops].slice(0, maxPerGroup));
          }
        }
        return selected;
      };
      
      const outboundRoutes = selectRoutes(outboundGroups);
      const returnRoutes = selectRoutes(returnGroups);
      
      // 限制最终组合数量
      const maxCombinations = 100;
      
      for (const outbound of outboundRoutes) {
        for (const returnRoute of returnRoutes) {
          if (roundtripRoutes.length >= maxCombinations) break;
          
          // 解析去程到达时间（包括可能的跨天）
          const arriveTimeParts = outbound.arrive_time.match(/(\d{2}:\d{2})(?:\s*\(\+(\d+)\))?/);
          if (!arriveTimeParts) continue;
          
          const arriveTime = arriveTimeParts[1];
          const plusDays = arriveTimeParts[2] ? parseInt(arriveTimeParts[2]) : 0;
          
          // 计算去程实际到达的日期时间
          const baseDate = new Date(searchParams.date);
          const outboundArrivalDate = new Date(baseDate);
          outboundArrivalDate.setDate(outboundArrivalDate.getDate() + plusDays);
          const [arrHours, arrMinutes] = arriveTime.split(':').map(Number);
          outboundArrivalDate.setHours(arrHours, arrMinutes, 0, 0);
          
          // 计算返程出发的日期时间
          const returnDepartureStr = returnRoute.segments[0].dep_time;
          const returnDepartureDate = new Date(returnDepartureStr);
          
          // 计算时间间隔（毫秒）
          const gapMs = returnDepartureDate.getTime() - outboundArrivalDate.getTime();
          const gapHours = gapMs / (1000 * 60 * 60);
          
          // 只有当返程出发时间晚于去程到达时间时，才是有效的组合
          // 考虑到机场中转，至少需要2小时的缓冲时间
          if (gapHours < 2) {
            continue; // 跳过无效的组合
          }
          
          roundtripRoutes.push({
            outbound,
            return: returnRoute,
            total_duration_mins: outbound.total_duration_mins + returnRoute.total_duration_mins,
            gap_hours: gapHours
          });
        }
        if (roundtripRoutes.length >= maxCombinations) break;
      }
      
      // 按中转次数和总时长排序，确保结果多样性
      roundtripRoutes.sort((a, b) => {
        // 首先按中转次数总和排序（优先显示直飞组合）
        const stopsA = a.outbound.stops + a.return.stops;
        const stopsB = b.outbound.stops + b.return.stops;
        if (stopsA !== stopsB) {
          return stopsA - stopsB;
        }
        // 其次按总时长排序
        return a.total_duration_mins - b.total_duration_mins;
      });
      
      // 构建响应
      const response: SearchResponse = {
        routes: [],
        roundtrip_routes: roundtripRoutes,
        meta: {
          count: roundtripRoutes.length,
          restriction: outboundResult.restriction || returnResult.restriction,
          trip_type: 'roundtrip'
        }
      };
      
      return NextResponse.json(response);
    } else {
      // 单程搜索
      const result = flightSearchService.searchFlights(searchParams);
      
      // 如果指定了特定机场，过滤结果
      let filteredRoutes = result.routes;
      if (originAirport || destAirport) {
        filteredRoutes = result.routes.filter(route => {
          // 检查起点机场
          if (originAirport && route.segments.length > 0) {
            const firstSegment = route.segments[0];
            if (firstSegment.origin_airport !== originAirport) {
              return false;
            }
          }
          
          // 检查终点机场
          if (destAirport && route.segments.length > 0) {
            const lastSegment = route.segments[route.segments.length - 1];
            if (lastSegment.dest_airport !== destAirport) {
              return false;
            }
          }
          
          return true;
        });
      }
      
      // 构建响应
      const response: SearchResponse = {
        routes: filteredRoutes,
        meta: {
          count: filteredRoutes.length,
          restriction: result.restriction,
          trip_type: 'oneway'
        }
      };
      
      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('搜索航班时出错:', error);
    return NextResponse.json(
      { error: '搜索航班时发生错误' },
      { status: 500 }
    );
  }
}

// 健康检查和统计信息
export async function GET() {
  const stats = flightDataService.getStats();
  
  // 计算直飞航线数量（简单估算）
  const allFlights = flightDataService.isDataLoaded() ? stats.totalFlights : 0;
  const estimatedDirectFlights = Math.floor(allFlights * 0.3); // 假设30%是直飞
  
  return NextResponse.json({
    status: 'ok',
    dataLoaded: flightDataService.isDataLoaded(),
    stats: {
      ...stats,
      directFlights: estimatedDirectFlights
    }
  });
}