# Implementation Plan: 核心治理 MCP Server v0.1

<!-- AIGC-WM:AICOMPANYMCP-20261116-112500 -->

> **AIGC 标注（第 1 层 · 可见标签）**：本文由 AI 生成，须经人工架构评审后方可进入 `/tasks`。
> **AI-generated content — human architecture review required before `/tasks`.**

**Feature Branch**: `001-core-mcp-server`
**Created**: 2026-11-16
**Status**: Draft — SDD Step 3 (`/plan`) 产物，待架构评审
**Spec Input**: `specs/001-core-mcp-server/spec.md`（Step 1 产物，人工评审已签字；含 Clarified Decisions Q1–Q5）
**Research Input**: `docs/research/competitive-analysis.md`（决策 D1–D7）
**Protocol Target**: MCP `2026-07-28`（主目标）+ 全部已发布历史版本协商（见决策 P-4）

| 元数据（第 2 层） | 值 |
| --- | --- |
| 生成器 | WorkBuddy / Tencent Hunyuan Hy |
| 审计追踪 ID | `AICM-SDD-20261116-112500` |
| 规范基线 | `github/spec-kit` plan 阶段约定（architecture, decisions, risks） |
| 证据等级 | A = 官方文档 / npm 注册表；快照日期 2026-11-16 |
| 复核状态 | 待人工复核 |

## 0. 输入与非目标

**输入**：`spec.md` 的 15 条 FR 与 12 条 AT（全部 `RED-PENDING`）、Clarified Decisions Q1–Q5、维护者于 2026-11-16 拍板的三项技术口径（见决策 P-2/P-3/P-5）。

**非目标（继承 spec）**：不做 Agent 运行时 / 编排引擎 / UI / 数据库；不调用 LLM、不发起网络请求、不写宿主文件系统、不生成子进程；本阶段仍不产生任何实现代码。

## 1. 技术栈决策

| ID | 决策 | 依据 |
| --- | --- | --- |
| P-1 | TypeScript 5.x + `@modelcontextprotocol/sdk`（1.32.x 线，最新观测 1.32.2，2026-11-16 npm 快照；MIT；ESM+CJS 双发布；对 `zod` 有 peer dependency） | Clarified Decisions Q1；npm 注册表 |
| P-2 | Node.js `engines` 字段声明 `>=20 <23`；CI 矩阵跑 20 LTS + 22 LTS | 维护者拍板（2026-11-16） |
| P-3 | 构建：`tsc` 编译至 `dist/`（ESM，`module: nodenext`）；源码置 `src/`；v0.1 **不发布 npm 包**，仅源码可用（git clone + `npm install` + `npm run build`），npm 发布推至后续版本 | 维护者拍板（2026-11-16） |
| P-4 | 协议版本协商：`supportedVersions` 静态清单 = 已发布的全部 MCP 修订版（A 级证据，官方 Versioning 页，快照 2026-11-16）：`2024-11-05`、`2025-03-26`、`2025-06-18`、`2025-11-25`（Final）+ `2026-07-28`（Current）；`Draft` 修订不纳入（官方定义「尚未就绪」）。每请求经 `_meta` 的 `io.modelcontextprotocol/protocolVersion` 键声明版本，Streamable HTTP 下同值另载于 `MCP-Protocol-Version` 头；不支持时返回 `UnsupportedProtocolVersionError` 并列出支持范围 | 官方 Versioning 页（dateModified 2026-11-09）；FR-011 / AT-001 |
| P-5 | 测试框架：`node:test` + `node:assert`，零第三方测试依赖 | 维护者拍板（2026-11-16）；SC-004 零外部调用约束 |

## 2. 架构分层

```
Transport Adapters        stdio | Streamable HTTP        （FR-010, AT-002）
        ↓ 统一请求语义（每请求版本协商、_meta 校验）
Protocol Core             server/discover、capabilities、错误码出口（FR-001/002/011/014）
        ↓
Governance Layer          Routing | ApprovalGate | Audit | SpecValidator
                          Registry | PromptTemplate | PiiMasker
```

- **Transport Adapters**：两种传输共享同一语义层函数集，禁止分支内实现业务逻辑（AT-002 的字节级一致性由此保证）。
- **Protocol Core**：`server/discover`（`2026-07-28` 起为强制能力发现方法）返回 `supportedVersions` + `capabilities`（tools/resources/prompts）；版本拒绝走 `UnsupportedProtocolVersionError`。
- **Governance Layer**：六个纯函数式模块，全部无 I/O；模块间只通过显式数据结构通信。

## 3. 数据设计

