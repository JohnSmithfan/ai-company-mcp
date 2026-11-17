# Feature Specification: 核心治理 MCP Server v0.1

<!-- AIGC-WM:AICOMPANYMCP-20261116-045201 -->

> **AIGC 标注（第 1 层 · 可见标签）**：本文由 AI 生成，须经人工复核批准后方可进入 `/plan`。
> **AI-generated content — human approval required before `/plan`.**

**Feature Branch**: `001-core-mcp-server`
**Created**: 2026-11-16
**Status**: Draft — SDD Step 1 (`specify`) 产物，澄清（`/clarify`）已于 2026-11-16 完成，待人工评审
**Protocol Target**: MCP `2026-07-28`（无状态版）为主目标；按宿主声明的协议版本协商，兼容 MCP 官方全部已发布历史版本（见 Clarified Decisions Q5）
**Input**: 制作一个 AI 虚拟公司插件，保存在独立项目文件夹，发布至 GitHub 并包含社区规范文件，采用 SDD + ATDD；宿主为通用 MCP / Agent SDK（框架无关）；先竞品调研，再执行 SDD 第一步。
**Research Input**: `docs/research/competitive-analysis.md`（决策 D1–D7）

| 元数据（第 2 层） | 值 |
| --- | --- |
| 生成器 | WorkBuddy / Tencent Hunyuan Hy |
| 审计追踪 ID | `AICM-SDD-20261116-045201` |
| 规范基线 | `github/spec-kit` `templates/spec-template.md` |
| 复核状态 | 待人工复核 |

## 0. Scope & Non-goals

**In scope (v0.1)**：一个无状态、只读优先、框架无关的 MCP Server，把「虚拟公司的部门路由 / 治理门禁 / 审计 / 规范契约」暴露为 MCP 原语。

**Non-goals**（明确不做，避免与竞品同质化）：

- 不做 Agent 运行时、编排引擎或工作流框架（LangGraph / CrewAI / mcp-agent 的职责）。
- 不做自托管控制平面、UI、数据库或心跳调度（Paperclip / trinity 的职责）。
- 不做人格 / 提示词角色库（The Agency 的职责）。
- 不做软件公司代码生成流水线（MetaGPT / ChatDev 的职责）。
- 不调用任何 LLM、不持有模型凭据、不发起网络请求、不写宿主文件系统、不生成子进程。
- 不绑定任何 MCP 宿主、模型厂商或 IDE；不提供托管服务与遥测。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 发现与确定性路由 (Priority: P1)

任意 MCP 宿主连接本服务后，能发现全部能力，并把一段任务描述确定性地路由到治理部门，且不依赖 LLM。

**Why this priority**：这是最小可交付切片（MVP）。只实现 US1 即可独立验证「协议合规 + 治理语义」这一核心价值，无需持久化、无需审批、无需外部依赖。

**Independent Test**：用 stdio MCP 客户端依次调用 `server/discover`、`tools/list`、`resources/list`、`prompts/list`，再以固定输入调用 `company.route` 100 次，比对输出字节一致。

**Acceptance Scenarios**:

1. **Given** 服务以 stdio 启动且未联网，**When** 客户端发送 `server/discover`，**Then** 响应声明 `supportedVersions` 含 `2026-07-28`、`capabilities` 含 tools/resources/prompts，且耗时 < 200 ms。
2. **Given** 任务描述含「预算超支审批」，**When** 调用 `company.route`，**Then** 返回唯一主部门 slug、候选部门列表、命中关键词与 `confidence`，且 100 次重复调用输出字节一致。
3. **Given** 任务描述无任何可识别关键词，**When** 调用 `company.route`，**Then** 返回 `fallback` 决策、`confidence: 0` 与 `NEEDS_CLARIFICATION` 标记，不臆造部门。

---

### User Story 2 - 治理门禁与审计 (Priority: P2)

对任何有副作用的工具，服务在人类批准前不执行；批准后产出带追踪 ID 的审计记录。

