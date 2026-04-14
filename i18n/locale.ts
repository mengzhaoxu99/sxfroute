import { Pathnames } from "next-intl/routing";

export const locales = ["en", "zh"];

export const localeNames: any = {
  en: "English",
  zh: "中文",
};

export const defaultLocale = "zh";

export const localePrefix = "as-needed";

export const localeDetection =
  process.env.NEXT_PUBLIC_LOCALE_DETECTION === "true";

export const pathnames = {
  "/": "/",
  "/privacy-policy": "/privacy-policy",
  "/terms-of-service": "/terms-of-service",
} satisfies Pathnames<typeof locales>;

// 把语义路径包装成正确的 locale 化 URL：默认 locale 不带前缀（next-intl as-needed 模式），其他 locale 带前缀
// 用于生成 canonical / sitemap 等 SEO URL，避免在多处硬编码 "en" / "zh" 字符串
export function localeUrlPath(locale: string, pathname: string = "/"): string {
  const isDefault = locale === defaultLocale;
  if (pathname === "/") {
    return isDefault ? "/" : `/${locale}`;
  }
  return isDefault ? pathname : `/${locale}${pathname}`;
}
