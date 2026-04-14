export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { flightCache } = await import('./services/flight-cache')
    
    // 在服务器启动时初始化缓存
    console.log('服务器启动，开始初始化航班数据缓存...')
    await flightCache.initialize()
  }
}