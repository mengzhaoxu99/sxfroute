# sxfroute

> Chinese domestic flight data query and route-planning tool. Optimized for the "Hainan Airlines SXF" travel pass use case.

🇨🇳 **[中文主文档](./README.md)**

![Route search UI](./docs/screenshots/screenshot-search.png)

![Flight data browser](./docs/screenshots/screenshot-data-table.png)

---

## ⚠️ Disclaimer

This is an **independent third-party community project**. It is **NOT affiliated with, endorsed by, sponsored by, or in any way officially connected to Hainan Airlines Holding Co., Ltd. or HNA Group**. All trademark names referenced ("Hainan Airlines", "Suixinfei", etc.) remain the property of their respective owners and are used only to describe the use case.

Flight data bundled with this project is a **historical snapshot** manually compiled from publicly available Hainan Airlines flight schedules. It is **not real-time, not official, and not guaranteed to be accurate**. **Do not** use this data for any booking, travel, or business decisions. The author assumes no liability for any consequences arising from the use of this project. See [DATA.md](./DATA.md) for the full data notice, schema and license breakdown.

---

- 🔗 **Live demo**: https://sxfroute.com
- 📦 **Docker image**: `ghcr.io/yixinmeng/sxfroute:latest`

## Features

- Single-leg and round-trip flight search with overnight / red-eye filters
- Route visualization on Amap (高德地图) JS API
- Full flight-data snapshot table with filtering and sorting
- Per-airport / per-city statistics
- Chinese / English UI via `next-intl`

## Quickstart (Docker)

> 📦 The image is published for both **linux/amd64** (Intel/AMD) and **linux/arm64** (Apple Silicon, Raspberry Pi 5, AWS Graviton). Docker will pull the right variant automatically.

### Path A: docker-compose (recommended)

Best for most people. Auto-pulls the image from GHCR, mounts the flight-data volume, and wires health checks.

```bash
# 1. Clone the repo (contains docker-compose.yml, .env.example, and the default data/airport.csv)
git clone https://github.com/yixinmeng/sxfroute.git
cd sxfroute

# 2. Configure env vars (Amap key recommended; map degrades gracefully if missing)
cp .env.example .env
# Edit .env and fill in your own Amap key (see main README for how to get one)

# 3. Start (first run pulls the image from GHCR, takes a few seconds)
docker compose up -d
```

Visit <http://localhost:3000>.

> 💡 Editing `data/airport.csv` takes effect on the next request — **no container restart needed** (mtime-based hot reload, see [DATA.md](./DATA.md)).

Stop with `docker compose down`.

### Path B: plain docker run (no clone needed)

Best for a quick try or a one-shot deploy on a VPS. The image ships with default flight data baked in — no volume mount required.

```bash
docker run -d \
  --name sxfroute \
  -p 3000:3000 \
  -e NEXT_PUBLIC_AMAP_KEY=your-amap-key \
  -e NEXT_PUBLIC_AMAP_SECURITY_CODE=your-amap-jscode \
  --restart unless-stopped \
  ghcr.io/yixinmeng/sxfroute:latest
```

Visit <http://localhost:3000>. Drop the two `-e` lines if you don't want to configure Amap.

## Quickstart (Local Dev)

```bash
git clone https://github.com/yixinmeng/sxfroute.git
cd sxfroute
pnpm install
cp .env.example .env.local
# Fill in your own Amap API key
pnpm dev
```

## Environment Variables

**All variables are optional — the app boots fine without any of them.** Configuring the two Amap variables is recommended so the map and city autocomplete work.

| Variable | Recommended? | Description | Effect when unset |
|---|:---:|---|---|
| `NEXT_PUBLIC_AMAP_KEY` | ✅ recommended | Amap JS API key | Map view and city autocomplete degrade gracefully; data table / filters / stats still work |
| `NEXT_PUBLIC_AMAP_SECURITY_CODE` | ✅ recommended | Amap JS API security code | Same as above |
| `NEXT_PUBLIC_WEB_URL` | ❌ optional | Public site URL (SEO only) | Empty sitemap, relative canonical URLs, no JSON-LD output. Set this only if you're deploying as a **public-facing site** |

> **Why do I need an Amap key?** Amap (高德地图) is the only Chinese-market map provider supported. It requires a free personal account at https://console.amap.com/ and takes ~3 minutes. See the Chinese README for detailed instructions.

## Customizing Flight Data (Hot Reload)

Flight data lives in `data/airport.csv` — the single source of truth at runtime. You can edit it with any text editor or Excel, and **no image rebuild or container restart is required**: the next API request picks up the new file via mtime-based cache invalidation.

- **Docker Compose**: `docker-compose.yml` already bind-mounts the host `./data` directory read-only into `/app/data`. Edit `data/airport.csv` on the host and refresh the page.
- **docker run**: add `-v $(pwd)/data:/app/data:ro` to use your own dataset; without it, the image ships with a default dataset baked in.
- **Local dev**: just edit `data/airport.csv` under `pnpm dev` — same hot reload applies.

Schema and parsing rules: see [DATA.md](./DATA.md).

## Tech Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · next-intl · TanStack Table · Amap JS API · Docker

## Maintenance Status

This is a **hobby project** maintained on a best-effort basis. The author welcomes bug-fix PRs; feature requests should be opened as Issues for discussion first. Flight data updates are **not accepted** — the bundled data is a historical snapshot. See [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License

[MIT License](./LICENSE) · Copyright © 2026 [yixinmeng](https://github.com/yixinmeng)