### 3.1 部门注册表（FR-004, AT-004）

- 单一版本化 JSON 资源 `company://departments`；内部结构为「域（Domain）→ 部门（Department）」两级，Department 含稳定 slug、职责描述、路由关键词。
- 五档 profile 为**同一数据集的过滤视图**，而非五份独立数据：`micro`=2、`small`=5、`medium`=9、`large`=18、`group`=36 部门；配置项 `profile` 五选一，默认 `micro`；非法 profile 值为确定性启动错误（对齐 Edge Case「注册表缺失或版本不匹配 → 启动失败」）。
- 档位间为**超集关系**（micro ⊂ small ⊂ medium ⊂ large ⊂ group），保证配置升级不改变已有 slug 的语义。

### 3.2 AuditRecord（FR-008, AT-008）

字段：`trace_id`（`AICM-` 前缀 + 时间戳）、UTC 时间戳（ISO 8601）、`actor`、`action`、`AIGC` 标注、掩码后的输入摘要。仅随响应内存返回，无任何持久化（Q3）。

## 4. 关键机制

| 机制 | 设计 | 对应 |
| --- | --- | --- |
| 确定性路由 | 关键词精确匹配 + 唯一主部门 + 候选列表 + `confidence`；无匹配时 `fallback` + `confidence: 0` + `NEEDS_CLARIFICATION` 标记；全程无随机源、无 LLM | FR-003/005, AT-003/005, SC-002 |
| 审批门禁 | 变更型工具默认不可用；`elicitation/create` 获得批准令牌后方可执行；宿主不支持 elicitation 时保持不可用并返回明确错误码，绝不绕过 | FR-007/009, AT-007/009, Edge Case |
| 只读默认 | 默认模式下任何变更型工具返回 `COMPANY_003`（ReadOnlyMode），零写入 | FR-009, AT-009 |
| PII 掩码 | 邮箱 / 手机号样式正则识别，进入审计记录或响应前替换为掩码样式；正则清单随 `/tasks` 固化并纳入测试 | FR-015, AT-012 |
| 错误码契约 | `company://error-codes` 资源提供唯一对外错误契约；初步枚举：`COMPANY_001` InvalidInput、`COMPANY_002` UnsupportedProtocolVersion、`COMPANY_003` ReadOnlyMode、`COMPANY_004` ApprovalRequired、`COMPANY_005` RegistryUnavailable（终稿在 `/tasks` 固化，新增须经 spec 修订） | FR-014, AT-012 |
| 规范契约校验 | `company.spec.validate` 复用门禁同源规则：五强制章节、孤立 FR、重复 AT，结构化结果 | FR-012, AT-010, D5 |
| 提示模板 | `department-brief` 为纯结构化模板，不含外部工具调用指令 | FR-013, AT-011 |

### 4.1 沙箱测试夹具（AT-006, SC-004）

Node 无内建网络防火墙，采用**双层防护**：① 运行时拦截——测试引导阶段以 `node:test` 的模块 mock 将 `net`/`http`/`https`/`fetch`/`child_process` 的出口替换为必抛断言函数；② 静态门禁——CI 中对 `src/` 做 import 扫描，出现网络 / 子进程模块即红灯。两层任一触发即判失败。细节随 `/tasks` 固化。

## 5. FR → 组件映射

| FR | 组件 / 机制 |
| --- | --- |
| FR-001 | Protocol Core（`server/discover`） |
| FR-002 | Protocol Core + Governance Layer 原语注册（tool/resource/prompt 各 ≥1） |
| FR-003 | Routing（确定性关键词路由） |
| FR-004 | Registry（五档 profile JSON 资源） |
| FR-005 | Routing（fallback 语义） |
| FR-006 | 全局约束：所有模块无 I/O（沙箱夹具强制） |
| FR-007 | ApprovalGate（elicitation 流程） |
| FR-008 | Audit（内存 AuditRecord） |
| FR-009 | 只读默认模式（`COMPANY_003`） |
| FR-010 | Transport Adapters（stdio + Streamable HTTP） |
| FR-011 | Protocol Core（版本协商与拒绝） |
| FR-012 | SpecValidator（`company.spec.validate`） |
| FR-013 | PromptTemplate（`department-brief`） |
| FR-014 | ErrorCodes（`company://error-codes`） |
| FR-015 | PiiMasker（掩码正则） |

## 6. AT → 测试层映射

