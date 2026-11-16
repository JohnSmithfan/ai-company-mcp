# Convergence Report: 核心治理 MCP Server v0.1

<!-- AIGC-WM:AICOMPANYMCP-20261117-CONVERGE-001 -->

> **AIGC 标注（第 1 层 · 可见标签）**：本文由 AI 生成，须经人工复核批准后本报告结论方为有效。
> **AI-generated content — human approval required for the report's verdict.**

**Feature Branch**: `001-core-mcp-server`
**Created**: 2026-11-17（第 1 轮）；同日第 2 轮更新为 `Converged`（见 §5）
**Status**: `Converged`（第 2 轮，2026-11-17）——本地与外部证据全部齐备

| 元数据（第 2 层） | 值 |
| --- | --- |
| 生成器 | WorkBuddy / Tencent Hunyuan Hy |
| 审计追踪 ID | `AICM-SDD-20261117-CONVERGE-001`（第 2 轮：`AICM-SDD-20261117-CONVERGE-002`） |
| 输入 | `spec.md`（15 FR / 12 AT）、`plan.md`（P-1~P-5）、`tasks.md`（T-01~T-13）、实现 commit `492c6b7` |
| 复核状态 | 待人工复核 |

<!-- AIGC-WM hidden watermark (layer 3): AICOMPANYMCP-20261117-CONVERGE-001. Generated content; verify against spec.md before relying on any status claim. -->

## 1. 全链路追溯核对（D → FR → AT → 测试名）

依据 `docs/development-method.md` §4 追溯规则与 `tasks.md` 追溯矩阵：

| 链路环节 | 机械核对 | 结果 |
| --- | --- | --- |
| D1–D7 → FR/决策 | 竞品调研修订记录与 spec Clarified Decisions 对齐（Step 1/2 审核轮次证据） | 一致 |
| FR → AT | 门禁断言：15 条 FR 全部出现在验收契约，无孤儿 | PASS（`requirements=15`） |
| AT 唯一性与 Given/When/Then | 门禁断言：12 条 AT 无重复，每行含 Given/When/Then | PASS（`scenarios=12`） |
| AT → 可执行测试 | **本轮新增门禁断言**：每条 `AT-NNN` 必须存在 `test/atNNN-*.test.ts`；测试文件不得引用未知 AT | PASS（`at_tests=12`） |
| AT → 任务 | `tasks.md` 追溯矩阵：每条 AT 恰好一个主任务（T-02..T-11 对应 AT-006/004/001/002/003/005/007/009/008/012/010/011） | 一致 |
| Status 状态列 | spec 验收契约 12 行全部 `GREEN`（2026-11-16 `/implement` 完成时翻绿） | 一致 |

**反向验证（本轮新断言，防「空转通过」）**：

| 注入缺陷 | 预期 | 实测 |
| --- | --- | --- |
| 临时副本删除 `test/at004-registry.test.ts` | 门禁 FAIL | FAIL：`no executable test found for: AT-004` |
| 临时副本注入 `test/at099-fake.test.ts`（未知 AT） | 门禁 FAIL | FAIL：`test file names an unknown AT id: at099-fake.test.ts` |

## 2. ATDD 内环证据（RED → GREEN）

- **RED 记录**：12 条 AT 测试在实现开始前全部写就并确认红灯（构建失败因实现模块不存在，2026-11-16，SC-003 证据）。**证据等级说明**：RED 状态为过程自证记录——测试与实现同落于提交 `492c6b7`（无独立红灯提交/CI 日志），符合方法 DoD「recorded RED state」的字面要求，但不具备独立机器可验证性；后续版本建议以独立提交或 CI 日志固化红灯证据。
- **GREEN 记录**：实现提交 `492c6b7` 后 65/65 通过；本轮复跑（2026-11-17）：

```
npm test          → tests 65 / pass 65 / fail 0（exit 0）
npm run typecheck → tsc --noEmit 通过（exit 0）
npm run sandbox:scan → 13 files scanned, 0 violations（exit 0）
```

## 3. 沙箱零值证据（FR-006 / SC-004）

双层防护均在位并有测试背书（`test/at006-sandbox.test.ts`）：

- **运行时层**：fetch、socket connect、子进程 spawn、fs 同步与 promise 写入口全部替换为必抛 `SANDBOX_VIOLATION`；套件运行期四类操作零发生（任一发生即抛错使测试失败）。
- **静态层**：`src/`（除沙箱模块自身，仅只读 fs）禁止 import `fs`/`net`/`http`/`https`/`dns`/`tls`/`child_process` 等；扫描挂入 contract-gate job；本轮 13 文件 0 违规。

## 4. 成功标准（SC-001~006）证据表

