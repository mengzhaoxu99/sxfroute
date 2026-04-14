// 原始航班数据
export interface Flight {
  carrier_name: string;        // 航司名称
  flight_no: string;           // 航班号
  origin_city: string;         // 出发城市
  origin_airport: string;      // 出发机场
  origin_iata_code: string;    // 出发机场IATA代码
  origin_province: string;     // 出发地所属省市
  dest_city: string;           // 到达城市
  dest_airport: string;        // 到达机场
  dest_iata_code: string;      // 到达机场IATA代码
  dest_province: string;       // 目的地所属省市
  dow_bitmap: number;          // 班期位图（周一bit0...周日bit6）
  dep_minutes: number;         // 起飞时间（0-1439分钟）
  arr_minutes: number;         // 到达时间（0-1439分钟）
  overnight: boolean;          // 是否跨日（arr < dep）
  product?: string;            // 适用产品（如 666 / 2666）
}

// 航段信息（搜索结果中的单段）
export interface Segment {
  carrier_name: string;
  flight_no: string;
  origin_city: string;
  origin_airport: string;  // 出发机场
  origin_iata_code: string; // 出发机场IATA代码
  origin_province: string; // 出发地所属省市
  dest_city: string;
  dest_airport: string;    // 到达机场
  dest_iata_code: string;   // 到达机场IATA代码
  dest_province: string;   // 目的地所属省市
  dep_time: string;      // 格式化的起飞时间 "YYYY-MM-DD HH:mm"
  arr_time: string;      // 格式化的到达时间 "YYYY-MM-DD HH:mm"
  plus_day: number;      // 起飞日相对查询日的偏移（0/1/2）
}

// 路线信息（完整的航线）
export interface Route {
  stops: number;                  // 中转次数
  segments: Segment[];            // 航段列表
  connect_cities: string[];       // 中转城市列表
  arrive_time: string;            // 最终到达时间（含+1/+2标记）
  total_duration_mins: number;    // 总飞行时间（分钟）
  hasReturn?: boolean;            // 是否存在返程直飞航班
}

// 搜索请求参数
export interface SearchParams {
  origin_city: string;
  dest_city: string;
  date: string;           // YYYY-MM-DD
  windows: ('early' | 'late')[];  // early=00:00-08:59/09:59, late=20:00/19:00-23:59
  max_stops: number;      // 0/1/2
  version?: '666' | '2666';  // 会员版本，默认666
  trip_type?: 'oneway' | 'roundtrip';  // 行程类型，默认单程
  return_date?: string;                 // 返程日期 YYYY-MM-DD
  return_windows?: ('early' | 'late')[];  // 返程时间窗口
}

// 往返路线信息
export interface RoundtripRoute {
  outbound: Route;        // 去程路线
  return: Route;          // 返程路线
  total_duration_mins: number;  // 总飞行时间（分钟）
  gap_hours?: number;     // 去程到达与返程出发之间的间隔（小时）
}

// 搜索响应
export interface SearchResponse {
  routes: Route[];
  roundtrip_routes?: RoundtripRoute[];  // 往返路线（仅在往返搜索时返回）
  meta: {
    count: number;
    restriction?: string;  // 限制信息（如日期限制）
    trip_type?: 'oneway' | 'roundtrip';  // 返回的行程类型
  };
}

// 内部使用的航段（带绝对时间）
export interface InternalSegment {
  flight: Flight;
  dep_abs: number;      // 绝对分钟（相对查询日00:00）
  arr_abs: number;      // 绝对分钟（相对查询日00:00）
  plus_day: number;     // 起飞日偏移
}

// 搜索状态节点（BFS用）
export interface SearchNode {
  segments: InternalSegment[];
  visited_cities: Set<string>;
  arr_abs: number;
  total_duration: number;
}

// 时间窗口定义
export const TIME_WINDOWS = {
  '666': {
    early: { start: 0, end: 480 },      // 00:00-08:00 (0-480分钟)
    late: { start: 1200, end: 1439 }    // 20:00-23:59 (1200-1439分钟)
  },
  '2666': {
    early: { start: 0, end: 540 },      // 00:00-09:00 (0-540分钟) 
    late: { start: 1140, end: 1439 }    // 19:00-23:59 (1140-1439分钟)
  }
};

// 约束常量
export const CONSTRAINTS = {
  MIN_CONNECT_MINS: 60,         // 最小中转时间（1小时）
  MAX_CONNECT_MINS: 1440,       // 最大中转时间（24小时）
  MAX_TOTAL_HOURS: 48,          // 最大总行程时间
  MAX_TRIP_SPAN_DAYS: 2,        // 最大跨日天数
  MAX_ROUTES: 200,              // 返回路线上限
  MAX_EXPAND_PER_NODE: 50,      // 每节点扩展边上限
};
