# ai-company-mcp

**把「AI 虚拟公司」的治理能力做成一个薄薄的 MCP Server。**

> **当前状态：SDD 第 6 步 — 第 1 轮收敛：12 条 `AT-*` 测试本地全绿、追溯全链路机械核对通过；待推送后首次 CI 运行（`Converged` 差距仅为外部证据）。** 运行 `npm install`、`npm test`；详见[收敛报告](specs/001-core-mcp-server/convergence-report.md)。
> 修改前请先读 [spec.md](specs/001-core-mcp-server/spec.md)。
> [English README](README.md)

## 这个项目是什么

一个符合 MCP 协议的服务，把虚拟公司的**部门路由、审批门禁、审计记录、规范契约**暴露为标准 MCP 原语（`tools` / `resources` / `prompts`）。任何 MCP 宿主都能接入。

不做：Agent 运行时、编排引擎、UI、数据库、LLM 调用、厂商绑定。

| 层 | 解决什么 | 代表项目 | 本项目 |
| --- | --- | --- | --- |
| 连接层 | Agent 如何调工具 | MCP、A2A | 采用 MCP `2026-07-28`（主目标），并协商兼容全部已发布历史版本 |
| 编排层 | 任务与状态如何流转 | LangGraph、CrewAI、Agents SDK | 不做编排 |
| 组织层 | 谁汇报、谁批准、谁负责 | Paperclip、The Agency、trinity | 可组合的治理协议层 |

**互补而非替代**：角色人格用 The Agency，完整控制平面用 Paperclip，编排用 LangGraph；本项目只提供治理语义本身。

## 竞品调研

完整报告见 [docs/research/competitive-analysis.md](docs/research/competitive-analysis.md)，数据为 2026-11-16 的 GitHub REST API 快照（A 级证据）。结论：组织层要么是重型自托管应用，要么是一堆 Markdown 人格文件，中间缺一层轻量、可测试、协议化的治理契约。

## 开发规范

```
constitution -> specify -> clarify -> plan -> tasks -> implement -> converge
                                                                    ^ 当前在第 6 步（第 1 轮收敛）
```

SDD：规格是契约，先写规格再写实现。ATDD：每条 `FR-*` 至少对应一条 `AT-*`，每条 `AT-*` 在实现前必须是**预期失败的可执行测试**。详见 [docs/development-method.md](docs/development-method.md)。

本地跑仓库契约门禁（无需安装依赖、无需凭据）：

```bash
python -B scripts/check_repo.py --root .
```

## 发布前待办

仓库将发布为 `JohnSmithfan/ai-company-mcp`；维护者联系渠道（GitHub 私信 / 报告内容功能私下联系 `@JohnSmithfan`）与 `.github/CODEOWNERS` 已于 2026-11-16 确定（详见规格说明书 Clarified Decisions）。剩余待办：

- [x] 填写 `CODE_OF_CONDUCT.md` 维护者联系渠道（2026-11-16）。
- [x] 新增 `.github/CODEOWNERS`，写入真实维护者句柄（2026-11-16）。
- [ ] 启用 GitHub Discussions 与私有漏洞上报通道。
- [ ] 首次 CI 通过后补状态徽章。

GitHub 社区规范清单要求：`README.md`、`LICENSE`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、合法的 issue 模板与 PR 模板；`LICENSE` 不能从默认 `.github` 仓库继承，必须本仓自带。

## 许可证

**GNU 通用公共许可证第 3 版或任何更高版本**（SPDX: `GPL-3.0-or-later`）。[LICENSE](LICENSE) 为 FSF 官方 GPLv3 逐字文本；你可按 GPLv3 使用与再分发，也可自行选择 FSF 后续发布的任何 GNU GPL 版本。

GPLv3 属于强 copyleft：分发修改版或衍生作品时，整体须以 GPLv3 授权并提供完整对应源码；贡献按同一许可证接收（inbound = outbound），无 CLA、无著作权转让，详见 [CONTRIBUTING.md](CONTRIBUTING.md)；仅通过 MCP 协议与本服务交互的客户端并不因此自动适用本许可证，某个集成是否构成单一衍生作品属法律判断，本项目不作保证，发布组合分发前请自行评估。`LICENSE` 末尾的 "How to Apply These Terms" 是 FSF 通用模板；本项目的版本授权由本节声明，而非改动 `LICENSE` 文本（GPL 禁止改动许可证文档）。GitHub 社区档案据未经改动的 `LICENSE` 识别为 GPLv3 系列，版本选项以上方 SPDX 表达式为准。

`docs/` 与 `specs/` 下的文档带有 AIGC 标注与审计追踪 ID，需人工复核后方可作为决策依据。