**Why this priority**：竞品轻量方案普遍缺治理；这是差异化的第二层，但依赖 US1 的部门与错误码语义。

**Independent Test**：在只读模式与已批准模式下分别调用一个变更型工具，断言前者被拒、后者产出结构化审计记录且 PII 已掩码。

**Acceptance Scenarios**:

1. **Given** 服务处于默认只读模式，**When** 客户端调用任何变更型工具，**Then** 返回稳定错误码 `COMPANY_003`（ReadOnlyMode），且不产生任何写入。
2. **Given** 一个已通过 elicitation 获得人类批准的变更型调用，**When** 执行完成，**Then** 返回 `AuditRecord`，含 `trace_id`、UTC 时间戳、`actor`、`AIGC` 标注，且输入中的邮箱/手机号样式已掩码。
3. **Given** 请求未携带 `_meta.protocolVersion` 或版本不受支持，**When** 服务处理该请求，**Then** 返回 `UnsupportedProtocolVersionError` 并列出支持的版本。

---

### User Story 3 - 规范契约即能力 (Priority: P3)

团队把 SDD / ATDD 的验收契约作为可调用工具，用于 CI 前置校验规格说明书。

**Why this priority**：把本项目自身的开发规范产品化（D5），可在 US1/US2 稳定后独立交付。

**Independent Test**：对一份合规 spec 与一份缺章节 / 断链的 spec 分别调用 `company.spec.validate`，断言分别返回 `pass` 与带具体条目编号的 `fail`。

**Acceptance Scenarios**:

1. **Given** 一份含全部强制章节、FR→AT 全覆盖、ID 唯一的 spec，**When** 调用 `company.spec.validate`，**Then** 返回 `pass` 与统计摘要。
2. **Given** 一份删除了 `Success Criteria` 章节或存在孤立 FR 的 spec，**When** 调用 `company.spec.validate`，**Then** 返回 `fail`，并逐条列出违规项 ID。
3. **Given** 宿主请求 `department-brief` prompt 模板，**When** 通过 `prompts/get` 获取，**Then** 得到不含任何外部工具调用指令的结构化模板。

---

### Edge Cases

- 空字符串 / 超长（> 100 KB）/ 非 UTF-8 的任务描述：拒绝并返回 `COMPANY_001`（InvalidInput），不抛未捕获异常。
- 同一请求携带多个协议版本或非法 `_meta`：按 FR-011 拒绝，不降级猜测。
- 部门注册表资源缺失或版本不匹配：服务启动失败并给出确定性错误，而非静默降级。
- 并发 100 个只读请求：因无状态设计，结果与顺序无关。
- Streamable HTTP 与 stdio 两种传输下同一工具语义不一致：视为缺陷，由 AT-002 覆盖。
- MCP 客户端不支持 elicitation：变更型工具保持不可用，返回明确错误码，不绕过人工批准。

## Requirements *(mandatory)*

### Functional Requirements（EARS 语法；`the server shall …`）

