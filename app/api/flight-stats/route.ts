import { NextResponse } from 'next/server';
import { FlightService } from '@/services/flight';

export async function GET() {
  try {
    const stats = await FlightService.getFlightStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('获取航班统计数据失败:', error);
    return NextResponse.json(
      { error: '无法获取航班统计数据' },
      { status: 500 }
    );
  }
}