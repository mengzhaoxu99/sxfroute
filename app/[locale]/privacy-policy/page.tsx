import { localeUrlPath } from "@/i18n/locale";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const title = locale === 'zh' ? '隐私政策 - 海航随心飞助手' : 'Privacy Policy - HNA FlightPass Assistant';
  const description = locale === 'zh'
    ? '海航随心飞助手的隐私政策，说明本站如何处理访问数据、第三方服务及搜索请求。'
    : 'Privacy Policy for HNA FlightPass Assistant. How visit data, third-party services and search requests are handled.';

  return {
    title,
    description,
    alternates: {
      canonical: localeUrlPath(locale, "/privacy-policy"),
    },
  };
}

export default function PrivacyPolicyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const content = locale === 'zh' ? (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold mb-8">隐私政策</h1>

      <p className="text-muted-foreground mb-6">最后更新：2026年4月</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">概述</h2>
      <p className="mb-4">
        海航随心飞助手（以下简称&ldquo;本服务&rdquo;）是一个开源的航班信息查询工具。本页面说明本服务运行过程中会处理哪些数据、由谁处理，以及你作为访问者的权利。本政策仅适用于由作者运营的官方部署
        <code> sxfroute.com</code>；任何由第三方 fork 或自部署的版本，其隐私实践由各自运营者决定。
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">我们会处理的信息</h2>
      <h3 className="text-xl font-semibold mt-6 mb-3">1. 自动收集</h3>
      <ul className="list-disc pl-6 mb-4">
        <li>访问日志中的常规字段：IP 地址、User-Agent、Referer、访问时间、被访问的 URL，用于排错和异常监控</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">2. 你主动提交的信息</h3>
      <ul className="list-disc pl-6 mb-4">
        <li>
          <strong>航班搜索请求</strong>：当你在搜索框输入起降城市/日期并提交时，前端会向
          <code> /api/search </code>
          发送 POST 请求。请求体只包含搜索参数（出发城市、到达城市、日期、行程类型等），不包含个人身份信息
        </li>
        <li>服务端处理这些参数后立即返回结果，<strong>不会持久化到任何数据库</strong></li>
        <li>服务端会在标准应用日志中记录搜索参数和异常信息以便排错，日志保留时间不超过 30 天</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">第三方服务</h2>
      <p className="mb-4">本服务直接或间接接入以下第三方：</p>
      <ul className="list-disc pl-6 mb-4">
        <li>
          <strong>高德地图 JS API</strong>（地图渲染）— 浏览器会加载高德前端 SDK 用于绘制航线地图，高德可能根据其自身政策收集设备/网络信息。详见
          <a href="https://lbs.amap.com/pages/privacy/" target="_blank" rel="noopener noreferrer" className="underline"> 高德开放平台隐私政策</a>
        </li>
        <li>
          <strong>托管/CDN 服务商</strong>：本站托管平台会保留访问日志（IP/UA 等），具体保留策略以平台官方政策为准
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Cookie 与本地存储</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>语言偏好、主题等设置以 cookie / localStorage 存储在你的浏览器中，仅用于个性化界面</li>
        <li>高德地图 SDK 可能写入用于缓存的 cookie / localStorage</li>
        <li>你可以在浏览器隐私设置中清除或屏蔽这些 cookie，但可能影响部分功能</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">不收集的信息</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>本服务不要求注册账号，不收集姓名 / 电话 / 邮箱 / 身份证号等任何个人身份信息</li>
        <li>本服务不出售、不转让、不向任何第三方共享你的个人数据，仅在上述第三方服务自身的运行范围内传输必要数据</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">未成年人</h2>
      <p className="mb-4">
        本服务面向一般公众，不专门针对未成年人。如果你是未成年人，请在监护人指导下使用。
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">本政策的变更</h2>
      <p className="mb-4">
        本政策的任何变更都会发布在本页面，重大变更会同步更新顶部的&ldquo;最后更新&rdquo;日期。继续使用本服务即视为接受变更后的政策。
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">联系我们</h2>
      <p className="mb-4">
        如对本政策有任何疑问，请通过电子邮件联系：support@sxfroute.com
      </p>
    </div>
  ) : (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <p className="text-muted-foreground mb-6">Last updated: April 2026</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Overview</h2>
      <p className="mb-4">
        HNA FlightPass Assistant (&ldquo;the Service&rdquo;) is an open-source flight information lookup tool. This page explains what data the Service processes, who processes it, and your rights as a visitor. This policy only applies to the official deployment <code>sxfroute.com</code> operated by the author. Any third-party fork or self-hosted instance is governed by its own operator&rsquo;s privacy practices.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Process</h2>
      <h3 className="text-xl font-semibold mt-6 mb-3">1. Automatically collected</h3>
      <ul className="list-disc pl-6 mb-4">
        <li>Standard access log fields: IP address, User-Agent, Referer, timestamp, requested URL — used for debugging and abuse monitoring</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-3">2. Information you actively submit</h3>
      <ul className="list-disc pl-6 mb-4">
        <li>
          <strong>Flight search requests</strong>: when you submit a search, the frontend sends a POST request to <code>/api/search</code>. The request body contains only search parameters (origin city, destination city, date, trip type, etc.) and no personal identification information
        </li>
        <li>The server processes these parameters and returns the result immediately. <strong>Search requests are never persisted to any database.</strong></li>
        <li>Search parameters and errors are written to standard application logs for debugging. Logs are retained for no longer than 30 days</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Services</h2>
      <p className="mb-4">The Service integrates with the following third parties:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>
          <strong>Amap (Gaode) JS API</strong> (map rendering) — your browser loads the Amap frontend SDK to render route maps. Amap may collect device/network information per its own policy. See the
          <a href="https://lbs.amap.com/pages/privacy/" target="_blank" rel="noopener noreferrer" className="underline"> Amap Open Platform Privacy Policy</a>
        </li>
        <li>
          <strong>Hosting / CDN provider</strong>: the platform hosting this site retains access logs (IP/UA, etc.) per its own retention policy
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies & Local Storage</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Language preference, theme, and similar UI settings are stored in cookies / localStorage in your browser</li>
        <li>The Amap SDK may set cookies / localStorage for map cache</li>
        <li>You can clear or block these cookies in your browser settings, but some functionality may be affected</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">What We Do NOT Collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>The Service does not require account registration. We do not collect your name, phone number, email, ID number or any other personal identification information</li>
        <li>We do not sell, transfer, or share your personal data with any third party beyond what is necessary for the third-party services listed above to function</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Minors</h2>
      <p className="mb-4">
        The Service is intended for the general public and is not specifically directed at minors. Minors should use the Service under the guidance of a guardian.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
      <p className="mb-4">
        Any changes to this policy will be posted on this page. Material changes will be reflected in the &ldquo;Last updated&rdquo; date at the top. Continued use of the Service constitutes acceptance of the updated policy.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
      <p className="mb-4">
        For any privacy-related questions, please contact: support@sxfroute.com
      </p>
    </div>
  );

  return (
    <section className="py-16">
      <div className="container max-w-4xl">
        {content}
      </div>
    </section>
  );
}
