# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- SDD Step 0: `CONSTITUTION.md` with seven non-negotiable principles.
- SDD Step 1: `specs/001-core-mcp-server/spec.md` — 15 `FR-*`, 12 `AT-*`,
  three prioritized user stories, success criteria, and five open questions.
- Competitor research at `docs/research/competitive-analysis.md` (GitHub API
  snapshot 2026-11-16) with decisions D1–D7 traced into the specification.
- `docs/development-method.md` — SDD phases, ATDD red-first loop, EARS/GWT
  grammar, traceability rules, and anti-patterns.
- Full GitHub community health file set: `README.md`, `README.zh.md`,
  `LICENSE` (Apache-2.0), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `SECURITY.md`, `SUPPORT.md`, issue forms, PR template, and `CHANGELOG.md`.
- CI contract gate: `scripts/check_repo.py` plus `.github/workflows/ci.yml`.

### Notes

- No server implementation exists yet. `AT-*` scenarios are `RED-PENDING`.
- Publishing placeholders (`{OWNER}/{REPO}`, `[MAINTAINER_CONTACT]`,
  `CODEOWNERS`) are listed in the README and remain unfilled by design.
