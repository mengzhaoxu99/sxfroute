import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Flight } from './types';
import { timeToMinutes, weekStrToBitmap } from './utils';

export function convertCsvToJson(): void {
  const csvPath = path.join(process.cwd(), 'public', 'airport.csv');
  const jsonPath = path.join(process.cwd(), 'lib', 'flight', 'flight-data.json');
  
  if (!fs.existsSync(csvPath)) {
    console.error('CSV 文件不存在:', csvPath);
    return;
  }
  
  try {
    let fileContent = fs.readFileSync(csvPath, 'utf-8');
    // 移除UTF-8 BOM字符
    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.slice(1);
    }
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      trim: true
    }) as Record<string, string>[];
    
    const flights: Flight[] = [];
    const getField = (record: Record<string, string>, keys: string[]): string => {
      for (const key of keys) {
        const value = record[key];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          return String(value).trim();
        }
      }
      return '';
    };
    
    for (const record of records) {
      const carrier_name = getField(record, ['航空公司']);
      const flight_no = getField(record, ['航班号']);
      const week_str = getField(record, ['班期']);
      const origin_airport = getField(record, ['起飞城市机场名称']);
      let origin_city = getField(record, ['出港城市', '起飞城市']);
      const origin_province = getField(record, ['起飞城市所属省/市']);
      const origin_iata_code = getField(record, ['起飞机场IATA代码']);
      const dest_airport = getField(record, ['降落城市机场名称']);
      let dest_city = getField(record, ['到港城市', '降落城市']);
      const dest_province = getField(record, ['降落城市所属省/市']);
      const dest_iata_code = getField(record, ['降落机场IATA代码']);
      const product = getField(record, ['产品', '适用档位']);
      
      // 如果城市名为空，尝试从机场名提取
      if (!origin_city && origin_airport) {
        origin_city = origin_airport.match(/^([^机场]+)/)?.[1] || origin_airport;
      }
      if (!dest_city && dest_airport) {
        dest_city = dest_airport.match(/^([^机场]+)/)?.[1] || dest_airport;
      }
      const dep_str = getField(record, ['出发时刻', '出港时刻']);
      const arr_str = getField(record, ['降落时刻', '降落时间']);
      
      if (!flight_no || !carrier_name) continue;
      
      // 转换时间 - 直接使用原始格式（支持 HH:MM）
      const dep_minutes = timeToMinutes(dep_str);
      const arr_minutes = timeToMinutes(arr_str);
      const overnight = arr_minutes < dep_minutes;
      
      // 转换班期
      const dow_bitmap = weekStrToBitmap(week_str);
      
      const flight: Flight = {
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
        product
      };
      
      flights.push(flight);
    }
    
    // 确保目录存在
    const jsonDir = path.dirname(jsonPath);
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true });
    }
    
    // 保存为JSON文件
    fs.writeFileSync(jsonPath, JSON.stringify(flights, null, 2));
    
    console.log(`CSV 转换完成：${flights.length} 条航班数据`);
  } catch (error) {
    console.error('转换 CSV 失败:', error);
  }
}
