import { MetadataRoute } from 'next'
import { getSiteBaseUrl } from '@/lib/runtime-config'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl()

  const result: MetadataRoute.Robots = {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/_next/', '/static/'],
    },
  }

  // 仅在配置了公开站点 URL 时输出 sitemap / host，避免 fork 部署导流上游
  if (baseUrl) {
    result.sitemap = `${baseUrl}/sitemap.xml`
    result.host = baseUrl
  }

  return result
}
