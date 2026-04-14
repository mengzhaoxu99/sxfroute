# 贡献指南 / Contributing

感谢你对海航随心飞助手的兴趣！

> **⚠️ 这是一个个人业余维护的项目。** 作者 best-effort 响应，无响应时限承诺。请在提交之前阅读完整本指南。

## 我们接受什么

✅ **欢迎：**
- Bug 修复 PR（含复现步骤）
- 文档 typo 修正
- 依赖安全更新
- 代码可读性 / 性能微优化（不改变功能行为）
- 中英文案校对

⚠️ **需要先开 Issue 讨论：**
- 新功能实现
- 架构调整
- UI 重设计
- 新增依赖

❌ **不接受：**
- 航班数据更新 PR —— 本项目数据为历史快照，明确不维护，详见 [DATA.md](./DATA.md)
- 改变项目定位 / LICENSE 的 PR
- 模板化的 "Fix typo"（一次修多个才有意义）

## 提交 Bug Report

通过 GitHub Issues 提交，**必须使用 Bug Report 模板**（点击 "New Issue" 会自动加载）。

好的 Bug Report 包含：
- 复现步骤（逐条编号）
- 期望行为 vs 实际行为
- 环境信息：Node 版本、浏览器、操作系统、是否配置了高德 key
- 截图 / 错误日志

## 提交 Pull Request

### 前置检查

1. Fork 仓库并从 `main` 创建新分支：`git checkout -b fix/your-bug-name`
2. 本地跑通两道 gate：
   ```bash
   pnpm lint
   pnpm build
   ```
3. 两者都通过才能提交 PR

### Commit Message 规范

使用 **Conventional Commits**：

| 前缀 | 用途 |
|---|---|
| `feat:` | 新功能 |
| `fix:` | bug 修复 |
| `docs:` | 文档 |
| `refactor:` | 重构（不改变功能） |
| `chore:` | 构建 / 依赖 / 配置 |
| `style:` | 代码格式 / 注释 |

示例：
- `fix: correct red-eye flight filter boundary time`
- `docs: update Amap key application steps`

### PR 描述要求

- 用**中文或英文**填写（项目双语）
- 描述动机和解决的问题
- 如果关联 Issue，在描述中写 `Closes #123`
- 勾选 PR 模板里的 checklist

## 开发环境

见 [README.md](./README.md) 的"快速开始"章节。本项目使用：
- Node.js 18+（推荐 20 LTS）
- pnpm 8+
- TypeScript 严格模式

## 行为准则 / Code of Conduct

本项目遵循 [Contributor Covenant v2.1](./CODE_OF_CONDUCT.md)。参与本项目即表示你同意遵守其中的条款。辱骂 / 歧视 / 骚扰行为会被直接封禁。

This project adheres to the [Contributor Covenant v2.1](./CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.

---

# Contributing (English)

Thank you for your interest! **This is a hobby project maintained on a best-effort basis.**

**PRs welcomed:** bug fixes (with reproduction), typos, dependency security updates, small refactors.

**Discuss first via Issue:** new features, architecture changes, new dependencies, UI redesigns.

**Not accepted:** flight data updates (data is a frozen historical snapshot — see [DATA.md](./DATA.md)), changes to project positioning / license.

**Before submitting a PR:**
1. Fork, branch from `main`
2. Run `pnpm lint && pnpm build` — both must pass
3. Use Conventional Commits (`fix:`, `docs:`, `chore:`, etc.)
4. Fill in the PR template checklist
