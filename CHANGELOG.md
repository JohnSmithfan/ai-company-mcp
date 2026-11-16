# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- SDD Step 3: `specs/001-core-mcp-server/plan.md` — architecture layers,
  data design (five-profile department registry), key mechanisms
  (deterministic routing, elicitation approval gate, in-memory audit,
  PII masking, error-code contract), FR→component and AT→test-layer
  mappings, sandbox fixture strategy, and risk register. Awaiting human
  architecture review before `/tasks`.
- Technical decisions (maintainer instruction, 2026-11-16): runtime
  support targets Node 20 LTS + 22 LTS (`engines >=20 <23`); executable
  tests use `node:test` + `node:assert` with zero third-party test
  dependencies; v0.1 ships source-only (no npm publication; clone +
  build). The protocol-version list in the plan is sourced from the
  official MCP Versioning page (snapshot 2026-11-16): `2024-11-05`,
  `2025-03-26`, `2025-06-18`, `2025-11-25` (Final) and `2026-07-28`
  (Current); drafts are excluded.
- SDD Step 0: `CONSTITUTION.md` with seven non-negotiable principles.
- SDD Step 1: `specs/001-core-mcp-server/spec.md` — 15 `FR-*`, 12 `AT-*`,
  three prioritized user stories, and success criteria (open questions Q1–Q5
  later clarified; see Changed).
- Competitor research at `docs/research/competitive-analysis.md` (GitHub API
  snapshot 2026-11-16) with decisions D1–D7 traced into the specification.
- `docs/development-method.md` — SDD phases, ATDD red-first loop, EARS/GWT
  grammar, traceability rules, and anti-patterns.
- Full GitHub community health file set: `README.md`, `README.zh.md`,
  `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `SECURITY.md`, `SUPPORT.md`, issue forms, PR template, and `CHANGELOG.md`.
- CI contract gate: `scripts/check_repo.py` plus `.github/workflows/ci.yml`.

### Changed

- **License: Apache-2.0 -> `GPL-3.0-only`** (maintainer instruction,
  2026-11-16). `LICENSE` now holds the verbatim GNU GPLv3 text from
  `https://www.gnu.org/licenses/gpl-3.0.txt`; the `or later` option is not
  granted. README (EN/ZH), `CONSTITUTION.md` §6 and its amendment record,
  `CONTRIBUTING.md`, `AGENTS.md`, competitor decision D7, and the CI contract
  gate were updated in the same change. Contributions are inbound = outbound
  with no CLA. No functional requirement or acceptance scenario changed.
- **Version option granted: `GPL-3.0-only` -> `GPL-3.0-or-later`**
  (maintainer instruction, 2026-11-16). Users may choose GPLv3 or any later
  FSF version. `LICENSE` stays the unmodified GPLv3 text — the GPL forbids
  editing the license document, so the version option is declared in the
  README and source SPDX headers instead. README (EN/ZH), `CONSTITUTION.md`
  §6 and its amendment record, `CONTRIBUTING.md`, `AGENTS.md`, competitor
  decision D7, and the CI contract gate updated; Python sources now carry
  SPDX headers. No functional requirement or acceptance scenario changed.
- **Clarified open questions Q1–Q5** (maintainer instruction, 2026-11-16).
  Q1 runtime/SDK: TypeScript + `@modelcontextprotocol/sdk`. Q2 department
  enum: five built-in size profiles (`micro`=2, `small`=5, `medium`=9,
  `large`=18, `group`=36 departments), switchable via configuration, default
  `micro`. Q3 audit: returned in-memory with the response only, no
  persistence sinking. Q4 repository: `JohnSmithfan/ai-company-mcp`,
  `CODEOWNERS` handle `@JohnSmithfan`, `CODE_OF_CONDUCT.md` contact channel
  via GitHub private contact. Q5 protocol compatibility: negotiate all
  officially published historical MCP versions with `2026-07-28` as the
  primary target. The spec's Open Questions section became a Clarified
  Decisions table; FR-001/004/008/011, AT-001/004, Assumptions, the
  Protocol Target, and the READMEs (EN/ZH) were updated in the same change.
  `.github/CODEOWNERS` was added and is now guarded by the contract gate.
  No `FR-*` or `AT-*` was added or removed.
- **Consistency fixes from independent spec review** (same change set,
  2026-11-16). `docs/development-method.md` now states that Step 2
  (`clarify`) is finished; competitor research R2/R7 reflect the Q5 and Q4
  decisions instead of referring to open questions; the spec's first
  Assumption covers hosts declaring historical versions (aligned with
  FR-011); the AIGC gate wording in the spec is unified to "before `/plan`";
  stale references to the README placeholder checklist in `CONTRIBUTING.md`
  and `CONSTITUTION.md` were replaced with the settled-values wording.

### Notes

- No server implementation exists yet. `AT-*` scenarios are `RED-PENDING`.
- Publishing placeholders filled on 2026-11-16 (maintainer instruction):
  repository `JohnSmithfan/ai-company-mcp`, maintainer contact channel in
  `CODE_OF_CONDUCT.md`, and `.github/CODEOWNERS`. Remaining publication
  tasks (GitHub Discussions, private vulnerability reporting, status badges)
  are tracked in the README publishing checklists.
