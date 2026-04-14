export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { flightCache } = await import('./services/flight-cache')

    console.log('服务器启动，开始初始化航班数据缓存...')
    try {
      await flightCache.initialize()
    } catch (error) {
      // 预热失败不阻塞启动；首次 API 请求会再触发 ensureFresh
      console.error('启动预热失败，将在首次请求时重试:', error)
    }
  }
}