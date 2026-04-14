export function Disclaimer() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-2xl">⚠️</div>
        <h3 className="text-lg font-semibold text-amber-900">免责声明</h3>
      </div>
      <div className="space-y-3 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <span className="text-amber-600">1.</span>
          <span>本工具与海南航空无商业从属关系，实际兑换与乘机请以海航官方规则与系统结果为准。</span>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-amber-600">2.</span>
          <span>本服务永久免费，无需登录即可使用。请勿相信任何收费或索要个人信息的行为。</span>
        </div>
      </div>
    </div>
  )
}