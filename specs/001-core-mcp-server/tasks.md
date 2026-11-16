# Task Breakdown: 核心治理 MCP Server v0.1

<!-- AIGC-WM:AICOMPANYMCP-20261116-121500 -->

> **AIGC 标注（第 1 层 · 可见标签）**：本文由 AI 生成，须经人工复核后方可进入 `/implement`。
> **AI-generated content — human review required before `/implement`.**

**Feature Branch**: `001-core-mcp-server`
**Created**: 2026-11-16
**Status**: Draft — SDD Step 4 (`/tasks`) 产物，待人工复核
**Spec Input**: `specs/001-core-mcp-server/spec.md`（签字版）
**Plan Input**: `specs/001-core-mcp-server/plan.md`（P-1~P-5 决策）
**Execution Rule**: 每个任务先写**预期失败的测试**（红灯），再写实现使其转绿；测试文件名必须含所覆盖的 `AT-NNN`（追溯规则见 `docs/development-method.md` §4）。`/implement` 之前本阶段不写任何实现代码。

| 元数据（第 2 层） | 值 |
| --- | --- |
| 生成器 | WorkBuddy / Tencent Hunyuan Hy |
| 审计追踪 ID | `AICM-SDD-20261116-121500` |
| 任务总数 | 13（T-01~T-13），覆盖 AT-001~AT-012 全部 12 条 |
| 证据等级 | 依据 = 签字版 spec + plan；无外部事实引入 |
| 复核状态 | 待人工复核 |

## 0. 执行顺序与依赖

```
T-01 scaffold
  └─ T-02 sandbox fixture (AT-006) + CI 矩阵骨架接线   ← 夹具先行，为全部测试兜底
       └─ T-03 registry (AT-004)            ← US1 · P1 起步
            └─ T-04 discover + 版本协商 (AT-001)
                 └─ T-05 双传输 (AT-002) + stdio 全链路合并验证   ← US1 · P1 完成
                      └─ T-06 确定性路由 (AT-003, AT-005)
                           └─ T-07 审批门禁 + 只读 (AT-007, AT-009)   ← US2 · P2
                                ├─ T-08 审计 (AT-008)
                                └─ T-09 错误码 + PII 掩码 (AT-012)
                                     └─ T-10 规范契约校验 (AT-010)  ← US3 · P3
                                          └─ T-11 提示模板 (AT-011)
                                               └─ T-12 SC 断言收尾 + 全矩阵验证
                                                    └─ T-13 收敛检查
```

用户故事优先级映射：US1 = T-02~T-06（P1，最小可交付切片）；US2 = T-07~T-09（P2）；US3 = T-10~T-11（P3）。

## 1. 任务清单

### T-01 — 工程脚手架（无 AT，前置任务）

- **产出**：`package.json`（`"type": "module"`、`engines: ">=20 <23"`、scripts：`build`/`test`/`typecheck`；dependencies 仅 `@modelcontextprotocol/sdk`，peer `zod` 自动装配）；`tsconfig.json`（`module: nodenext`、strict、outDir `dist/`）；`src/`、`test/` 目录骨架。
- **约束**：不引入任何其他运行时依赖（P-1/P-2/R-P2）；`dist/` 已在 `.gitignore`。
- **完成标准**：`npm install` 与 `npm run typecheck` 在 Node 20/22 双版本本地通过；分发方式严格遵循 P-3（clone + install + build，无 npm 发布）。

### T-02 — 沙箱夹具（AT-006，FR-006）

- **红灯**：`test/at006-sandbox.test.ts`——断言完整测试套件运行期间四个零值：出站网络连接数 = 0、LLM API 调用数 = 0、**宿主文件系统写入数 = 0（全程，非仅测试目录外）**、子进程调用数 = 0（预期失败：夹具尚未存在）。
- **实现**：plan §4.1 双层防护——① `node:test` 模块 mock 将 `net`/`http`/`https`/`fetch`/`child_process` 出口替换为必抛断言函数的引导模块（零写盘采用进程级断言：临时目录快照比对，降级手段见 plan R-P5）；② 静态扫描脚本（stdlib）检查 `src/` 禁止 import 网络/子进程模块，挂入现有 `contract-gate` job（`.github/workflows/ci.yml`）。
- **依赖**：T-01。**完成标准**：AT-006 GREEN；SC-004 的三个零值（网络/LLM/写盘）与 AT-006 的三个零值（连接/写盘/子进程）并集共四个零值断言全部就位。

### T-03 — 部门注册表（AT-004，FR-004）

