# sxfroute

> Chinese domestic flight data query and route-planning tool. Optimized for the "Hainan Airlines SXF" travel pass use case.

🇨🇳 **[中文主文档](./README.md)**

---

## ⚠️ Disclaimer

This is an **independent third-party community project**. It is **NOT affiliated with, endorsed by, sponsored by, or in any way officially connected to Hainan Airlines Holding Co., Ltd. or HNA Group**. All trademark names referenced ("Hainan Airlines", "Suixinfei", etc.) remain the property of their respective owners and are used only to describe the use case.

Flight data bundled with this project is a **historical snapshot** manually compiled from publicly available Hainan Airlines flight schedules. It is **not real-time, not official, and not guaranteed to be accurate**. **Do not** use this data for any booking, travel, or business decisions. The author assumes no liability for any consequences arising from the use of this project. See [DATA.md](./DATA.md) for the full data notice, schema and license breakdown.

---

- 🔗 **Live demo**: https://sxfroute.com
- 📦 **Docker image**: `ghcr.io/mengzhaoxu99/sxfroute:latest`

## Features

- Single-leg and round-trip flight search with overnight / red-eye filters
- Route visualization on Amap (高德地图) JS API
- Full flight-data snapshot table with filtering and sorting
- Per-airport / per-city statistics
- Chinese / English UI via `next-intl`

## Quickstart (Docker)

```bash
docker pull ghcr.io/mengzhaoxu99/sxfroute:latest
cp .env.example .env
# Fill in your own Amap API key (free, see main README)

# Option A: docker-compose (recommended)
docker-compose up -d

# Option B: direct docker run
docker run -d \
  --name sxfroute \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  ghcr.io/mengzhaoxu99/sxfroute:latest
```

Visit http://localhost:3000 .

## Quickstart (Local Dev)

```bash
git clone https://github.com/mengzhaoxu99/sxfroute.git
cd sxfroute
pnpm install
cp .env.example .env.local
# Fill in your own Amap API key
pnpm dev
```

## Environment Variables

| Variable | Description | Required |
|---|---|:---:|
| `NEXT_PUBLIC_WEB_URL` | Public site URL | ✅ |
| `NEXT_PUBLIC_APP_URL` | Internal app URL | ✅ |
| `NEXT_PUBLIC_AMAP_KEY` | Amap JS API key | ✅ |
| `NEXT_PUBLIC_AMAP_SECURITY_CODE` | Amap JS API security code | ✅ |

> **Why do I need an Amap key?** Amap (高德地图) is the only Chinese-market map provider supported. It requires a free personal account at https://console.amap.com/ and takes ~3 minutes. See the Chinese README for detailed instructions.

> **Without an Amap key**: map views and city autocomplete degrade gracefully. The data table, filters and statistics still work.

## Tech Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · next-intl · TanStack Table · Amap JS API · Docker

## Maintenance Status

This is a **hobby project** maintained on a best-effort basis. The author welcomes bug-fix PRs; feature requests should be opened as Issues for discussion first. Flight data updates are **not accepted** — the bundled data is a historical snapshot. See [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License

[MIT License](./LICENSE) · Copyright © 2026 [mengzhaoxu99](https://github.com/mengzhaoxu99)
