# ai-company-mcp

**A thin, protocol-first governance layer for AI virtual companies, exposed as an MCP server.**

> **Status: SDD Step 6 — converge round 1: all 12 `AT-*` tests green locally with full traceability; awaiting first CI run after push (`Converged` pending external evidence).** Run `npm install`, `npm test`; see [the convergence report](specs/001-core-mcp-server/convergence-report.md).
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
| Connectivity | How agents call tools | MCP, A2A | Speaks MCP `2026-07-28` (primary target) with negotiation for all published historical versions |
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
| `specs/001-core-mcp-server/plan.md` | **SDD Step 3 deliverable** — implementation plan (architecture, decisions, risks) |
| `specs/001-core-mcp-server/tasks.md` | **SDD Step 4 deliverable** — task breakdown, each task naming its `AT-*` |
| `specs/001-core-mcp-server/convergence-report.md` | **SDD Step 6 deliverable** — convergence report (traceability, SC evidence, pending items) |
| `scripts/check_repo.py` | CI contract gate: community files, encoding, FR→AT traceability |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md` | GitHub community health files |
| `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md` | Contribution templates |
| `.github/CODEOWNERS` | Code ownership (maintainer `@JohnSmithfan`) |

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

The repository will be published as `JohnSmithfan/ai-company-mcp`; the maintainer
contact channel (GitHub private contact, `@JohnSmithfan`) and `.github/CODEOWNERS`
were settled on 2026-11-16 (see the spec's Clarified Decisions). Remaining items:

- [x] Fill the maintainer contact channel in `CODE_OF_CONDUCT.md` (2026-11-16).
- [x] Add `.github/CODEOWNERS` with the real maintainer handle (2026-11-16).
- [ ] Enable GitHub Discussions (referenced by `SUPPORT.md`) and private vulnerability reporting (referenced by `SECURITY.md`).
- [ ] Add CI/status badges after the first successful workflow run.

GitHub community profile checklist requires: `README.md`, `LICENSE`,
`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, valid issue templates and
a pull request template. `SUPPORT.md` and `CHANGELOG.md` are included as well.
`LICENSE` cannot be inherited from a default `.github` repository — it lives here.

## License

**GNU General Public License v3.0 or later** (SPDX: `GPL-3.0-or-later`).
The verbatim FSF text of version 3 is in [LICENSE](LICENSE). You may use and
redistribute this project under GPLv3 or, at your option, any later version of
the GNU GPL published by the Free Software Foundation.

GPLv3 is a strong copyleft license. In practical terms:

- If you distribute a modified or derived version, the whole derived work must
  be licensed under GPLv3 and you must provide its complete corresponding
  source code.
- Contributions are accepted under the same terms (inbound = outbound); there
  is no CLA or copyright assignment. See [CONTRIBUTING.md](CONTRIBUTING.md).
- A client that merely talks to this server over MCP is not automatically
  covered by this license. Whether a specific integration forms a single
  derived work is a legal question this project does not decide; seek your own
  advice before shipping a combined distribution.

The "How to Apply These Terms" boilerplate at the end of `LICENSE` is the FSF's
generic template. This section states the project's actual grant: the `or later`
option is granted here, not by editing `LICENSE` (the GPL forbids changing the
license document). GitHub's community profile detects the GPLv3 family from the
unmodified `LICENSE`; the SPDX expression above is authoritative for the
version option.

Documents under `docs/` and `specs/` carry AI-generation disclosures and audit
trace IDs; they require human review before being treated as decisions.
