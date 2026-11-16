import assert from "node:assert/strict";
import { test } from "node:test";
import { validateSpec } from "../src/validator/validate.js";
import { installSandbox } from "./sandbox.js";

installSandbox();

const GOOD_SPEC = `# Sample Spec

## User Scenarios & Testing
User story body.

## Requirements
### Functional Requirements
- **FR-001**: The system shall alpha.
- **FR-002**: The system shall beta.

## Success Criteria
- SC-001 measurable.

## Assumptions
- Assumption body.

## ATDD Acceptance Contract
| AT-001 | FR-001 | Given a / When b / Then c | layer | RED-PENDING |
| AT-002 | FR-002 | Given a / When b / Then c | layer | RED-PENDING |
`;

test("AT-010: compliant specification passes with stats", () => {
  const result = validateSpec(GOOD_SPEC);
  assert.equal(result.status, "pass");
  assert.deepEqual(result.findings, []);
  assert.equal(result.stats.frs, 2);
  assert.equal(result.stats.ats, 2);
});

test("AT-010: missing mandatory section fails and is listed", () => {
  const broken = GOOD_SPEC.replace("## Assumptions\n- Assumption body.\n", "");
  const result = validateSpec(broken);
  assert.equal(result.status, "fail");
  const messages = result.findings.map((f) => f.message).join("\n");
  assert.match(messages, /## Assumptions/);
});

test("AT-010: orphaned FR id is reported", () => {
  const broken = GOOD_SPEC.replace(
    "- **FR-002**: The system shall beta.",
    "- **FR-002**: The system shall beta.\n- **FR-003**: The system shall gamma."
  );
  const result = validateSpec(broken);
  assert.equal(result.status, "fail");
  const orphan = result.findings.find((f) => f.code === "orphan-fr");
  assert.ok(orphan);
  assert.equal(orphan.id, "FR-003");
});

test("AT-010: duplicate AT id is reported", () => {
  const broken = GOOD_SPEC.replace(
    "| AT-002 | FR-002 | Given a / When b / Then c | layer | RED-PENDING |",
    "| AT-001 | FR-002 | Given a / When b / Then c | layer | RED-PENDING |"
  );
  const result = validateSpec(broken);
  assert.equal(result.status, "fail");
  const duplicate = result.findings.find((f) => f.code === "duplicate-at");
  assert.ok(duplicate);
  assert.equal(duplicate.id, "AT-001");
});
