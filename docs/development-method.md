# Development Method: SDD + ATDD

This repository uses **spec-driven development** as the outer loop and
**acceptance test-driven development** as the inner loop. The baseline is
[GitHub Spec Kit](https://github.com/github/spec-kit) (MIT); the flow is
tool-agnostic, so the phases below work with any coding agent.

## 1. SDD phases

| # | Phase | Spec Kit command | Output | Exit gate |
| --- | --- | --- | --- | --- |
| 0 | Constitution | `/speckit-constitution` | `CONSTITUTION.md` (once per project) | Maintainer approval |
| 1 | **Specify** | `/speckit-specify` | `specs/###-feature/spec.md` | Human review + contract gate green |
| 2 | Clarify | walkthrough | Resolved `NEEDS CLARIFICATION`, checklist | No unresolved blocking question |
| 3 | Plan | `/speckit-plan` | `plan.md` (architecture, decisions, risks) | Architecture review |
| 4 | Tasks | `/speckit-tasks` | `tasks.md`, each task naming its `AT-*` | Traceability 100% |
| 5 | Implement | `/speckit-implement` | Code + tests | All `AT-*` green |
| 6 | Converge | `/speckit-converge` | Convergence report | Repeat 5–6 until `Converged` |

**Current state: Step 3 (`plan`) in progress** — the Step 1 spec is signed off;
Step 2 (`clarify`) finished on 2026-11-16; `specs/001-core-mcp-server/plan.md`
is the Step 3 deliverable and awaits architecture review before `/tasks`. No
implementation code exists and none may be added before the `implement` phase.

The spec template's four mandatory sections are `User Scenarios & Testing`,
`Requirements`, `Success Criteria`, and `Assumptions`. User stories are
prioritized (P1/P2/P3) and each must be **independently testable**: implementing
only P1 still yields a viable MVP.

## 2. ATDD inner loop

```
FR-* requirement (EARS)
      -> AT-* acceptance scenario (Given / When / Then)
      -> executable test, expected RED
      -> implementation
      -> test GREEN
      -> regression suite on every PR
```

Rules:

- Every `FR-*` has >= 1 `AT-*`. Orphans in either direction fail the CI gate.
- Tests are written from the scenario wording, not from the implementation.
- A scenario is behavioral and observable. "The system shall be fast" is not a
  requirement; "p95 < 200 ms on the CI runner" is.
- The acceptance contract table in `spec.md` is the register. Its `Status`
  column moves `RED-PENDING` -> `RED` -> `GREEN`.
- New assertions are reverse-verified: reintroduce the defect in a throwaway
  copy and confirm the assertion fails. A vacuously passing assertion is a bug.

SDD vs TDD vs BDD: SDD defines *what* to build with a durable spec; TDD proves
units correct; BDD aligns stakeholders on behavior. They compose — SDD is the
outer loop, ATDD/BDD scenarios are the bridge, TDD is the inner unit loop.

## 3. Requirement grammar (EARS)

Generic form (clauses always in this order):

```
While <optional precondition>, when <optional trigger>,
the <system name> shall <system response>
```

| Pattern | Form | Used for |
| --- | --- | --- |
| Ubiquitous | `The <system> shall <response>` | Always-active properties |
| State-driven | `While <state>, the <system> shall <response>` | Mode-dependent behavior |
| Event-driven | `When <trigger>, the <system> shall <response>` | Request/response behavior |
| Optional feature | `Where <feature>, the <system> shall <response>` | Conditional capabilities |
| Unwanted behavior | `If <condition>, then the <system> shall <response>` | Errors and edge cases |

Acceptance scenarios use Given/When/Then. Both forms are deliberately near-1:1
with executable tests, so spec drift is detectable mechanically.

## 4. Traceability

| Artifact | ID | Authority |
| --- | --- | --- |
| Competitor decision | `D1`–`D7` | `docs/research/competitive-analysis.md` |
| Functional requirement | `FR-001`… | `specs/*/spec.md` |
| Acceptance scenario | `AT-001`… | `specs/*/spec.md` (contract table) |
| Executable test | test name contains `AT-NNN` | test suite (from Step 4) |
| Error code | `COMPANY_NNN` | `company://error-codes` resource |

`scripts/check_repo.py` verifies that every `FR-*` appears in the acceptance
contract and that IDs are unique. Once tests exist, CI additionally checks that
every `AT-*` has a matching test name.

## 5. Anti-patterns (from the 2026 SDD literature)

- **Spec drift**: code changes without spec changes. Fix: spec lives in CI.
- **Over-specification**: beyond ~800 lines for one feature, agent throughput
  drops. Specs constrain decisions, not implementation freedom.
- **Unfalsifiable requirements**: vague adjectives instead of measured outcomes.
- **Agents editing the spec**: the spec is the contract; implementation agents
  must not rewrite it.
- **Waterfall in disguise**: the spec must be cheap to revise. If review takes
  longer than implementation, the process has failed.
- **Implicit spec**: "vibe coding". Fine for throwaway prototypes, unreliable
  for a governance component.
- **Test-passing theater**: a green assertion that never exercised the defect.
  Always reverse-verify.

## 6. Definition of done (per feature)

- [ ] Spec reviewed by a human; all four mandatory sections present.
- [ ] `NEEDS CLARIFICATION` resolved or explicitly deferred with an owner.
- [ ] `FR-*` -> `AT-*` coverage 100%; IDs unique.
- [ ] Each `AT-*` has a recorded RED state and a final GREEN state.
- [ ] CI green across the declared matrix; contract gate green.
- [ ] Community health files and repository map updated if files changed.
- [ ] CHANGELOG updated; generated documents carry AIGC labels + trace ID.