- **FR-001**: The server shall implement the mandatory `server/discover` request and advertise supported protocol versions and capabilities.（主目标 MCP `2026-07-28`，无 `initialize` 握手；`supportedVersions` 列出全部受支持的历史版本，见 FR-011）
- **FR-002**: The server shall expose at least one tool, one resource, and one prompt, each discoverable through its `*/list` method.
- **FR-003**: When a client calls `company.route` with a task description, the server shall return a deterministic `RoutingDecision` without any LLM call.
- **FR-004**: The server shall ship a versioned department registry resource containing domain and department slugs, with five built-in size profiles switchable via configuration (`micro` = 2 departments, `small` = 5, `medium` = 9, `large` = 18, `group` = 36); all five profiles ship in v0.1 and the default profile is `micro`.（Clarified Decisions Q2）
- **FR-005**: If no registry keyword matches, then the server shall return a `fallback` decision with `confidence: 0` and a `NEEDS_CLARIFICATION` marker, never a fabricated department.
- **FR-006**: The server shall perform no network I/O, no LLM API calls, no filesystem writes, no subprocess execution, and no telemetry in v0.1.
- **FR-007**: Where a tool has side effects, the server shall require an explicit human approval obtained via `elicitation/create` before execution.
- **FR-008**: When an approved side-effecting call completes, the server shall emit an `AuditRecord` with trace ID, UTC timestamp, actor, and AIGC label, returned in-memory with the response only; v0.1 performs no audit persistence or host-side append-only log sinking.（Clarified Decisions Q3）
- **FR-009**: While operating in default read-only mode, the server shall reject every mutating tool with a typed error code and produce no writes.
- **FR-010**: The server shall support both `stdio` and `Streamable HTTP` transports with identical tool semantics.
- **FR-011**: If a request carries an unsupported or missing `_meta.protocolVersion`, then the server shall reject it with `UnsupportedProtocolVersionError` listing the supported version range, which includes MCP `2026-07-28` as the primary target and all officially published historical MCP versions negotiated per the host's declaration.（Clarified Decisions Q5）
- **FR-012**: When `company.spec.validate` receives a specification document, the server shall report missing mandatory sections, orphaned FR IDs, and duplicate AT IDs as a structured result.
- **FR-013**: The server shall expose a `department-brief` prompt template containing no instructions that require external tools.
- **FR-014**: The server shall return only documented, stable error codes from `company://error-codes`, never free-form exceptions.
- **FR-015**: Where a task description contains PII-like patterns, the server shall mask them before they enter any audit record or response.
- **FR-016**: When a handshake-era host sends an `initialize` request with a top-level `protocolVersion` on a stdio connection, then the server shall negotiate it against the supported version list, reply with a standard initialize result (`protocolVersion`, `capabilities`, `serverInfo`), and scope a per-connection session so that subsequent requests on that connection may omit the `_meta` declaration and inherit the negotiated version. Requests that carry an explicit `_meta` declaration keep FR-011 semantics unchanged; requests without any declaration on a connection without a completed handshake remain rejected per FR-011.（Clarified Decisions Q6，2026-11-17 维护者批准）

### Key Entities *(include if feature involves data)*

- **Domain**：治理域，稳定 slug，含 1..n 个 Department。
- **Department**：部门，稳定 slug、职责描述、路由关键词、所属 Domain。
- **RoutingDecision**：`primary`、`secondaries[]`、`confidence`、`matched_keywords[]`、`fallback` 标志。
- **ApprovalGate**：工具名、批准令牌来源（elicitation）、批准者角色、过期条件。
- **AuditRecord**：`trace_id`、UTC 时间戳、`actor`、`action`、`AIGC` 标注、掩码后的输入摘要。
- **ErrorCode**：`COMPANY_NNN`，含触发条件与处置建议；为唯一对外错误契约。
- **AcceptanceScenario**：`AT-NNN`，Given/When/Then 三段，关联 ≥1 个 FR。

## ATDD Acceptance Contract

ATDD 规则：下表每条 `AT-*` 在进入 `implement` 之前必须先写成**可执行且预期失败**的测试；测试转绿后方可声称该 FR 完成。AT-001~AT-012 现为 `GREEN`（2026-11-16，`/implement` 阶段测试全部通过，测试名含对应 `AT-NNN`）；AT-013 由 2026-11-17 的 FR-016 修订引入，按红灯先行规则独立提交后转绿。

