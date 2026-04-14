# Security Policy / 安全政策

## 支持版本 / Supported Versions

本项目为个人业余维护项目，仅 `main` 分支持续接收安全更新。历史版本不维护。

This is a hobby project. Only the `main` branch receives security updates. Older tags are **not** maintained.

## 上报漏洞 / Reporting a Vulnerability

⚠️ **请不要在公开 GitHub Issue 中披露安全漏洞。**

⚠️ **Please do NOT open public GitHub Issues for security vulnerabilities.**

### 上报流程 / How to Report

1. **邮件**发送到：`support@sxfroute.com`
2. 邮件标题以 `[SECURITY]` 开头
3. 正文请包含：
   - 漏洞类型（XSS / 密钥泄露 / 依赖 CVE / 等）
   - 复现步骤
   - 影响评估
   - 如有 PoC 请一并附上
4. 如果涉及第三方依赖，建议直接向上游项目上报

### 响应时限 / Response Time

- 这是个人业余项目，**不承诺 SLA**
- 作者尽量在 7 天内初步回复
- 严重漏洞会优先处理
- 不重要 / 理论性问题可能被标记为 "wontfix"

### 披露策略 / Disclosure Policy

- 请给作者合理的修复时间后再公开披露
- 修复发布后会在 GitHub Release Notes 中致谢上报者（如不希望致谢请在邮件中说明）
- 本项目不提供 Bug Bounty

## 已知的非问题 / Known Non-Issues

以下情况**不构成**安全漏洞：

- `NEXT_PUBLIC_AMAP_KEY` 出现在前端代码中：这是高德 JS API 的设计要求，安全性通过**域名白名单**保证，而非密钥保密
- 航班数据不准确 / 过期：这是设计决定，见 [DATA.md](./DATA.md)
- 缺失 CSP / HSTS 等安全头：本项目是纯静态前端 + Next.js SSR，部署方自行加固
