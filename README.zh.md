# ai-company-mcp

**把「AI 虚拟公司」的治理能力做成一个薄薄的 MCP Server。**

> **当前状态：SDD 第 1 步 — 只有规格说明书，尚无实现代码。**
> 修改前请先读 [spec.md](specs/001-core-mcp-server/spec.md)。
> [English README](README.md)

## 这个项目是什么

一个符合 MCP 协议的服务，把虚拟公司的**部门路由、审批门禁、审计记录、规范契约**暴露为标准 MCP 原语（`tools` / `resources` / `prompts`）。任何 MCP 宿主都能接入。

不做：Agent 运行时、编排引擎、UI、数据库、LLM 调用、厂商绑定。

| 层 | 解决什么 | 代表项目 | 本项目 |
| --- | --- | --- | --- |
| 连接层 | Agent 如何调工具 | MCP、A2A | 采用 MCP `2026-07-28` |
| 编排层 | 任务与状态如何流转 | LangGraph、CrewAI、Agents SDK | 不做编排 |
| 组织层 | 谁汇报、谁批准、谁负责 | Paperclip、The Agency、trinity | 可组合的治理协议层 |

**互补而非替代**：角色人格用 The Agency，完整控制平面用 Paperclip，编排用 LangGraph；本项目只提供治理语义本身。

## 竞品调研

完整报告见 [docs/research/competitive-analysis.md](docs/research/competitive-analysis.md)，数据为 2026-11-16 的 GitHub REST API 快照（A 级证据）。结论：组织层要么是重型自托管应用，要么是一堆 Markdown 人格文件，中间缺一层轻量、可测试、协议化的治理契约。

## 开发规范

```
constitution -> specify -> clarify -> plan -> tasks -> implement -> converge
                 ^ 当前在第 1 步
```

SDD：规格是契约，先写规格再写实现。ATDD：每条 `FR-*` 至少对应一条 `AT-*`，每条 `AT-*` 在实现前必须是**预期失败的可执行测试**。详见 [docs/development-method.md](docs/development-method.md)。

本地跑仓库契约门禁（无需安装依赖、无需凭据）：

```bash
python -B scripts/check_repo.py --root .
```

## 发布前待办

- 把徽章、模板中的 `{OWNER}/{REPO}` 换成真实值（不要臆造）。
- 填写 `CODE_OF_CONDUCT.md` 中的 `[MAINTAINER_CONTACT]`。
- 新增 `.github/CODEOWNERS`，写入真实维护者句柄。
- 启用 GitHub Discussions 与私有漏洞上报通道。
- 首次 CI 通过后补状态徽章。

GitHub 社区规范清单要求：`README.md`、`LICENSE`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、合法的 issue 模板与 PR 模板；`LICENSE` 不能从默认 `.github` 仓库继承，必须本仓自带。

## 许可证

**GNU 通用公共许可证第 3 版，仅该版本**（SPDX: `GPL-3.0-only`）。FSF 官方逐字文本见 [LICENSE](LICENSE)；**未授予 "or later"（或更高版本）选项**。

GPLv3 属于强 copyleft：分发修改版或衍生作品时，整体须以 GPLv3 授权并提供完整对应源码；贡献按同一许可证接收（inbound = outbound），无 CLA、无著作权转让，详见 [CONTRIBUTING.md](CONTRIBUTING.md)；仅通过 MCP 协议与本服务交互的客户端并不因此自动适用本许可证，某个集成是否构成单一衍生作品属法律判断，本项目不作保证，发布组合分发前请自行评估。`LICENSE` 末尾的 "How to Apply These Terms" 是 FSF 通用模板，不是本项目的额外授权。

`docs/` 与 `specs/` 下的文档带有 AIGC 标注与审计追踪 ID，需人工复核后方可作为决策依据。