| Scenario | Covers | Given / When / Then | Test layer | Status |
| --- | --- | --- | --- | --- |
| AT-001 | FR-001, FR-011 | Given stdio 客户端 / When `server/discover`、携带已发布历史版本的请求与非法版本请求 / Then `supportedVersions` 含 `2026-07-28` 与全部受支持历史版本，历史版本可协商，非法版本被拒绝并列出支持范围 | protocol conformance | GREEN |
| AT-002 | FR-002, FR-010 | Given stdio 与 Streamable HTTP 两种传输 / When 列出三类原语并调用同一工具 / Then 结果一致 | dual-transport | GREEN |
| AT-003 | FR-003 | Given 固定任务描述 / When 调用 `company.route` 100 次 / Then 字节级一致且零 LLM 调用 | determinism | GREEN |
| AT-004 | FR-004 | Given 五档 profile（micro/small/medium/large/group）/ When 分别以各档配置读取 `company://departments` / Then 每档域/部门 slug 完整可解析且部门数分别为 2/5/9/18/36 | registry | GREEN |
| AT-005 | FR-005 | Given 无匹配关键词的输入 / When 路由 / Then `fallback` + `confidence: 0` | negative path | GREEN |
| AT-006 | FR-006 | Given 网络被阻断的测试夹具 / When 跑完整 v0.1 套件 / Then 零连接、零写盘、零子进程 | sandbox | GREEN |
| AT-007 | FR-007 | Given 变更型工具 / When 无 elicitation 批准令牌 / Then 拒绝且不执行 | approval gate | GREEN |
| AT-008 | FR-008 | Given 已批准调用 / When 执行完成 / Then 产出含 trace_id 与 AIGC 标注的 `AuditRecord` | audit | GREEN |
| AT-009 | FR-009 | Given 默认只读模式 / When 调用变更型工具 / Then `COMPANY_003` 且零写入 | read-only | GREEN |
| AT-010 | FR-012 | Given 合规与断链两份 spec / When `company.spec.validate` / Then `pass` 与逐条 `fail` | contract | GREEN |
| AT-011 | FR-013 | Given `prompts/get` 请求 / When 取 `department-brief` / Then 无外部工具调用指令 | prompt template | GREEN |
| AT-012 | FR-014, FR-015 | Given 异常与含 PII 输入 / When 处理 / Then 稳定错误码 + 已掩码输出 | error & privacy | GREEN |
| AT-013 | FR-011, FR-016 | Given 握手时代宿主通过 stdio 连接 / When 发送 `initialize`（含合法/缺失/非法顶层 `protocolVersion`）并在握手完成后发送不带 `_meta` 声明的请求 / Then 合法版本返回标准 initialize 结果并建立会话，缺失或非法版本被拒绝，会话内无声明请求沿用协商版本，显式 `_meta` 声明与未握手连接的无声明请求行为不变 | protocol conformance | RED-PENDING |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**：`server/discover` + `tools/list` + `resources/list` + `prompts/list` 四次调用的冷启动 p95 < 200 ms（CI runner，无网络）。
- **SC-002**：同一 `company.route` 输入连续 100 次，`RoutingDecision` JSON 字节一致率 100%。
- **SC-003**：FR→AT 覆盖率 100%；每条 AT 在 `implement` 开始前存在一条预期失败的测试（ATDD 红灯门禁）。
- **SC-004**：v0.1 测试套件中出站网络连接数 = 0、LLM API 调用数 = 0、宿主文件系统写入数 = 0。
- **SC-005**：发布时 GitHub 社区规范清单（community profile checklist）达成率 100%。
- **SC-006**：实现阶段起，全部 AT 在 Windows / Linux / macOS CI 矩阵中通过（矩阵本身随 `plan` 阶段落地）。

## Assumptions

- 主目标宿主兼容 MCP `2026-07-28`；声明其他已发布历史版本的宿主按 FR-011 的协商语义接入。宿主负责 LLM 调用、用户同意 UI 与工具展示安全（本服务不重复实现）。
- v0.1 无持久化；审计仅随响应内存返回，不做持久化下沉，也不依赖宿主 append-only 日志（Clarified Decisions Q3）。
- v0.1 默认只读；任何写入必须显式批准（宪法级不可豁免）。
- 标识符（slug、错误码、字段名、枚举值、文件路径、函数名）恒为英文，永不翻译；产品对外文件用英文，工作文档可用中文。
- 尚无已发布版本；版本号从 `v0.1.0` 起按 SemVer 演进。
- 运行时与 SDK 已决：TypeScript + `@modelcontextprotocol/sdk`（Clarified Decisions Q1）；仓库为 `JohnSmithfan/ai-company-mcp`，CODEOWNERS 句柄 `JohnSmithfan`（Clarified Decisions Q4）。