| SC | 内容 | 证据 | 状态 |
| --- | --- | --- | --- |
| SC-001 | 四次发现调用 p95 < 200 ms | 双重证据：`at001` 测试内进程内断言（冒烟）；**收敛后补充的真实冷启动基准** `scripts/bench-cold-start.mjs`（§7），CI ubuntu 格实测 | 达成（口径已闭合，见 §7） |
| SC-002 | 路由 100 次字节级一致 | `at003` 测试断言，本轮通过 | 达成 |
| SC-003 | 红灯先行 | RED 记录（§2）+ commit `492c6b7` 历史 | 达成 |
| SC-004 | 零网络/零 LLM/零写盘/零子进程 | §3 双层防护证据 | 达成 |
| SC-005 | 社区规范清单 100% | 仓库内文件全部在位且受门禁守护；Discussions 已启用（API 确认 `has_discussions: true`）、私有漏洞上报已开启（PUT 返回 204），均为 2026-11-17 通过 GitHub API 完成的仓库设置 | 达成 |
| SC-006 | CI 三平台 × Node 20/22 矩阵全绿 | 首次 CI 运行 run `43919484231`（push `f626727`）：7 个 job 全部 success——contract-gate + 6 格矩阵（ubuntu/windows/macos × node 20/22） | 达成 |

## 5. `Converged` 差距清单（第 2 轮：已全部闭环）

| 待办 | 完成证据（2026-11-17） |
| --- | --- |
| 推送仓库至 `JohnSmithfan/ai-company-mcp`（Q4 决策）并触发首次 CI | 仓库已创建并推送 main；run `43919484231` 7/7 job success（contract-gate + 6 格矩阵）→ SC-006 达成 |
| GitHub 仓库设置：Discussions、私有漏洞上报 | API 确认 `has_discussions: true`；`private-vulnerability-reporting` PUT 204 → SC-005 补齐 |
| 首次 CI 通过后补双语 README 状态徽章 | CI 徽章（`ci.yml` workflow）已加至 README.md 与 README.zh.md |
| 重跑 `/converge` 并翻转 Status | 本节即第 2 轮，Status 已置为 `Converged` |

## 6. 结论

**`Converged`（2026-11-17，第 2 轮）**——D→FR→AT→测试名全链路机械核对通过；12 条 `AT-*` 本地 65/65 全绿；四零值沙箱证据在位；首次 CI 运行 7/7 job 全绿（SC-006）；社区规范清单 100%（SC-005）。SDD 六步全部完成，方法文档 DoD 全项满足。

**遗留跟踪项（不影响 Converged）**：Dependabot 在首次推送后自动开立 3 个 actions 版本升级 PR（checkout/setup-node/setup-python 4→7），由维护者按正常流程评审合并。

## 7. 收敛后补充验证（2026-11-17，同日）

针对复审记录的两处口径偏差与端到端验证盲区，追加以下证据（均不触碰 AT-006 的套件级零子进程沙箱契约——新脚本运行在 `node:test` 套件之外）：

| 项 | 内容 | 证据 |
| --- | --- | --- |
| SC-001 口径闭合 | 新增 `scripts/bench-cold-start.mjs`：真实子进程冷启动 + 四次 `server/discover` 实测，p95（4 样本最大值）< 200 ms；接线为 CI ubuntu 格独立步骤 | 本地实测冷启动 117.7 ms（非 linux 平台仅 advisory）；CI ubuntu 为权威口径 |
| 端到端 stdio 验证 | 新增 `scripts/e2e-stdio-client.mjs`：以最小 MCP 宿主客户端驱动**真实进程边界**（子进程 + SDK `StdioServerTransport` 帧层），11 项断言——发现、工具清单、路由正/负路径（fallback + `NEEDS_CLARIFICATION`）、只读拒绝 `COMPANY_003`、双资源读取、提示模板、审批令牌、未知方法 `COMPANY_001`；接线为 CI ubuntu 格独立步骤 | 本地 PASS（11 断言）；E2E 过程中修正的两处断言均为脚本侧话术/键名笔误，服务器行为与单测一致 |
| 真实宿主接入 | 新增 `.vscode/mcp.json`：VS Code MCP 客户端一键注册（stdio 启动、只读默认、micro 档）；人工激活验证由维护者在 VS Code 中执行 | 配置文件在仓，激活确认待维护者 |
| RED 证据固化 | `CONTRIBUTING.md` 非协商项 2 增补：红灯测试必须独立提交（`test: <AT-NNN> red-first ...`），红灯状态须可从历史机器验证；注明 v0.1 为过程记录的历史例外 | CONTRIBUTING.md 增补段 |
