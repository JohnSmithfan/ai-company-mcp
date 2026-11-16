import assert from "node:assert/strict";
import { test } from "node:test";
import { handleRequest } from "../src/core/handlers.js";
import { createAuditRecord, fnv1aHex } from "../src/audit/audit.js";
import { maskPii } from "../src/pii/mask.js";
import { installSandbox } from "./sandbox.js";
import { makeTestConfig, META, rpc } from "./helpers.js";

installSandbox();

const ACTION_WITH_PII =
  "deploy the pricing page, emergency contact alice@example.com or 13800138000";

interface AuditShape {
  trace_id: string;
  timestamp: string;
  actor: string;
  action: string;
  aigc: { label: string; watermark: string };
  masked_input_digest: string;
}

function executeWithToken(): AuditShape {
  const config = makeTestConfig({ readOnly: false });
  const issued = handleRequest(
    rpc(1, "elicitation/create", {
      _meta: META,
      tool: "company.execute-decision"
    }),
    config
  )!;
  const token = (issued.result as { token: string }).token;
  const response = handleRequest(
    rpc(2, "tools/call", {
      _meta: { ...META, approvalToken: token },
      name: "company.execute-decision",
      arguments: { action: ACTION_WITH_PII }
    }),
    config
  )!;
  assert.ok(response.error === undefined, JSON.stringify(response.error));
  return (response.result as { structuredContent: { audit: AuditShape } })
    .structuredContent.audit;
}

test("AT-008: approved execution emits an AuditRecord with all required fields", () => {
  const audit = executeWithToken();
  assert.match(audit.trace_id, /^AICM-/);
  assert.match(audit.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.ok(audit.actor.length > 0);
  assert.equal(audit.action, "company.execute-decision");
  assert.ok(audit.aigc.label.length > 0);
  assert.ok(audit.aigc.watermark.length > 0);
  assert.match(audit.masked_input_digest, /^[0-9a-f]{8}$/);
});

test("AT-008: audit input digest is computed over the masked input only", () => {
  const audit = executeWithToken();
  const expected = fnv1aHex(maskPii(ACTION_WITH_PII));
  assert.equal(audit.masked_input_digest, expected);
});

test("AT-008: createAuditRecord is returned in-memory only (no persistence side effects)", () => {
  const audit = createAuditRecord(
    "company.execute-decision",
    "host",
    "plain input"
  );
  assert.ok(Object.keys(audit).length > 0);
  assert.match(audit.trace_id, /^AICM-/);
});
