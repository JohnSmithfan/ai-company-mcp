# Project Constitution

**Version 1.0 · Ratified: pending maintainer sign-off · SDD Step 0**

This document holds the non-negotiable principles for `ai-company-mcp`. It is
created once per project (Spec Kit `/speckit-constitution`). Every later spec,
plan, task, and implementation must comply. Amendments require an explicit PR
and maintainer approval; coding agents may not change this file.

## 1. The spec is the contract

No code is written before a feature specification is reviewed and merged. The
spec is the source of truth; chat history and ad-hoc prompts are not. Spec
changes are owned by humans. Requirements use stable `FR-*` IDs and EARS
syntax; acceptance scenarios use `AT-*` IDs and Given/When/Then.

## 2. ATDD red-first

Every `FR-*` maps to at least one `AT-*`. Each `AT-*` exists as an executable
test that **fails before implementation**. "Green" without recorded "red" is not
done. Verification belongs in CI, not in a reviewer's memory. New assertions
must be reverse-verified: inject the defect into a throwaway copy and confirm
the assertion fails.

## 3. Protocol-first and thin

The deliverable is an MCP server only. No agent runtime, orchestrator, UI,
database, hosted service, or LLM integration. The server is stateless and
targets MCP `2026-07-28`: mandatory `server/discover`, `_meta` protocol version
on every request, tools/resources/prompts as the only server primitives, no
deprecated `sampling` or `logging`. Both stdio and Streamable HTTP transports
must behave identically.

## 4. Security and privacy by default

v0.1 is read-only by default. No network egress, no telemetry, no credential
access, no filesystem writes, no subprocesses. Any side effect requires explicit
human approval obtained through elicitation. All failures return documented
stable error codes, never raw exceptions. PII-like patterns are masked before
entering audit records. All AI-generated documents carry the three AIGC layers
(visible label, metadata, hidden watermark) plus an audit trace ID.

## 5. Framework-agnostic and composable

No binding to any MCP host, model vendor, IDE, or orchestration framework. The
project complements persona libraries, control planes, and orchestrators; it
does not replace them. Dependencies are stdlib-only until a recorded decision
says otherwise.

## 6. Open-source hygiene

`GPL-3.0-only` (GNU General Public License v3.0, no `or later` option);
`LICENSE` holds the verbatim FSF text, inbound contributions use the same terms,
and there is no CLA. GitHub community profile checklist must stay at 100%.
Product-facing files are English; working documents may use the reviewer's language;
identifiers are never translated. UTF-8 without BOM, LF line endings, 2-space
indent (4 for Python), no absolute user paths, no spaces in filenames. No
invented owner handles, emails, badges, or statistics — placeholders are listed
in the README publishing checklist.

## 7. No cruft

No dead code, commented-out live code, TODO/FIXME debt, orphan or duplicated
files, or "kept for history" artifacts. Superseded material is marked deprecated
with a pointer, not left behind. Every file has a named owner in the repository
map.

## Compliance

`scripts/check_repo.py` enforces the mechanical parts of this constitution on
every push and pull request: required community health files, encoding and line
endings, issue-form validity, mandatory spec sections, and `FR-*` → `AT-*`
traceability. A failing gate blocks merge. The gate is the floor, not the ceiling:
human review still owns judgment calls.

## Amendment record

| Date | Change | Approved by |
| --- | --- | --- |
| 2026-11-16 | Initial constitution (7 principles) | Pending maintainer sign-off |
| 2026-11-16 | §6 set to `GPL-3.0-only` (pre-ratification correction at maintainer's request; no CLA, no `or later`) | Maintainer request; sign-off pending |
