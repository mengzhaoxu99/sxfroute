import { NextResponse } from 'next/server'
import { flightCache } from '@/services/flight-cache'

// 健康检查必须是动态路由，不能被 Next.js 静态缓存
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await flightCache.ensureFresh()
    const stats = flightCache.getStats()!

    return NextResponse.json({
      status: 'healthy',
      stats: {
        totalFlights: stats.totalFlights,
        totalCities: stats.totalCities,
        totalRoutes: stats.totalRoutes,
        lastUpdated: stats.lastUpdated,
      }
    })
  } catch (error) {
    console.error('健康检查失败:', error)
    return NextResponse.json(
      { status: 'unhealthy', error: '健康检查异常' },
      { status: 503 }
    )
  }
}
