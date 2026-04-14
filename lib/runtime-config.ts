/**
 * Runtime config — let the server inject environment variables at request time,
 * so a single Docker image works across environments without rebuilding.
 *
 * Server components / API routes: import and call getRuntimeConfig() directly.
 * Client components: use the <RuntimeConfigProvider> + useRuntimeConfig() hook.
 */

/** Only the variables that client-side code actually needs */
export interface RuntimeConfig {
  amapKey: string
  amapSecurityCode: string
  defaultTheme: string
}

/** Server-side helper — reads process.env at call time (not build time) */
export function getRuntimeConfig(): RuntimeConfig {
  return {
    amapKey: process.env.NEXT_PUBLIC_AMAP_KEY ?? "",
    amapSecurityCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE ?? "",
    defaultTheme: process.env.NEXT_PUBLIC_DEFAULT_THEME || "light",
  }
}

/**
 * 公开站点 URL：未配置时返回 null。
 * SEO 元数据（canonical / sitemap / JSON-LD）应在 null 时降级，避免 fork 部署的实例
 * 把权威 URL 指向上游域名，反过来把搜索流量导走。
 *
 * 模块级 memoize：env 在 standalone 启动后不变，不需要每次请求都 trim。
 * 用 undefined 区分"未初始化"和"已确认是 null"。
 */
let cachedBaseUrl: string | null | undefined
let cachedMetadataBase: URL | null | undefined

export function getSiteBaseUrl(): string | null {
  if (cachedBaseUrl !== undefined) return cachedBaseUrl
  const url = process.env.NEXT_PUBLIC_WEB_URL?.trim()
  cachedBaseUrl = url && url.length > 0 ? url : null
  return cachedBaseUrl
}

/** 给 Next.js metadata API 用的 URL 实例，缓存避免每请求重新解析 */
export function getSiteMetadataBase(): URL | null {
  if (cachedMetadataBase !== undefined) return cachedMetadataBase
  const baseUrl = getSiteBaseUrl()
  cachedMetadataBase = baseUrl ? new URL(baseUrl) : null
  return cachedMetadataBase
}
