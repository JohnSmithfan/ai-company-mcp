import assert from "node:assert/strict";
import { test } from "node:test";
import { handleRequest } from "../src/core/handlers.js";
import { installSandbox } from "./sandbox.js";
import { makeTestConfig, META, rpc } from "./helpers.js";

installSandbox();

test("AT-009: default read-only mode rejects every mutating tool with COMPANY_003", () => {
  const config = makeTestConfig();
  assert.equal(config.readOnly, true);
  const response = handleRequest(
    rpc(1, "tools/call", {
      _meta: META,
      name: "company_execute_decision",
      arguments: { action: "delete the draft page" }
    }),
    config
  )!;
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_003");
  assert.equal(response.result, undefined);
});

test("AT-009: read-only mode blocks execution even with an approval token", () => {
  const config = makeTestConfig();
  const issued = handleRequest(
    rpc(2, "elicitation/create", {
      _meta: META,
      tool: "company_execute_decision"
    }),
    config
  )!;
  const token = (issued.result as { token: string }).token;
  const response = handleRequest(
    rpc(3, "tools/call", {
      _meta: { ...META, approvalToken: token },
      name: "company_execute_decision",
      arguments: { action: "delete the draft page" }
    }),
    config
  )!;
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_003");
});

test("AT-009: read tools still work in read-only mode", () => {
  const config = makeTestConfig();
  const response = handleRequest(
    rpc(4, "tools/call", {
      _meta: META,
      name: "company_route",
      arguments: { taskDescription: "review the platform roadmap" }
    }),
    config
  )!;
  assert.ok(response.error === undefined);
});
