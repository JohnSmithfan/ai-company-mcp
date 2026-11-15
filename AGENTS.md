# AGENTS.md

> Standing context for coding agents maintaining this repository. The human
> entry point is `README.md`; the runtime contract is `specs/*/spec.md`.

## What this repository is

`ai-company-mcp`: a framework-agnostic MCP server exposing AI virtual-company
governance (department routing, approval gates, audit, specification contracts).
**SDD Step 1 — specification only. No implementation code exists yet.**

## Commands

| Purpose | Command |
| --- | --- |
| Repository contract gate | `python -B scripts/check_repo.py --root .` |
| Spec authority | `specs/001-core-mcp-server/spec.md` |
| Method / phases | `docs/development-method.md` |
| Project principles | `CONSTITUTION.md` |
| Competitor evidence | `docs/research/competitive-analysis.md` |

No package installation, credentials, or network access is needed at this step.
Set `PYTHONDONTWRITEBYTECODE=1` so `__pycache__` never enters the tree.

## Hard rules

- **Do not write implementation code before Step 5.** This step produces docs.
- **Do not edit `specs/`, `CONSTITUTION.md`, or the acceptance contract** unless
  a human explicitly asks for a spec change.
- Every `FR-*` must map to an `AT-*`; every `AT-*` fails before implementation.
- Reverse-verify new assertions: inject the defect into a temp copy and confirm
  the check fails. A vacuous pass is a defect.
- Never invent owner handles, emails, badge URLs, statistics, or license claims.
- The project is `GPL-3.0-or-later`. Every new `.py` file must carry
  `# SPDX-License-Identifier: GPL-3.0-or-later`; never add a conflicting
  license header. `LICENSE` is the verbatim FSF GPLv3 text.
- Identifiers stay English. Product-facing files are English; working documents
  may be Chinese. UTF-8 without BOM, LF endings, 2-space indent (4 for Python).
- No absolute user paths, no filenames with spaces, no dead code, no TODO debt.
- Generated documents carry AIGC three-layer labeling plus an audit trace ID.

## Definition of done for any change

`python -B scripts/check_repo.py --root .` passes; README repository map updated
if files were added or renamed; CHANGELOG updated; human review requested for
anything that changes the spec.
