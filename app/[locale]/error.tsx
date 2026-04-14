'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 检测是否是 ChunkLoadError
    if (error.message && error.message.includes('ChunkLoadError')) {
      // 清除缓存并重新加载
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name)
          })
        })
      }
    }
    console.error(error)
  }, [error])

  const handleReset = () => {
    // 如果是 ChunkLoadError，强制刷新页面
    if (error.message && error.message.includes('ChunkLoadError')) {
      window.location.reload()
    } else {
      reset()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold">出错了</h2>
        <p className="mb-4 text-muted-foreground">
          {error.message && error.message.includes('ChunkLoadError')
            ? '页面资源加载失败，这可能是由于网络问题或缓存导致的。'
            : '抱歉，页面加载时出现了错误。'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleReset}>
            {error.message && error.message.includes('ChunkLoadError')
              ? '刷新页面'
              : '重试'}
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            返回首页
          </Button>
        </div>
      </div>
    </div>
  )
}