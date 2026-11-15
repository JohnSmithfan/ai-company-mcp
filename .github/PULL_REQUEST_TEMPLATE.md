## Summary

<!-- What changed and why. One or two sentences. -->

## Spec traceability

- Spec path: `specs/###-feature/spec.md`
- Requirements: `FR-...`
- Acceptance scenarios: `AT-...`
- SDD phase: <!-- constitution / specify / clarify / plan / tasks / implement / converge -->

## ATDD evidence

- [ ] Each `AT-*` above was recorded as a **failing** test before implementation.
- [ ] Each `AT-*` above is now green.
- [ ] Reverse-verified new assertions (defect reintroduced in a throwaway copy makes them fail).

## Checklist

- [ ] `python -B scripts/check_repo.py --root .` passes.
- [ ] Spec and acceptance contract were **not** edited by an implementation agent.
- [ ] `CONSTITUTION.md` principles still hold (read-only default, no network, no credentials, no telemetry).
- [ ] README repository map updated if files were added, renamed, or removed.
- [ ] `CHANGELOG.md` updated.
- [ ] No absolute user paths, no invented handles/emails/badges/statistics.
- [ ] UTF-8 without BOM, LF endings, identifiers untranslated.
- [ ] Generated documents carry AIGC labeling and an audit trace ID.

## Human review

<!-- AI-generated content requires human sign-off before it can be treated as a decision. -->
- [ ] Maintainer review requested.
