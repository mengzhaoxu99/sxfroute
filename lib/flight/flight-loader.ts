import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Flight } from './types';
import type { FlightData } from '@/types/flight';
import {
  timeToMinutes,
  weekStrToBitmap,
  bitmapToWeekStr,
  minutesToTimeCompact,
  is2666Exclusive,
  getCsvField,
} from './utils';

const CSV_PATH = path.join(process.cwd(), 'data', 'airport.csv');

interface CacheBundle {
  mtimeMs: number;
  rawFlights: Flight[];
  flightData: FlightData[];
}

let cache: CacheBundle | null = null;
let pendingReload: Promise<CacheBundle> | null = null;
// 上一次解析失败时的 mtime；同 mtime 再来短路掉重试，避免高频请求反复 readFile + parse 坏文件
let lastFailedMtime = 0;

async function statMtime(): Promise<number> {
  const stats = await fs.stat(CSV_PATH);
  return stats.mtimeMs;
}

async function readAndParse(mtimeMs: number): Promise<CacheBundle> {
  let fileContent = await fs.readFile(CSV_PATH, 'utf-8');

  // 移除 UTF-8 BOM，否则 csv-parse 会把第一列头污染
  if (fileContent.charCodeAt(0) === 0xFEFF) {
    fileContent = fileContent.slice(1);
  }

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ',',
    trim: true,
  }) as Record<string, string>[];

  const rawFlights: Flight[] = [];
  const cityPairMap = new Map<string, boolean>();

  for (const record of records) {
    const carrier_name = getCsvField(record, ['航空公司']);
    const flight_no = getCsvField(record, ['航班号']);
    const week_str = getCsvField(record, ['班期']);
    const origin_airport = getCsvField(record, ['起飞城市机场名称']);
    let origin_city = getCsvField(record, ['出港城市', '起飞城市']);
    const origin_province = getCsvField(record, ['起飞城市所属省/市']);
    const origin_iata_code = getCsvField(record, ['起飞机场IATA代码']);
    const dest_airport = getCsvField(record, ['降落城市机场名称']);
    let dest_city = getCsvField(record, ['到港城市', '降落城市']);
    const dest_province = getCsvField(record, ['降落城市所属省/市']);
    const dest_iata_code = getCsvField(record, ['降落机场IATA代码']);
    const product = getCsvField(record, ['产品', '适用档位']);

    // 城市名为空时从机场名兜底（旧表头不规范时用）
    if (!origin_city && origin_airport) {
      origin_city = origin_airport.match(/^([^机场]+)/)?.[1] || origin_airport;
    }
    if (!dest_city && dest_airport) {
      dest_city = dest_airport.match(/^([^机场]+)/)?.[1] || dest_airport;
    }

    const dep_str = getCsvField(record, ['出发时刻', '出港时刻']);
    const arr_str = getCsvField(record, ['降落时刻', '降落时间']);

    if (!flight_no || !carrier_name) continue;

    const dep_minutes = timeToMinutes(dep_str);
    const arr_minutes = timeToMinutes(arr_str);
    const overnight = arr_minutes < dep_minutes;
    const dow_bitmap = weekStrToBitmap(week_str);

    rawFlights.push({
      carrier_name,
      flight_no,
      origin_city,
      origin_airport,
      origin_iata_code,
      origin_province,
      dest_city,
      dest_airport,
      dest_iata_code,
      dest_province,
      dow_bitmap,
      dep_minutes,
      arr_minutes,
      overnight,
      product,
    });

    if (origin_city && dest_city) {
      cityPairMap.set(`${origin_city}-${dest_city}`, true);
    }
  }

  // 解析后零条记录视为异常：空文件、纯表头、字段缺失全部被表面"成功"地解析为 []，
  // 但语义上数据丢了，必须当失败抛出去让上层走"沿用旧缓存"的降级路径
  if (rawFlights.length === 0) {
    throw new Error('解析后航班数据为空，可能是 csv 被清空或格式异常');
  }

  const flightData: FlightData[] = rawFlights.map((f, idx) => ({
    id: idx + 1,
    flight_no: f.flight_no,
    carrier_name: f.carrier_name,
    days: bitmapToWeekStr(f.dow_bitmap),
    origin_airport: f.origin_airport,
    origin_city: f.origin_city,
    origin_province: f.origin_province || '',
    origin_iata_code: f.origin_iata_code,
    dest_airport: f.dest_airport,
    dest_city: f.dest_city,
    dest_province: f.dest_province || '',
    dest_iata_code: f.dest_iata_code,
    dep_time: minutesToTimeCompact(f.dep_minutes),
    arr_time: minutesToTimeCompact(f.arr_minutes),
    is_2666_exclusive: is2666Exclusive(f.dep_minutes),
    hasReturn: cityPairMap.has(`${f.dest_city}-${f.origin_city}`),
  }));

  return { mtimeMs, rawFlights, flightData };
}

// 并发安全：所有并发调用共享同一个 pendingReload Promise
// 容错策略：成功加载过至少一次后，后续 stat / 解析失败都降级返回旧缓存，
// 避免用户在线编辑 csv 出现半写入或临时坏文件时把整个服务拖死
async function ensureLoaded(): Promise<CacheBundle> {
  if (pendingReload) {
    return pendingReload;
  }

  let current: number;
  try {
    current = await statMtime();
  } catch (error) {
    if (cache) {
      console.warn('[flight-loader] 无法获取 csv mtime，沿用上一份缓存:', error);
      return cache;
    }
    throw error;
  }

  if (cache && current === cache.mtimeMs) {
    return cache;
  }

  // 上一轮在同一个 mtime 上已经失败过：直接沿用旧缓存，跳过重复 readFile + parse
  // 文件被修复后 mtime 一定会变，下次自然就会重试
  if (cache && current === lastFailedMtime) {
    return cache;
  }

  pendingReload = readAndParse(current)
    .then((bundle) => {
      cache = bundle;
      lastFailedMtime = 0;
      console.log(`[flight-loader] 已加载 ${bundle.rawFlights.length} 条航班（mtime=${bundle.mtimeMs}）`);
      return bundle;
    })
    .catch((error): CacheBundle => {
      if (cache) {
        lastFailedMtime = current;
        console.error(`[flight-loader] 解析失败（mtime=${current}），沿用上一份缓存:`, error);
        return cache;
      }
      throw error;
    })
    .finally(() => {
      pendingReload = null;
    });

  return pendingReload;
}

export async function loadRawFlights(): Promise<Flight[]> {
  const bundle = await ensureLoaded();
  return bundle.rawFlights;
}

export async function loadFlightData(): Promise<FlightData[]> {
  const bundle = await ensureLoaded();
  return bundle.flightData;
}

// 同步读取模块级缓存中的 mtime；调用方必须先 await loadRawFlights/loadFlightData 确保 cache 已填充
// 用于让 data-service / flight-cache 在不重复 stat 的前提下判断是否需要重建衍生状态
export function getCachedMtime(): number {
  return cache?.mtimeMs ?? 0;
}
