import { NextResponse } from 'next/server'
import { FlightService } from '@/services/flight'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin') || undefined
    const destination = searchParams.get('destination') || undefined
    
    const flights = await FlightService.searchFlights(origin, destination)
    
    return NextResponse.json(flights)
  } catch (error) {
    console.error('读取航班数据失败:', error)
    return NextResponse.json(
      { error: '无法读取航班数据' },
      { status: 500 }
    )
  }
}