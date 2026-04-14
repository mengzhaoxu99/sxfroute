import { MetadataRoute } from 'next'
import { getSiteBaseUrl } from '@/lib/runtime-config'
import { locales, localeUrlPath } from '@/i18n/locale'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl()
  // sitemap.xml 协议要求绝对 URL：未配置公开站点时返回空 sitemap，
  // 避免 fork 部署的实例把所有 URL 指向上游域名
  if (!baseUrl) return []

  const lastModified = new Date()

  // 默认 locale 不带前缀；其他 locale 带前缀。用 localeUrlPath 保持和 canonical 一致
  const pages: { path: string; changeFrequency: 'daily' | 'monthly'; priority: number }[] = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/privacy-policy', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/terms-of-service', changeFrequency: 'monthly', priority: 0.3 },
  ]

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}${localeUrlPath(locale, page.path)}`,
      lastModified,
      changeFrequency: page.changeFrequency as 'daily' | 'monthly',
      priority: page.priority,
    }))
  )
}