- **红灯**：`test/at004-registry.test.ts`——五档 profile（micro/small/medium/large/group）分别读取 `company://departments`，断言域/部门 slug 完整可解析且部门数 = 2/5/9/18/36；默认档为 `micro`；非法 profile 值触发确定性启动错误。（T-05 之前传输层尚不存在：本红灯为**语义层进程内直调**，stdio 全链路读取验证于 T-05 双传输任务合并执行。）
- **实现**：`src/registry/`——单一版本化 JSON 数据集（Domain→Department，含 slug/职责/关键词）+ profile 过滤视图；档位为超集关系（plan §3.1）。
- **依赖**：T-02。**完成标准**：AT-004 GREEN；部门数据为静态资源，无运行时生成。

### T-04 — 能力发现与版本协商（AT-001，FR-001、FR-011）

- **红灯**：`test/at001-discover-versions.test.ts`——`server/discover` 返回 `supportedVersions` 含 `2026-07-28` 与 `2024-11-05`/`2025-03-26`/`2025-06-18`/`2025-11-25` 及 `capabilities`（tools/resources/prompts）；携带各历史版本的请求可协商；缺失或非法版本返回 `UnsupportedProtocolVersionError` 并列出支持范围。（同 T-03：本红灯为**语义层进程内直调**，stdio 客户端全链路 conformance 于 T-05 合并验证。）
- **实现**：`src/core/discover.ts` + 版本协商中间层（`_meta` 的 `io.modelcontextprotocol/protocolVersion` 键；Streamable HTTP 下同值校验 `MCP-Protocol-Version` 头）；静态版本常量单点维护（plan P-4/R-P3）。
- **依赖**：T-03。**完成标准**：AT-001 GREEN。

### T-05 — 双传输适配（AT-002，FR-002、FR-010）

- **红灯**：`test/at002-dual-transport.test.ts`——stdio 与 Streamable HTTP 下分别 `tools/list`、`resources/list`、`prompts/list` 并调用同一工具，断言响应**字节级一致**（plan §2 的更严判据，防语义漂移 R-P6）；并**合并执行 T-03/T-04 承诺的 stdio 全链路验证**（stdio 客户端 `server/discover` 与 `resources/read` 读取 `company://departments`）。
- **实现**：`src/transport/`（stdio.ts、http.ts）——两适配器仅做协议编解码，业务逻辑全部收敛于语义层（plan §2）；暴露至少一个 tool、一个 resource、一个 prompt 的最小注册（完整能力由后续任务填充）。
- **依赖**：T-04。**完成标准**：AT-002 GREEN；语义层函数集无传输分支。

### T-06 — 确定性路由（AT-003、AT-005，FR-003、FR-005）

- **红灯**：`test/at003-determinism.test.ts`——固定输入调用 `company.route` 100 次，JSON 字节级一致且零 LLM 调用；`test/at005-fallback.test.ts`——无匹配关键词输入返回 `fallback` + `confidence: 0` + `NEEDS_CLARIFICATION` 标记，不臆造部门。
- **实现**：`src/routing/`——关键词精确匹配 → 唯一主部门 + 候选列表 + `confidence`；无随机源；路由范围受当前 profile 过滤（T-03）。
- **依赖**：T-05。**完成标准**：AT-003/AT-005 GREEN；SC-002 达成。**里程碑：US1（P1）完整可独立交付。**

### T-07 — 审批门禁与只读默认（AT-007、AT-009，FR-007、FR-009）

- **红灯**：`test/at007-approval.test.ts`——变更型工具无 elicitation 批准令牌时拒绝且不执行；宿主不支持 elicitation 时返回明确错误码；`test/at009-readonly.test.ts`——默认只读模式下变更型工具返回 `COMPANY_003` 且零写入。
- **实现**：`src/approval/`——`elicitation/create` 批准令牌校验 + 只读模式开关；批准语义按 spec ApprovalGate 实体（工具名、令牌来源、批准者角色、过期条件）。
- **依赖**：T-06。**完成标准**：AT-007/AT-009 GREEN。

### T-08 — 审计记录（AT-008，FR-008）

- **红灯**：`test/at008-audit.test.ts`——已批准变更调用完成后返回 `AuditRecord`，含 `trace_id`（`AICM-` 前缀）、UTC ISO 8601 时间戳、`actor`、`action`、AIGC 标注、掩码后输入摘要；无任何持久化副作用。
- **实现**：`src/audit/`——内存构造、随响应返回（Q3）；`trace_id` 生成确定性可测。
- **依赖**：T-07。**完成标准**：AT-008 GREEN。

### T-09 — 错误码契约与 PII 掩码（AT-012，FR-014、FR-015）

- **红灯**：`test/at012-errors-pii.test.ts`——`company://error-codes` 可解析且枚举与文档一致；异常路径仅返回稳定 `COMPANY_NNN`（含 Edge Case 样例：空字符串 / >100 KB / 非 UTF-8 输入 → `COMPANY_001`，不抛未捕获异常）；含邮箱/手机号样式的输入在审计记录与响应中均被掩码。
- **实现**：`src/errors/` + `src/pii/`——错误码表按 plan §4 初步枚举固化为终稿（`COMPANY_002` ↔ `UnsupportedProtocolVersionError` 映射关系一并写死）；掩码正则清单固化并纳入测试。
- **依赖**：T-08（掩码需作用于审计摘要）。**完成标准**：AT-012 GREEN。

