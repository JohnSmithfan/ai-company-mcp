# ai-company-mcp

**A thin, protocol-first governance layer for AI virtual companies, exposed as an MCP server.**

> **Status: SDD Step 1 — specification only.** No server implementation exists yet.
> Read [the spec](specs/001-core-mcp-server/spec.md) before proposing changes.
> [简体中文说明](README.zh.md)

## What this is

An MCP server that turns a virtual company's governance — department routing,
approval gates, audit records, and specification contracts — into standard MCP
primitives (`tools`, `resources`, `prompts`). Any MCP-compatible host can use it.
No agent runtime, no UI, no database, no LLM calls, no vendor lock-in.

The AI agent ecosystem has three layers. This project sits between them:

| Layer | Concern | Examples | This project |
| --- | --- | --- | --- |
| Connectivity | How agents call tools | MCP, A2A | Speaks MCP `2026-07-28` |
| Orchestration | How tasks and state flow | LangGraph, CrewAI, Agents SDK | Not an orchestrator |
| Organization | Who reports to whom, who approves | Paperclip, The Agency, trinity | A composable governance protocol layer |

**Complementary, not a replacement.** Use The Agency for role personas, Paperclip
for a full control plane, LangGraph for orchestration. Use this project when a
host needs the governance semantics themselves, without adopting a platform.

## Why another project

Competitor research (snapshot 2026-11-16, verified against the GitHub REST API)
is in [docs/research/competitive-analysis.md](docs/research/competitive-analysis.md).
The short version: the organization layer is either a heavy self-hosted app or a
folder of Markdown personas. Neither ships a lightweight, testable, protocol-level
governance contract. SDD + ATDD are first-class here: the spec is the contract,
and `company.spec.validate` will make that contract callable.

## Repository map

| Path | Purpose |
| --- | --- |
| `CONSTITUTION.md` | Non-negotiable project principles (SDD Step 0) |
| `docs/development-method.md` | SDD phases, ATDD red-first loop, EARS/GWT grammar, traceability |
| `docs/research/competitive-analysis.md` | Competitor landscape and product decisions D1–D7 |
| `specs/001-core-mcp-server/spec.md` | **SDD Step 1 deliverable** — feature specification |
| `scripts/check_repo.py` | CI contract gate: community files, encoding, FR→AT traceability |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md` | GitHub community health files |
| `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md` | Contribution templates |

## Development workflow

Spec-Kit-compatible SDD phases:

```
constitution -> specify -> clarify -> plan -> tasks -> implement -> converge
                 ^ you are here
```

Every functional requirement `FR-*` maps to at least one acceptance scenario
`AT-*`. Each `AT-*` must exist as a **failing executable test before implementation**.
See [docs/development-method.md](docs/development-method.md).

Run the repository contract gate locally:

```bash
python -B scripts/check_repo.py --root .
```

No runtime, package manager, or credentials are needed for this step.

## Before publishing to GitHub

Replace these placeholders; do not invent values:

- `{OWNER}/{REPO}` in badges, links, and issue/PR templates.
- `[MAINTAINER_CONTACT]` in `CODE_OF_CONDUCT.md`.
- Add `.github/CODEOWNERS` with the real maintainer handle.
- Enable GitHub Discussions (referenced by `SUPPORT.md`) and private vulnerability reporting (referenced by `SECURITY.md`).
- Add CI/status badges after the first successful workflow run.

GitHub community profile checklist requires: `README.md`, `LICENSE`,
`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, valid issue templates and
a pull request template. `SUPPORT.md` and `CHANGELOG.md` are included as well.
`LICENSE` cannot be inherited from a default `.github` repository — it lives here.

## License

[Apache-2.0](LICENSE). Chosen for its explicit patent grant and trademark terms,
which matter for a governance component intended for enterprise use.

Documents under `docs/` and `specs/` carry AI-generation disclosures and audit
trace IDs; they require human review before being treated as decisions.
