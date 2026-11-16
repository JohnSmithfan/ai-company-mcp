# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Converged follow-up (2026-11-17): closes the two measurement-scope
  findings recorded during the convergence review and adds end-to-end
  validation. `scripts/bench-cold-start.mjs` (npm run bench, CI ubuntu
  step) measures a real subprocess cold start against SC-001's
  p95 < 200 ms claim, closing the in-process-measurement gap without
  touching the AT-006 zero-subprocess sandbox contract (the scripts run
  outside the node:test suite). `scripts/e2e-stdio-client.mjs` (npm run
  e2e, CI ubuntu step) drives the built server over a real stdio process
  boundary with 11 assertions (discovery, tool list, route + fallback,
  read-only rejection, resources, prompt, approval token, unknown
  method). `.vscode/mcp.json` registers the server with VS Code's MCP
  client for human host validation. CONTRIBUTING.md now requires the
  failing test to be committed separately from the implementation
  (machine-verifiable red state); v0.1 is noted as the historical
  exception.
- SDD converge round 2 (2026-11-17): `Converged` reached. The repository was
  published at `JohnSmithfan/ai-company-mcp` (Q4 decision); the first CI run
  is 7/7 jobs green (contract-gate plus the 6-cell os x Node 20/22 matrix),
  fulfilling SC-006. Discussions and private vulnerability reporting were
  enabled via the GitHub API (SC-005 now 100%). CI badges were added to both
  READMEs (badge URLs derived from the now-real repository and workflow, per
  the no-fabrication rule). The convergence report's verdict was flipped to
  `Converged` with per-item evidence; follow-up: merge the three Dependabot
  actions-version PRs.
- SDD Step 6 (round 1, 2026-11-17): `specs/001-core-mcp-server/
  convergence-report.md` — full-chain traceability (D → FR → AT →
  executable test) mechanically enforced by the gate, which now also
  asserts that every `AT-*` has a matching `test/atNNN-*.test.ts` file
  (reverse-verified: deleting a test file or injecting an unknown-AT
  test file both fail the gate). All 12 `AT-*` scenarios are green
  locally (65/65 tests, typecheck clean, sandbox scan 0 violations).
  Verdict: NOT YET `Converged` — the remaining gap is external evidence
  only (first CI matrix run after pushing to GitHub; Discussions and
  private vulnerability reporting are repository-settings items).
- SDD Step 5: v0.1 implementation executed on 2026-11-16 per the Step 4
  task breakdown (T-01~T-13). TypeScript + `@modelcontextprotocol/sdk`
  (SDK powers the stdio transport framing; the `2026-07-28` stateless
  protocol core, per-request version negotiation, governance tools, and
  the Streamable HTTP adapter are implemented in-repo — R-P1 verified:
  SDK 1.32.x targets the handshake-era protocol only, latest declared
  version `2025-11-25`). All 12 `AT-*` scenarios have executable
  `node:test` tests named after their `AT-NNN` (63 test cases) and are
  green locally; the sandbox enforces FR-006 with runtime interception
  plus a static import scan wired into the contract gate; the CI matrix
  (ubuntu/windows/macos x node 20/22) is wired in `.github/workflows/
  ci.yml`. Build tooling (`typescript`, `@types/node`) is dev-only; the
  zero-third-party-test-dependency decision (P-5) is unchanged.
- SDD Step 4: `specs/001-core-mcp-server/tasks.md` — 13-task breakdown
  (T-01~T-13) covering all 12 `AT-*` scenarios exactly once, ordered
  red-first by user-story priority (US1 slice T-02~T-06, US2 T-07~T-09,
  US3 T-10~T-11), with a traceability matrix (AT → task → FR → plan
  section), CI matrix wiring (T-12) and convergence check (T-13). Awaits
  human review before `/implement`; no implementation code exists.
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

- All `AT-*` scenarios are `GREEN`; the first GitHub Actions run on the
  published repository completed on 2026-11-17 with 7/7 jobs green
  (run `43919484231`, contract-gate plus the 6-cell os x Node matrix).
- Publishing items settled: repository `JohnSmithfan/ai-company-mcp`,
  maintainer contact channel in `CODE_OF_CONDUCT.md`, `.github/CODEOWNERS`
  (2026-11-16), GitHub Discussions and private vulnerability reporting
  enabled and CI badges added (2026-11-17) — see the README checklists.
