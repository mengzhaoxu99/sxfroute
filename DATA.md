# 航班数据说明 / Data Notes

## ⚠️ 重要声明 / Important Notice

本项目中的航班数据为**历史快照**，由作者整理自海航官方公开发布的航班计划：

- **非实时**：数据不会随航司实际班期变化而自动更新
- **非官方**：本项目与海南航空股份有限公司、海航集团及其关联公司无任何隶属、合作、授权或背书关系
- **不保证准确性**：可能存在错漏、延迟、过期
- **仅供参考**：严禁用于任何真实出行 / 商业决策

**如需准确的航班信息，请查询海航官方 App 或官方订票系统。**

The flight data bundled with this project is a **manually-compiled historical snapshot** from publicly available Hainan Airlines flight schedules. It is **not real-time, not official, and not guaranteed to be accurate**. **Do not use it for any booking or travel decision.** This project is **not affiliated with, endorsed by, sponsored by, or in any way officially connected to** Hainan Airlines Holding Co., Ltd. or HNA Group.

## 维护策略 / Maintenance Policy

**本项目不接受航班数据更新 PR。**

**Flight data update PRs are NOT accepted.**

原因 / Reasons:

1. 数据更新需要持续的人工校对，超出个人业余维护范围
2. 接受众包数据更新会引入准确性和责任边界问题
3. 本项目定位是**航班数据可视化与路线规划工具的技术 demo**，而非实时航班信息服务

如果你需要最新数据，建议 fork 项目后自行维护，或使用商业航班 API。

## 数据文件位置 / Data Files

| 文件 | 用途 |
|---|---|
| `data/airport.csv` | 完整航班计划历史快照 CSV（班次、时刻、班期规则、机场信息）**— 运行时可热更新，修改后下一次请求自动生效** |
| `lib/flight/airport-coordinates.ts` | 机场经纬度（基础地理数据） |
| `lib/flight/airport-city-map.ts` | 机场 ↔ 城市映射 |

## 自定义航班数据 / Customizing Flight Data

`data/airport.csv` 是项目运行时唯一的航班数据源，采用简单的 CSV 格式，你可以用任何文本编辑器或 Excel 打开并编辑。

**Docker Compose 方式**：仓库已在 `docker-compose.yml` 中把宿主机 `./data` 目录以 `:ro` 只读模式挂载到容器内 `/app/data`。修改宿主机的 `data/airport.csv` 后，**无需重建镜像、无需重启容器**，下一次 API 请求会基于文件 mtime 自动触发重新加载。

**直接 docker run 方式**：用 `-v $(pwd)/data:/app/data:ro` 挂载你自己的数据目录；若不挂载，则使用镜像内随发布一同打包的默认数据。

**本地开发**：`pnpm dev` 下直接编辑 `data/airport.csv` 即可，同样基于 mtime 自动热更新。

字段格式参见下一节。

## 航班数据字段说明 / Flight Data Schema

`data/airport.csv` 使用 UTF-8 编码（可带可不带 BOM），表头为简体中文。解析后对应 `lib/flight/types.ts` 中的 `Flight` 接口，主要字段：

| 字段 | 类型 | 含义 |
|---|---|---|
| `carrier_name` | string | 航司名称 |
| `flight_no` | string | 航班号（如 `HU7801`） |
| `origin_city` | string | 出发城市 |
| `origin_airport` | string | 出发机场名称 |
| `origin_iata_code` | string | 出发机场 IATA 三字码 |
| `origin_province` | string | 出发地所属省市 |
| `dest_city` | string | 到达城市 |
| `dest_airport` | string | 到达机场名称 |
| `dest_iata_code` | string | 到达机场 IATA 三字码 |
| `dest_province` | string | 目的地所属省市 |
| `dow_bitmap` | number | 班期位图（周一 bit0 ... 周日 bit6） |
| `dep_minutes` | number | 起飞时间（自当日 0 点起的分钟数，0–1439） |
| `arr_minutes` | number | 到达时间（自当日 0 点起的分钟数，0–1439） |
| `overnight` | boolean | 是否跨日（`arr_minutes < dep_minutes`） |
| `product` | string? | 适用产品（如 `666` / `2666`），可选 |

> 字段定义以 `lib/flight/types.ts` 中的 TypeScript 类型为准。

## 许可与使用限制 / License & Usage Restrictions

**本仓库的不同部分采用不同的许可方式，请分别查阅：**

| 内容 | 许可 / 说明 |
|---|---|
| **源代码（`*.ts` / `*.tsx` / 配置文件等）** | MIT License — 以仓库根目录的 `LICENSE` 为准 |
| **航班数据（`data/airport.csv`）** | 由作者整理自海航官方公开发布的航班计划。**作者对该数据集本身不附加任何额外的版权主张**，也**不对其准确性、完整性、时效性做任何保证**。该数据为历史快照，仅供学习/参考 |
| **机场基础数据（`lib/flight/airport-coordinates.ts`、`lib/flight/airport-city-map.ts`）** | IATA 三字码、机场中文名、经纬度等为公开通用的民航地理信息，本项目仅作引用整理 |
| **第三方依赖** | 见 `package.json`，遵循各自的开源协议 |
| **第三方品牌** | 所有提及的航空公司名称、产品名、商标均归各自合法持有人所有 |

> ⚠️ **MIT 协议仅适用于源代码部分，并不构成对所附数据集的二次授权。** 使用、复制、修改或再分发本仓库中的数据时，请自行评估其合规性。

**对衍生作品的强烈建议：**

- 不在用户可见的产品中宣称数据准确性
- 在任何衍生作品中保留同等或更显著的免责声明
- 不使用本数据进行商业订票或出行决策
- 自行核实数据合规性后再用于其他场景

**特别声明**：如原始数据来源的合法持有人对所附数据中包含的具体内容有任何异议，请通过 `support@sxfroute.com` 联系作者，作者将及时配合处理。

---

## License & Usage Restrictions (English)

**Different parts of this repository are licensed differently:**

| Content | License / Notes |
|---|---|
| **Source code** | MIT License — see root `LICENSE` file |
| **Flight data (`data/airport.csv`)** | A manually-compiled historical snapshot from publicly available Hainan Airlines schedules. The author asserts no additional copyright claim on the dataset itself, and likewise makes NO warranty as to its accuracy, completeness, or timeliness. The data is a frozen snapshot, intended for learning and reference only |
| **Airport reference data** | IATA codes, airport names, coordinates — public civil-aviation geographic information, included as reference |
| **Third-party dependencies** | See `package.json`; each follows its own open-source license |
| **Third-party brands** | Airline names, product names, and trademarks belong to their respective lawful holders |

> ⚠️ **The MIT License covers source code only. It does NOT constitute a re-license of the bundled dataset.** When using, copying, modifying, or redistributing the data in this repository, you are responsible for assessing its compliance under your own jurisdiction.

**Strong recommendations for derivative works:**

- Do not claim data accuracy in user-facing products
- Retain equivalent or more prominent disclaimers in any derivative work
- Do not use this data for commercial booking or actual travel decisions
- Verify data compliance before using in other contexts

**Notice**: If a rightful holder of the original data source has any concerns about specific content included here, please contact `support@sxfroute.com`.