| AT | 测试层（继承 spec） | 载体（`/tasks` 展开） |
| --- | --- | --- |
| AT-001 | protocol conformance | `node:test` 协议套件（stdio 客户端） |
| AT-002 | dual-transport | 同一语义层双传输对比套件 |
| AT-003 | determinism | 100 次字节级一致性测试 |
| AT-004 | registry | 五档 profile 注册表解析测试 |
| AT-005 | negative path | fallback 语义测试 |
| AT-006 | sandbox | 双层防护夹具（§4.1） |
| AT-007 | approval gate | 无批准令牌拒绝测试 |
| AT-008 | audit | AuditRecord 结构与标注断言 |
| AT-009 | read-only | 只读模式拒绝测试 |
| AT-010 | contract | 校验器正反双样本测试 |
| AT-011 | prompt template | 模板内容断言 |
| AT-012 | error & privacy | 错误码 + PII 掩码测试 |

## 7. CI 矩阵（SC-006）

- 矩阵：`os = [ubuntu-latest, windows-latest, macos-latest]` × `node = [20, 22]`，共 6 格。
- 落地时机：矩阵**声明**随本计划定稿；workflow 接线随 `/tasks` 首批红灯测试一并提交，避免空跑失败。现有 `contract-gate` job（Python 3.13）保持不变，矩阵 job 复用同一 checkout 步骤风格。
- 性能门槛：SC-001（四次发现调用 p95 < 200 ms）在矩阵的 ubuntu 格上断言，其余平台仅跑正确性。

## 8. 分发（P-3 影响）

v0.1 无 npm 包。宿主接入方式：clone 仓库 → `npm install`（含 `zod` peer dependency 自动安装）→ `npm run build` → 以 stdio 或 Streamable HTTP 启动 `dist/` 入口。`package.json` 提供 `engines`/`bin` 字段但不含 `publishConfig`。

## 9. 风险

| ID | 风险 | 处置 |
| --- | --- | --- |
| R-P1 | SDK 1.x 对握手时代修订版（≤`2025-11-25`）的服务端兼容能力未完全验证（官方版本页提示需参见 Backward Compatibility） | `/tasks` 首项验证：以握手客户端连 `2025-11-25` 语义；若 SDK 不覆盖，则评估最小握手适配层或经 spec 修订收窄 Q5 承诺 |
| R-P2 | `zod` peer dependency 引入第三方依赖链，与「无多余依赖」原则存在张力 | Q1 决策已豁免（SDK 硬性要求）；锁单一直接依赖 + peer，不引入其他运行时依赖 |
| R-P3 | 版本清单随官方发布增长，静态清单可能过期 | `supportedVersions` 常量单点维护 + 测试断言清单与文档同步；新修订发布时走 spec 修订流程 |
| R-P4 | Windows 下路径 / 换行差异导致矩阵失败 | 路径一律 `node:path` 组装；LF 由 `.gitattributes` 与 `.editorconfig` 强制 |
| R-P5 | `node:test` mock 能力不足以覆盖全部沙箱断言 | 降级方案：进程级断言（临时 HOME/工作目录快照比对）+ 静态扫描兜底 |
| R-P6 | Streamable HTTP 与 stdio 语义漂移 | 业务逻辑强制收敛于语义层（§2），AT-002 字节级对比 |

## 10. 追溯

| 来源 | 落点 |
| --- | --- |
| Clarified Q1 | P-1 |
| Clarified Q2 | §3.1 |
| Clarified Q3 | §3.2 |
| Clarified Q4 | 仓库元数据（不在本计划重复） |
| Clarified Q5 | P-4 |
| 维护者 2026-11-16 三项口径 | P-2 / P-3 / P-5 |
| D1 薄层 | §2 架构分层 |
| D2 无状态化 | P-4 + Protocol Core |
| D5 规范契约产品化 | §4 SpecValidator |
| D6 安全默认 | §4 审批门禁 / 只读默认 / PiiMasker |

## 11. 退出门禁与下一步

- [ ] **人工架构评审**（维护者完成；AI 不得代签）。
- 通过后进入 `/tasks`：任务分解 + 红灯测试 + CI 矩阵接线。`/implement` 之前不写任何实现代码。

## 证据快照

- MCP Versioning（官方）：`https://modelcontextprotocol.io/docs/2026-07-28/learn/versioning`，页面 dateModified 2026-11-09，快照 2026-11-16。修订清单：2024-11-05 / 2025-03-26 / 2025-06-18 / 2025-11-25（Final）、2026-07-28（Current）。
- `@modelcontextprotocol/sdk`：npm 注册表快照 2026-11-16，1.32.x 线（最新观测 1.32.2），MIT，ESM+CJS，peer dependency `zod`。
