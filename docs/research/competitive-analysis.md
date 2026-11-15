# 竞品调研：AI 虚拟公司 × 通用 MCP / Agent SDK

<!-- AIGC-WM:AICOMPANYMCP-20261116-045201 -->

> **AIGC 标注（第 1 层 · 可见标签）**：本文由 AI 生成，须经人工复核后方可对外发布。
> **AI-generated content — human review required before publication.**

| 元数据（第 2 层） | 值 |
| --- | --- |
| 生成器 | WorkBuddy / Tencent Hunyuan Hy |
| 生成时间 | 2026-11-16 04:52 GMT+8 |
| 审计追踪 ID | `AICM-INTEL-20261116-045201` |
| 治理路由 | `intelligence-sentiment` (INTEL_) |
| 证据等级 | A = GitHub REST API / 官方文档；B = 二手评测（仅作趋势参考） |
| 复核状态 | 待人工复核 |
| 修订记录 | 2026-11-16：D7 许可证决策按维护者指令改为 `GPL-3.0-only`，见 §5 修订说明 |

## 1. 调研范围与方法

目标：为「框架无关的 AI 虚拟公司 MCP 插件」确定差异化定位，产出可回溯到规格说明书（SDD Step 1）的产品决策。

- 快照时间：2026-11-16；GitHub API 各仓 `updated_at` 多为 2026-11-15。
- A 级证据：逐仓调用 `https://api.github.com/repos/{owner}/{repo}`，取 `stargazers_count`、`license.spdx_id`、`pushed_at`、`open_issues_count`；MCP 能力取 `modelcontextprotocol.io` 官方文档；社区规范取 GitHub Docs；SDD 流程取 `github/spec-kit` README 与 `templates/spec-template.md`；EARS 语法取 Mavin 官方站。
- B 级证据：星标历史、市场份额、CVE 统计、闭源大厂动向。二手来源口径互相矛盾（Paperclip 星标 33K/83K/91K、The Agency 40K/77K/119K），**一律不用于横向排序、不写入 README**，只用于判断趋势。
- PII：文档不含个人邮箱、真实姓名或本机绝对路径；owner 统一用 `{OWNER}` 占位。

## 2. 三层格局（先分清谁在跟谁竞争）

| 层 | 解决的问题 | 代表项目 | 竞争状态 |
| --- | --- | --- | --- |
| 连接层 | Agent 如何调用工具 | MCP（纵向）、A2A（横向） | 已定局，MCP 为事实标准 |
| 编排层 | 任务如何拆解、状态如何流转 | LangGraph / CrewAI / OpenAI Agents SDK / mcp-agent | 已整合，无新头部机会 |
| 组织层 | 谁汇报给谁、谁批准、谁负责 | Paperclip、The Agency、trinity、本项目 | 早期，格局未定 |

跨层误判是最大风险：MCP 解决不了编排，组织层工具也不该充当 Agent 运行时。本项目定位**连接层之上、编排层之下的「治理协议层」**，与三层均不正面竞争。

## 3. 竞品明细（A 级 · GitHub API 快照 2026-11-16）

