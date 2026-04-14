import { format, addDays, getDay } from 'date-fns';

// 将 HHmm 或 HH:MM 格式转换为分钟数（0-1439）
export function timeToMinutes(timeStr: string): number {
  // 支持 HH:MM 格式
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
  // 原有的 HHMM 格式处理
  const hours = parseInt(timeStr.slice(0, 2));
  const minutes = parseInt(timeStr.slice(2, 4));
  return hours * 60 + minutes;
}

// 将分钟数转换为 HH:mm 格式
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// 将周几字符串（如 "246"）转换为位图
export function weekStrToBitmap(weekStr: string): number {
  let bitmap = 0;
  for (const char of weekStr) {
    const day = parseInt(char);
    if (day >= 1 && day <= 7) {
      // 周一是bit0，周日是bit6
      const bitIndex = day === 7 ? 6 : day - 1;
      bitmap |= (1 << bitIndex);
    }
  }
  return bitmap;
}

// 检查某一天是否在班期内
export function isDayInSchedule(bitmap: number, dayOfWeek: number): boolean {
  // dayOfWeek: 0=周日, 1=周一, ..., 6=周六
  // 转换为我们的位图格式：周一=bit0, ..., 周日=bit6
  const bitIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return (bitmap & (1 << bitIndex)) !== 0;
}

// 获取日期的星期几（0=周日, 1=周一, ..., 6=周六）
export function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr);
  return getDay(date);
}

// 格式化绝对时间为日期时间字符串
export function formatAbsoluteTime(baseDate: string, absoluteMinutes: number): {
  dateTime: string;
  plusDay: number;
} {
  const dayOffset = Math.floor(absoluteMinutes / 1440);
  const timeMinutes = absoluteMinutes % 1440;
  
  const date = addDays(new Date(baseDate), dayOffset);
  const dateStr = format(date, 'yyyy-MM-dd');
  const timeStr = minutesToTime(timeMinutes);
  
  return {
    dateTime: `${dateStr} ${timeStr}`,
    plusDay: dayOffset
  };
}

// 格式化到达时间（包含+1/+2标记）
export function formatArrivalTime(baseDate: string, absoluteMinutes: number): string {
  const { dateTime, plusDay } = formatAbsoluteTime(baseDate, absoluteMinutes);
  if (plusDay > 0) {
    return `${dateTime.split(' ')[1]} (+${plusDay})`;
  }
  return dateTime.split(' ')[1];
}

// 计算两个时间之间的分钟数差
export function calculateDuration(depMinutes: number, arrMinutes: number, overnight: boolean): number {
  if (overnight) {
    return (1440 - depMinutes) + arrMinutes;
  }
  return arrMinutes - depMinutes;
}

// 验证时间窗口
export function isInTimeWindow(minutes: number, windows: ('early' | 'late')[], version: '666' | '2666' = '666'): boolean {
  const timeWindows = {
    '666': {
      early: { start: 0, end: 480 },      // 00:00-08:00
      late: { start: 1200, end: 1439 }    // 20:00-23:59
    },
    '2666': {
      early: { start: 0, end: 540 },      // 00:00-09:00
      late: { start: 1140, end: 1439 }    // 19:00-23:59
    }
  };

  const versionWindows = timeWindows[version];

  for (const window of windows) {
    const windowRange = versionWindows[window];
    if (minutes >= windowRange.start && minutes <= windowRange.end) {
      return true;
    }
  }
  return false;
}

// 分钟数 → "HHmm" 紧凑格式（无冒号）
export function minutesToTimeCompact(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}${mins.toString().padStart(2, '0')}`;
}

// 班期位图 → "1234567" 字符串
export function bitmapToWeekStr(bitmap: number): string {
  let weekStr = '';
  for (let day = 1; day <= 7; day++) {
    const bitIndex = day === 7 ? 6 : day - 1;
    if (bitmap & (1 << bitIndex)) {
      weekStr += day.toString();
    }
  }
  return weekStr;
}

// 判断起飞分钟数是否落在 2666 版本独有时段（整 19 点钟段，或 08:01-09:00）
export function is2666Exclusive(depMinutes: number): boolean {
  const depHour = Math.floor(depMinutes / 60);
  const depMinute = depMinutes % 60;
  return depHour === 19 || (depHour === 8 && depMinute > 0) || (depHour === 9 && depMinute === 0);
}

// 按候选键名从 CSV record 取第一个非空字段，兼容历史表头差异（如 "出港城市" / "起飞城市"）
export function getCsvField(record: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}