### T-10 — 规范契约校验（AT-010，FR-012）

- **红灯**：`test/at010-contract.test.ts`——合规 spec（五强制章节、FR→AT 全覆盖、ID 唯一）返回 `pass` + 统计摘要；删章节 / 存在孤立 FR / 重复 AT 的 spec 返回 `fail` 并逐条列出违规 ID。
- **实现**：`src/validator/`——与 `scripts/check_repo.py` 同源规则（五章节、孤立 FR、重复 AT），结构化结果；错误码契约沿用 T-09。
- **依赖**：T-09。**完成标准**：AT-010 GREEN。

### T-11 — 部门简报提示模板（AT-011，FR-013）

- **红灯**：`test/at011-prompt.test.ts`——`prompts/get` 获取 `department-brief` 返回结构化模板，且模板内容不含任何外部工具调用指令。
- **实现**：`src/prompts/`——纯静态模板，按当前 profile 渲染部门清单。
- **依赖**：T-10。**完成标准**：AT-011 GREEN。

### T-12 — CI 矩阵接线与成功标准断言（SC-001/SC-002/SC-004，SC-006 落地）

- **产出**：`.github/workflows/ci.yml` 新增矩阵 job：`os = [ubuntu-latest, windows-latest, macos-latest]` × `node = [20, 22]`（6 格），步骤 = checkout → setup-node → `npm ci` → `typecheck` → `build` → `test`；现有 `contract-gate` job 不变。
- **接线时机（依 plan §7）**：矩阵 job **骨架**随 T-02 首批红灯测试一并提交（CI 允许先红、随 AT 转绿而转绿）；SC-001 断言与全矩阵 AT 验证在本任务**收尾**（依赖 T-11 全部转绿）。
- **断言**：ubuntu 格测 SC-001（四次发现调用冷启动 p95 < 200 ms，无网络）；全矩阵跑 AT 全套。
- **依赖**：T-02（骨架接线）、T-11（收尾验证）。**完成标准**：SC-006 矩阵在 CI 全绿；SC-001~SC-004 达成。
- **测试**：SC 非验收契约项，以 CI 状态本身为证据，不新增 `AT-NNN`。

### T-13 — 收敛检查（无新测试，/converge 前置）

- **产出**：核对 spec 契约表 Status 全部由 `RED-PENDING` → `GREEN`；`docs/development-method.md` §4 追溯规则全链路（D→FR→AT→测试名）核对；仓库契约门禁 + 双向验证复跑；**SC-005 跟踪项**：核对 GitHub 社区规范清单达成率（Q4 产物 `CODEOWNERS`/`CODE_OF_CONDUCT.md` 已在仓，Discussions 与私有漏洞上报为仓库设置项，发布前核验）。
- **依赖**：T-12。**完成标准**：进入 `/converge` 的全部证据就位，SC-001~SC-006 全部有落点。

## 2. 追溯矩阵

| AT | 任务 | FR | 计划落点（plan.md） |
| --- | --- | --- | --- |
| AT-001 | T-04 | FR-001, FR-011 | §2 Protocol Core；P-4 |
| AT-002 | T-05 | FR-002, FR-010 | §2 Transport Adapters |
| AT-003 | T-06 | FR-003 | §4 确定性路由 |
| AT-004 | T-03 | FR-004 | §3.1 注册表 |
| AT-005 | T-06 | FR-005 | §4 fallback 语义 |
| AT-006 | T-02 | FR-006 | §4.1 沙箱夹具 |
| AT-007 | T-07 | FR-007 | §4 审批门禁 |
| AT-008 | T-08 | FR-008 | §3.2 AuditRecord |
| AT-009 | T-07 | FR-009 | §4 只读默认 |
| AT-010 | T-10 | FR-012 | §4 SpecValidator |
| AT-011 | T-11 | FR-013 | §4 提示模板 |
| AT-012 | T-09 | FR-014, FR-015 | §4 错误码契约 + PII 掩码 |

追溯声明：AT-001~AT-012 全部 12 条各被恰好一个主任务覆盖，无遗漏、无重复；FR-001~FR-015 全部 15 条经上表间接全覆盖（FR-006 由 T-02 夹具强制、FR-010 由 T-05 承载）。

## 3. 复核与下一步

- [ ] **人工复核签字**（维护者完成；AI 不得代签）。
- 通过后进入 `/implement`：按 §0 顺序逐任务执行，红灯先行，AT 全绿后进入 `/converge`。
