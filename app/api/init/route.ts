import { NextResponse } from 'next/server'
import { flightCache } from '@/services/flight-cache'

// 健康检查必须是动态路由，不能被 Next.js 静态缓存
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 缓存未就绪时尝试懒初始化（兼容 standalone 模式下模块实例隔离）
    if (!flightCache.getStats()) {
      await flightCache.initialize()
    }

    const stats = flightCache.getStats()

    if (!stats) {
      return NextResponse.json(
        { status: 'unhealthy', message: '缓存初始化失败' },
        { status: 503 }
      )
    }

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