## Clarified Decisions（2026-11-16，维护者逐项拍板，原 Open Questions Q1–Q5）

| 问题 | 决策 | 规格落点 |
| --- | --- | --- |
| **Q1** 运行时与 SDK | TypeScript + `@modelcontextprotocol/sdk`（引入 Node 运行时） | Assumptions；`/plan` 技术方案输入 |
| **Q2** 部门枚举范围 | 五档 size profile 全部内置：`micro`=2、`small`=5、`medium`=9、`large`=18、`group`=36 部门，经配置切换，默认 `micro` | FR-004 + AT-004 |
| **Q3** 审计下沉方式 | 仅内存随响应返回，不做持久化下沉 | FR-008 + Assumptions |
| **Q4** 仓库与联系渠道 | 仓库 `JohnSmithfan/ai-company-mcp`；CODEOWNERS 句柄 `JohnSmithfan`；CODE_OF_CONDUCT 联系渠道为「通过 GitHub 私信 / 报告内容功能私下联系维护者」 | Assumptions；`CODE_OF_CONDUCT.md`；`.github/CODEOWNERS` |
| **Q5** 协议兼容范围 | 兼容 MCP 官方全部已发布历史版本，按宿主声明进行协议版本协商；`2026-07-28` 为主目标 | Protocol Target + FR-001/011 + AT-001 |
| **Q6** 握手时代宿主兼容（2026-11-17 增补，维护者批准） | 真实宿主（VS Code MCP 客户端等同源 SDK 系）仍为握手时代：实测 SDK `Client` 发起 `initialize` 被无状态核心拒绝。批准新增 FR-016/AT-013：接受 `initialize` 握手并建立连接级会话，会话内无 `_meta` 声明请求沿用协商版本；显式声明与未握手连接语义不变 | FR-016 + AT-013 |

> 决策来源：项目维护者于 2026-11-16 对 Q1–Q5 逐项给出指令，AI 仅负责记录与落实，未自行拍板。

## Traceability to Research

| 决策 | 依据（竞品调研 §5） | 本规格落点 |
| --- | --- | --- |
| D1 | 薄层空位 | Non-goals + FR-001/002/006 |
| D2 | MCP 2026-07-28 无状态化 | FR-001/011 + AT-001 |
| D3 | 与三层互补 | FR-002/010/013 |
| D4 | 治理内建 | FR-007/008/014/015 |
| D5 | 规范契约产品化 | FR-012 + US3 |
| D6 | 安全默认 | FR-006/009 + AT-006 |
| D7 | License 与社区规范 | `LICENSE` + SC-005 |

## Definition of Done — SDD Step 1

- [x] 竞品调研完成，全部定量数据取自 A 级证据并标注快照日期。
- [x] `spec.md` 四段强制章节齐备（Scenarios / Requirements / Success Criteria / Assumptions）。
- [x] 每条 FR 至少关联一条 AT；ID 唯一；EARS + Given/When/Then 语法合规。
- [x] 非目标、边界条件、开放问题显式列出，未用臆造决策填空。
- [x] 开放问题 Q1–Q5 已由维护者拍板并记录于 Clarified Decisions（2026-11-16）。
- [x] AIGC 三层标注（可见标签 / 元数据 / 隐藏水印）与审计追踪 ID 就位。
- [x] 仓库契约门禁 `scripts/check_repo.py` + CI 通过（含反向验证）。
- [x] **人工评审签字**（由项目维护者完成，AI 不得代签）。

**下一步**：`/clarify` 已完成（Q1–Q5 已决，见 Clarified Decisions）→ `/plan` → `/tasks` → `/implement` → `/converge`。**本步骤不产生任何实现代码。**
