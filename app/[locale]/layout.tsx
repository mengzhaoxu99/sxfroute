import "@/app/globals.css";

import { getMessages, getTranslations } from "next-intl/server";

import { Inter as FontSans } from "next/font/google";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/providers/theme";
import { RuntimeConfigProvider } from "@/providers/runtime-config";
import { getRuntimeConfig, getSiteBaseUrl, getSiteMetadataBase } from "@/lib/runtime-config";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations();
  const baseUrl = getSiteBaseUrl();

  return {
    title: {
      template: `%s | ${t("metadata.title")}`,
      default: t("metadata.title") || "",
    },
    description: t("metadata.description") || "",
    keywords: t("metadata.keywords") || "",
    authors: [{ name: '海航随心飞助手团队' }],
    creator: '海航随心飞助手',
    publisher: '海航随心飞助手',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: getSiteMetadataBase(),
    alternates: {
      // canonical 不在 layout 设默认，由每个 page 的 generateMetadata 用 localeUrlPath 单独生成，
      // 否则未设 canonical 的页面会继承 '/' 让所有路由都指向首页
      languages: {
        'zh': '/',
        'en': '/en',
      },
    },
    openGraph: {
      title: t("metadata.title") || "",
      description: t("metadata.description") || "",
      ...(baseUrl ? { url: baseUrl } : {}),
      siteName: '海航随心飞助手',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: '海航随心飞助手 - 海航随心飞航线查询工具',
        },
      ],
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t("metadata.title") || "",
      description: t("metadata.description") || "",
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();
  const runtimeConfig = getRuntimeConfig();
  const baseUrl = getSiteBaseUrl();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {baseUrl && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "海航随心飞助手",
                "alternateName": "HNA FlightPass Assistant",
                "url": baseUrl,
                "logo": `${baseUrl}/logo.png`,
                "description": "开源的海航随心飞航线查询工具，智能搜索夜航和凌晨航班。航班数据为历史快照，独立第三方项目。",
                "applicationCategory": "TravelApplication",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "CNY"
                },
                "author": {
                  "@type": "Organization",
                  "name": "海航随心飞助手团队",
                  "url": baseUrl
                }
              })
            }}
          />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 处理 chunk 加载错误
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('Loading chunk')) {
                  // 清除缓存并重新加载
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      names.forEach(function(name) {
                        caches.delete(name);
                      });
                    });
                  }
                  // 延迟重新加载，避免无限循环
                  setTimeout(function() {
                    window.location.reload();
                  }, 1000);
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-[100dvh] bg-background font-sans antialiased overflow-x-hidden",
          fontSans.variable
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <NextIntlClientProvider messages={messages}>
          <RuntimeConfigProvider initial={runtimeConfig}>
            <ThemeProvider attribute="class" disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </RuntimeConfigProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