| 项目 | 层 | Stars | License | 最后推送 | 形态 | 治理 | MCP | 关键弱点 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| `msitarzewski/agency-agents` | 组织·角色库 | 168,442 | MIT | 2026-11-09 | 12 部门 / 147 个 Markdown 人格文件 | 无 | 无 | 纯 prompt 库，零运行时、零审批、零测试 |
| `github/spec-kit` | 方法论 | 149,890 | MIT | 2026-11-12 | SDD CLI + 模板 | 无 | 无 | 只管开发流程，不提供公司能力（作为规范参照，非直接竞品） |
| `paperclipai/paperclip` | 组织·控制平面 | 114,063 | MIT | 2026-11-15 | Node.js + React + 内嵌 PG，自托管 | 预算硬停、董事会审批、审计日志、多公司隔离 | 支持 | 部署重；6,710 open issues，维护压力大；无轻量协议入口 |
| `FoundationAgents/MetaGPT` | 软件公司模拟 | 71,281 | MIT | 2026-01-21 | SOP 流水线 PRD→设计→代码 | 人工交接点 | 弱 | 近 10 个月无推送；只做软件工程，非通用公司 |
| `bmad-code-org/BMAD-METHOD` | 敏捷方法论 | 55,393 | NOASSERTION（官网称 MIT） | 2026-11-15 | 12+ 专家 Agent + 50+ 工作流 | 规格门禁 | 无 | 安装进宿主仓库的技能包，非协议；License 口径不一致 |
| `OpenBMB/ChatDev` | 软件公司模拟 | 34,746 | Apache-2.0 | 2026-11-06 | ChatDev 2.0：YAML 图编排 | 阶段评审 | 弱 | 仍面向代码生成，且需自建运行时 |
| `lastmile-ai/mcp-agent` | 编排层 | 8,579 | Apache-2.0 | 2026-01-25 | MCP 工作流模式库 | 无 | 原生 | 近 10 个月无推送；不含组织/治理语义 |
| `Abilityai/trinity` | 组织·平台 | 775 | Apache-2.0 | 2026-11-15 | 自托管 Agent 平台，topics 含 `mcp-server`/`ai-governance` | 角色、汇报线、指标、审批 | 有 | 824 open issues；仍是完整平台而非可嵌入薄层 |
| `JohnSmithfan/AI-Company`（同源基线） | 组织·技能包 | 0 | NOASSERTION | 2026-10-27 | 18 部门 / 7 域 / 117 错误码的 WorkBuddy skill | 治理层 13 文件 | 无 | 绑定特定宿主；`SKILL.md` 声明 GPL-3.0 但 GitHub 未检出 LICENSE 文件 |

**关键发现（同源基线）**：基线仓库 API `license.spdx_id = NOASSERTION`，而 `SKILL.md` frontmatter 写 `GPL-3.0`。GitHub 社区规范不认 frontmatter 声明，**基线仓库需补 `LICENSE` 文件**，否则社区档案无许可证标识。新项目自带完整 `LICENSE` 落地规避此问题；2026-11-16 起该文件为 GNU GPL v3 逐字文本，与基线 frontmatter 的版本口径一致。

## 4. 规范基线（A 级）

- **MCP `2026-07-28`**（官方架构文档）：协议无状态化，移除 `initialize` 握手；`server/discover` 为服务端必须实现；每个请求在 `_meta` 携带 `protocolVersion` / `clientInfo` / `capabilities`；服务端原语仅 **tools / resources / prompts**；客户端原语 elicitation 保留，**sampling、logging 已弃用**；传输为 stdio 与 Streamable HTTP；Tasks 扩展承载长时任务；推荐 OAuth 获取令牌。
- **GitHub 社区规范**（GitHub Docs）：支持 `CODE_OF_CONDUCT.md`、`CONTRIBUTING.md`、`SUPPORT.md`、`SECURITY.md`、`ACCESSIBILITY.md`、`FUNDING.yml`、`VULNERABILITY_REPORT.yml`、issue/PR 模板与 `config.yml`；查找优先级 `.github/` > 根目录 > `docs/`；**LICENSE 不能继承默认文件，必须每仓自带**；`.yml` issue form 必须含合法 `name:` 与 `description:`。
- **SDD**（`github/spec-kit` README）：`constitution`（每项目一次）→ `specify` → `plan` → `tasks` → `implement` → `converge`；`clarify`/checklist/一致性分析属 walkthrough 补充。`spec-template.md` 强制四段：User Scenarios & Testing、Requirements、Success Criteria、Assumptions，验收场景用 Given/When/Then。
- **EARS**（Mavin 官方）：`While <precondition>, when <trigger>, the <system> shall <response>`；五类模式 Ubiquitous / State-driven(`While`) / Event-driven(`When`) / Optional(`Where`) / Unwanted(`If … then`)。

## 5. 空白与产品决策（→ 规格说明书 FR）

