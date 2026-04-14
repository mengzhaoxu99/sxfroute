import { localeUrlPath } from "@/i18n/locale";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const title = locale === 'zh' ? '服务条款 - 海航随心飞助手' : 'Terms of Service - HNA FlightPass Assistant';
  const description = locale === 'zh'
    ? '海航随心飞助手的服务条款，使用本服务前请仔细阅读。'
    : 'Terms of Service for HNA FlightPass Assistant. Please read carefully before using this service.';

  return {
    title,
    description,
    alternates: {
      canonical: localeUrlPath(locale, "/terms-of-service"),
    },
  };
}

export default function TermsOfServicePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const content = locale === 'zh' ? (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold mb-8">服务条款</h1>

      <p className="text-muted-foreground mb-6">最后更新：2026年4月</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. 接受条款</h2>
      <p className="mb-4">
        访问或使用本服务即表示你同意遵守本条款。如果不同意，请勿使用本服务。
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. 服务描述</h2>
      <p className="mb-4">
        海航随心飞助手是一个开源的航班信息查询与可视化工具，针对&ldquo;海航随心飞&rdquo;使用场景做了交互优化。本服务的代码与所附数据均为历史性整理结果，仅供学习交流与个人参考。
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. 与第三方的关系</h2>
      <p className="mb-4">
        本服务为独立第三方个人开发者作品，<strong>与海南航空股份有限公司、海航集团及其关联公司无任何隶属、合作、授权或背书关系</strong>。&ldquo;海航&rdquo;&ldquo;随心飞&rdquo;等相关名称为其各自合法持有人的商标或品牌，本服务仅为描述使用场景而引用。
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. 许可与知识产权</h2>
      <p className="mb-4">
        本仓库的不同部分采用不同的许可方式，请分别查阅：
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>
          <strong>源代码</strong>：以 <strong>MIT 协议</strong> 发布，以仓库根目录的 <code>LICENSE</code> 文件为准。你可以在遵守 MIT 协议的前提下自由使用、复制、修改、分发和再授权
        </li>
        <li>
          <strong>航班数据</strong>：详见仓库中的 <code>DATA.md</code>。航班数据为作者整理自海航官方公开发布的航班计划的历史快照，作者对数据集本身不附加任何版权主张，但同时也不对其准确性、完整性、时效性作任何保证
        </li>
        <li>
          <strong>第三方品牌与商标</strong>：所有提及的航空公司名称、产品名、商标均归各自合法持有人所有，本服务的引用不构成任何主张
        </li>
        <li>
          <strong>第三方组件</strong>：本服务所依赖的开源库（Next.js、shadcn/ui、Radix UI、TanStack Table、next-intl 等）遵循其各自的开源协议，详见 <code>package.json</code>
        </li>
        <li>
          <strong>第三方素材</strong>：站内引用的高德地图 SDK 等第三方服务遵循其各自的服务条款
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. 使用规则</h2>
      <p className="mb-4">使用本服务时应遵守以下原则：</p>
      <ul className="list-disc pl-6 mb-4">
        <li>不得将本服务用于任何非法或未经授权的目的</li>
        <li>不得干扰或破坏本服务的正常运行</li>
        <li>不得使用自动化手段大规模抓取本服务的数据</li>
        <li>在任何衍生作品中均应保留同等或更显著的免责声明，不得删除或淡化&ldquo;非官方、非实时、不保证准确&rdquo;的提示</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">6. 免责声明</h2>
      <p className="mb-4">
        本服务按&ldquo;现状（AS IS）&rdquo;提供，不作任何明示或暗示的保证，包括但不限于适销性、特定用途适用性、准确性、完整性、可靠性。航班信息仅供参考，实际班期与价格请以航空公司官方渠道为准。
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">7. 责任限制</h2>
      <p className="mb-4">
        在适用法律允许的最大范围内，作者及任何贡献者均不对因使用、无法使用、或依赖本服务而产生的任何直接、间接、附带、特殊、惩罚性或后果性损失负责，包括但不限于因航班信息错误导致的出行损失或商业损失。
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">8. 条款变更</h2>
      <p className="mb-4">
        我们保留随时修改本条款的权利。修改后的条款一经发布即生效。继续使用本服务即视为接受修改后的条款。
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">9. 联系方式</h2>
      <p className="mb-4">
        如有任何疑问，请通过电子邮件联系：support@sxfroute.com
      </p>
    </div>
  ) : (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <p className="text-muted-foreground mb-6">Last updated: April 2026</p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By accessing or using this service, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
      <p className="mb-4">
        HNA FlightPass Assistant is an open-source flight information lookup and visualization tool, with its UX optimized for the &ldquo;HNA FlightPass&rdquo; use case. Both the code and bundled data are historical compilations, intended only for learning and personal reference.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Relationship with Third Parties</h2>
      <p className="mb-4">
        This service is an independent third-party project by an individual developer. <strong>It is NOT affiliated with, endorsed by, sponsored by, or in any way officially connected to Hainan Airlines Holding Co., Ltd., HNA Group, or any of their subsidiaries.</strong> Names such as &ldquo;HNA&rdquo; and &ldquo;FlightPass&rdquo; are trademarks or brands of their respective lawful holders, referenced here only to describe the use case.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. License & Intellectual Property</h2>
      <p className="mb-4">
        Different parts of this repository are licensed differently. Please refer to each accordingly:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>
          <strong>Source code</strong>: released under the <strong>MIT License</strong>. The root <code>LICENSE</code> file is authoritative. You are free to use, copy, modify, distribute and sublicense it under MIT terms
        </li>
        <li>
          <strong>Flight data</strong>: see <code>DATA.md</code> in the repository. The flight dataset is a historical snapshot manually compiled from public sources. The author asserts no copyright claim on the dataset itself, and likewise makes NO warranty as to its accuracy, completeness, or timeliness
        </li>
        <li>
          <strong>Third-party brands and trademarks</strong>: airline names, product names, and trademarks mentioned belong to their respective lawful holders. References here do not constitute any claim
        </li>
        <li>
          <strong>Third-party components</strong>: open-source libraries used (Next.js, shadcn/ui, Radix UI, TanStack Table, next-intl, etc.) are governed by their respective licenses — see <code>package.json</code>
        </li>
        <li>
          <strong>Third-party services</strong>: integrations such as the Amap SDK are governed by their own terms of service
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Rules of Use</h2>
      <p className="mb-4">When using the service, you must comply with the following:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Do not use the service for any illegal or unauthorized purposes</li>
        <li>Do not interfere with or disrupt the normal operation of the service</li>
        <li>Do not use automated means to scrape data at scale</li>
        <li>In any derivative work, retain equivalent or more prominent disclaimers; do not remove or weaken the &ldquo;not official, not real-time, no accuracy guarantee&rdquo; notice</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">6. Disclaimer</h2>
      <p className="mb-4">
        The service is provided &ldquo;AS IS&rdquo; without any express or implied warranties, including but not limited to merchantability, fitness for a particular purpose, accuracy, completeness, or reliability. Flight information is for reference only — please refer to official airline channels for actual schedules and prices.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
      <p className="mb-4">
        To the maximum extent permitted by applicable law, the author and any contributors shall not be liable for any direct, indirect, incidental, special, punitive, or consequential damages arising from the use of, inability to use, or reliance on this service, including but not limited to travel or commercial losses caused by inaccurate flight information.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">8. Modifications to Terms</h2>
      <p className="mb-4">
        We reserve the right to modify these terms at any time. Modified terms take effect immediately upon posting. Continued use of the service constitutes acceptance of the modified terms.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact</h2>
      <p className="mb-4">
        For any questions, please contact: support@sxfroute.com
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
