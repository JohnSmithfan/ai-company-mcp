import assert from "node:assert/strict";
import { test } from "node:test";
import { routeTask } from "../src/routing/route.js";
import { getRegistry } from "../src/registry/registry.js";
import { handleRequest } from "../src/core/handlers.js";
import { installSandbox } from "./sandbox.js";
import { makeTestConfig, META, rpc } from "./helpers.js";

installSandbox();
const config = makeTestConfig();

const UNMATCHED = "quantum flux resonance omega 999";

test("AT-005: unmatched input routes to fallback with confidence 0", () => {
  const decision = routeTask(
    UNMATCHED,
    getRegistry(config.profile).departments
  );
  assert.equal(decision.decision, "fallback");
  assert.equal(decision.confidence, 0);
  assert.equal(decision.department, null);
  assert.equal(decision.marker, "NEEDS_CLARIFICATION");
});

test("AT-005: fallback never fabricates a department", () => {
  const decision = routeTask(
    UNMATCHED,
    getRegistry(config.profile).departments
  );
  assert.equal(decision.candidates.length, 0);
});

test("AT-005: fallback via tools/call carries the same semantics", () => {
  const response = handleRequest(
    rpc(1, "tools/call", {
      _meta: META,
      name: "company.route",
      arguments: { taskDescription: UNMATCHED }
    }),
    config
  )!;
  const decision = response.result as {
    structuredContent: Record<string, unknown>;
  };
  assert.equal(decision.structuredContent["decision"], "fallback");
  assert.equal(decision.structuredContent["confidence"], 0);
  assert.equal(decision.structuredContent["marker"], "NEEDS_CLARIFICATION");
});