| ID | 竞品空白 | 产品决策 | 回溯 |
| --- | --- | --- | --- |
| D1 | 组织层要么重平台（Paperclip/trinity），要么纯文件（The Agency） | 只做**薄 MCP Server**：无 UI、无 DB、无 Agent 运行时、无 LLM 调用 | FR-001/002/006 |
| D2 | 多数实现基于旧 MCP 握手 | 直接对齐 `2026-07-28` 无状态版，强制 `server/discover` 与版本拒绝语义 | FR-001/011 |
| D3 | 角色库与控制平面互补，却无协议层把它们接起来 | 以 tools/resources/prompts 暴露治理能力，可与 Paperclip、The Agency、LangGraph 组合 | FR-002/010/013 |
| D4 | 轻量方案普遍缺审批、审计、错误码、AIGC 标注 | 审批门 + 审计记录 + 稳定错误码 + AIGC 三层标注 + PII 掩码 | FR-007/008/014/015 |
| D5 | 无人把 SDD/ATDD 契约做成可调用能力 | 提供 `company.spec.validate`，校验章节、FR→AT 追溯、ID 唯一性 | FR-012 |
| D6 | MCP 生态存在命令注入 / 工具描述诱导 / 凭据转发等系统性风险（B 级） | 默认只读、零网络出口、零 telemetry、零凭据、零子进程 | FR-006/009 |
| D7 | 主流为 MIT / Apache-2.0；治理协议层需以强 copyleft 保证衍生改进保持开放 | 采用 **`GPL-3.0-only`**（GNU GPL v3，不授予 `or later`），并一次配齐 GitHub 社区规范文件 | 仓库治理 / SC-005 |

> **决策修订说明（2026-11-16）**：D7 初稿选 Apache-2.0（理由为专利授权与商标条款）。维护者随后指定 GNU GPL v3，现行为 `GPL-3.0-only`；`LICENSE` 已替换为 FSF 官方逐字文本，README（中英）、`CONSTITUTION.md` §6 与修订记录、`CONTRIBUTING.md`、`AGENTS.md`、`CHANGELOG.md` 及 CI 契约门禁同步更新。§3 的竞品许可证数据属于 2026-11-16 API 快照，**不随本项目决策改变**；D1–D6 与 FR 追溯均不变。变更依据见 `CHANGELOG.md`。

## 6. 风险与待验证项

| ID | 风险 | 处置 |
| --- | --- | --- |
| R1 | MCP 实现层安全负债（二手称 2026 初 40+ CVE、大量暴露 server） | 仅作设计输入；发布前用一手 CVE/NVD 数据复核，默认只读与无网络写入宪法 |
| R2 | 协议演进快（2026-07-28 无状态化） | 明确支持版本清单，旧版兼容列为 `/clarify` 开放问题 Q5 |
| R3 | 组织层可能被大厂运行时吸收（B 级） | 保持框架无关、无状态、可替换；不绑定任何模型厂商 |
| R4 | 二手星标 / 市场规模互相矛盾 | 不写入产品文档；仅保留本表 API 快照 |
| R5 | BMAD 官网称 MIT、API 为 NOASSERTION | 引用时标注口径差异 |
| R6 | 同源基线 License 声明与仓库不一致 | 已列入基线仓库待办；新项目自带 `LICENSE` 不受影响，且现行 `GPL-3.0-only` 与基线 frontmatter 版本口径一致 |
| R7 | 新仓库 `{OWNER}/{REPO}`、维护者联系方式未定 | 发布前检查清单统一填写，禁止臆造邮箱 / 徽章 URL |
| R8 | GPLv3 强 copyleft 对「作为库被集成」的合规边界存在法律不确定性 | README 明示：仅通过 MCP 协议交互的客户端不自动适用，是否构成单一衍生作品由集成方自行评估；本调研不作法律结论 |

## 7. 结论

赛道已分层，**组织层最拥挤的空位是「可嵌入的治理协议层」**：不抢运行时、不抢角色库、不抢控制平面，而是把部门路由、治理门禁、审计与规范契约做成任何 MCP 宿主都能调用的原语，并用 SDD + ATDD 把「规格即契约」内建为产品能力。该定位与全部 9 个调研对象均互补大于竞争。

下一步：按 SDD 进入 **Step 1 `specify`**，产物 `specs/001-core-mcp-server/spec.md`；D1–D7 已回溯至该文档的 FR 条目。

## 8. 来源（A 级除非标注）

1. GitHub REST API 各仓 `/repos/{owner}/{repo}`（2026-11-16 快照）
2. https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture
3. https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories
4. https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file
5. https://raw.githubusercontent.com/github/spec-kit/main/README.md 与 `templates/spec-template.md`
6. https://alistairmavin.com/ears/（EARS 官方）
7. https://www.bmadcode.com/method（License 口径，B 级）
8. 多源委托调研汇总（市场数据、CVE 统计、大厂动向，B 级，仅作趋势判断）
9. https://www.gnu.org/licenses/gpl-3.0.txt（FSF 官方逐字文本，2026-11-16 获取，仅用于本项目 `LICENSE`）
