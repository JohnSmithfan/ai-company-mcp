# Contributing

Thanks for contributing. This repository is developed with **SDD (spec-driven
development)** and **ATDD (acceptance test-driven development)**. The spec is the
contract; code follows the spec, never the other way around.

Read [CONSTITUTION.md](CONSTITUTION.md) and
[docs/development-method.md](docs/development-method.md) before your first change.

## The non-negotiables

1. **No implementation without a merged spec.** Every code change traces to a
   `FR-*` requirement in `specs/*/spec.md`.
2. **Red first.** Every `AT-*` acceptance scenario becomes a failing executable
   test before implementation. A PR that turns a test green without showing the
   red state will be asked for evidence.
3. **Humans own the spec.** Coding agents must not edit `specs/`,
   `CONSTITUTION.md`, or the acceptance contract. Spec changes need maintainer
   review.
4. **No fabrication.** Do not invent repository owner handles, security emails,
   badge URLs, benchmark numbers, or competitor statistics. Use the placeholders
   listed in the README publishing checklist.
5. **Identifier immutability.** Slugs, error codes, field names, enum values,
   file paths, and function names stay in English in every language variant.

## Workflow

| Step | Artifact | Gate |
| --- | --- | --- |
| 0 | `CONSTITUTION.md` | Maintainer approval |
| 1 | `specs/###-feature/spec.md` | Human review + `check_repo.py` green |
| 2 | Clarifications / checklists | All `NEEDS CLARIFICATION` resolved or explicitly deferred |
| 3 | `plan.md` | Architecture review |
| 4 | `tasks.md` | Each task names its `AT-*` |
| 5 | Implementation | Red test -> green test -> refactor |
| 6 | Convergence | All `AT-*` green across the CI matrix |

Branch names match spec directories: `001-core-mcp-server`. Commit messages use
Conventional Commits (`docs:`, `spec:`, `test:`, `feat:`, `fix:`, `chore:`).

## Pull requests

Use [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md). A PR
must state: the spec path, the `FR-*` / `AT-*` IDs it satisfies, red-to-green
evidence, and whether any community health file changed. CI runs the contract
gate; a red gate blocks merge.

Run locally before pushing:

```bash
python -B scripts/check_repo.py --root .
```

No third-party packages, credentials, or network access are required for this
step. Python 3.11+ is enough.

## Community health files

GitHub recognizes these files in `.github/`, the repository root, or `docs/`
(in that precedence order): `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`,
`SUPPORT.md`, `SECURITY.md`, `ACCESSIBILITY.md`, plus `FUNDING.yml`,
`VULNERABILITY_REPORT.yml`, and issue/PR templates. `LICENSE` must exist in this
repository — it cannot be inherited from a default `.github` repository.

Issue forms (`.yml`) must contain valid `name:` and `description:` keys to count
toward the community profile checklist. If you add or rename a health file,
update the README repository map in the same change.

## Licensing of contributions

This project is **`GPL-3.0-or-later`** (GNU GPL v3 or, at your option, any
later version published by the FSF). By submitting a contribution you agree
that it is distributed under the same terms: inbound = outbound, with no CLA
and no copyright assignment. Every new source file must carry
`# SPDX-License-Identifier: GPL-3.0-or-later`; do not add headers that
contradict [LICENSE](LICENSE). The version option is a project-level grant —
the GPL forbids editing the license document itself.

Third-party compatibility is one-way: permissively licensed code (MIT,
Apache-2.0, BSD) may be incorporated into a GPLv3 work while preserving its
copyright and notice requirements; GPLv3 code may not be relicensed under
those terms. License names in `docs/research/` describe competitors and are
evidence, not grants to this project.

## Language policy

Product-facing files (README, community health files, configuration, code) are
English. Working documents (`specs/`, `docs/research/`, ADRs) may be authored in
the reviewer's language. Identifiers are never translated. Generated documents
carry AIGC disclosure labels and audit trace IDs and require human review.

## Conduct

All participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
Security issues must follow [SECURITY.md](SECURITY.md), never a public issue.
