import assert from "node:assert/strict";
import { test } from "node:test";
import { handleRequest } from "../src/core/handlers.js";
import { installSandbox } from "./sandbox.js";
import { makeTestConfig, META, rpc } from "./helpers.js";

installSandbox();

const MUTATING_TOOL = "company_execute_decision";

function execute(
  config: ReturnType<typeof makeTestConfig>,
  approvalToken?: string
) {
  const meta: Record<string, unknown> = { ...META };
  if (approvalToken !== undefined) {
    meta["approvalToken"] = approvalToken;
  }
  return handleRequest(
    rpc(1, "tools/call", {
      _meta: meta,
      name: MUTATING_TOOL,
      arguments: { action: "publish the release notes" }
    }),
    config
  )!;
}

test("AT-007: mutating tool without approval token is rejected and not executed", () => {
  const config = makeTestConfig({ readOnly: false });
  const response = execute(config);
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_004");
  assert.equal(response.result, undefined);
});

test("AT-007: mutating tool with an invalid token is rejected", () => {
  const config = makeTestConfig({ readOnly: false });
  const response = execute(config, "ELIC-not-a-real-token");
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_004");
});

test("AT-007: elicitation/create issues a token that unlocks execution", () => {
  const config = makeTestConfig({ readOnly: false });
  const issued = handleRequest(
    rpc(2, "elicitation/create", { _meta: META, tool: MUTATING_TOOL }),
    config
  )!;
  const issuedResult = issued.result as { token: string; tool: string };
  assert.match(issuedResult.token, /^ELIC-/);
  assert.equal(issuedResult.tool, MUTATING_TOOL);
  const response = execute(config, issuedResult.token);
  assert.ok(response.error === undefined, JSON.stringify(response.error));
  assert.equal(
    (response.result as { structuredContent: { executed: boolean } })
      .structuredContent.executed,
    true
  );
});

test("AT-007: a consumed token cannot be reused", () => {
  const config = makeTestConfig({ readOnly: false });
  const issued = handleRequest(
    rpc(3, "elicitation/create", { _meta: META, tool: MUTATING_TOOL }),
    config
  )!;
  const token = (issued.result as { token: string }).token;
  execute(config, token);
  const second = execute(config, token);
  assert.ok(second.error);
  assert.equal(second.error.data?.["companyCode"], "COMPANY_004");
});

test("AT-007: host without elicitation support keeps the mutating tool unavailable", () => {
  const config = makeTestConfig({ readOnly: false, elicitationSupported: false });
  const issued = handleRequest(
    rpc(4, "elicitation/create", { _meta: META, tool: MUTATING_TOOL }),
    config
  )!;
  assert.ok(issued.error);
  assert.equal(issued.error.data?.["companyCode"], "COMPANY_004");
  const response = execute(config, "ELIC-anything");
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_004");
});

test("AT-007: elicitation for an unknown tool is rejected", () => {
  const config = makeTestConfig({ readOnly: false });
  const issued = handleRequest(
    rpc(5, "elicitation/create", { _meta: META, tool: "company_route" }),
    config
  )!;
  assert.ok(issued.error);
  assert.equal(issued.error.data?.["companyCode"], "COMPANY_001");
});
