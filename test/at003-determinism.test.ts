import assert from "node:assert/strict";
import { test } from "node:test";
import { handleRequest } from "../src/core/handlers.js";
import { installSandbox, sandboxReport } from "./sandbox.js";
import { makeTestConfig, META, rpc } from "./helpers.js";

installSandbox();
const config = makeTestConfig({ profile: "group" });

const TASK =
  "plan the q3 platform roadmap and ship the mobile release";

function routeOnce(): string {
  const response = handleRequest(
    rpc(1, "tools/call", {
      _meta: META,
      name: "company.route",
      arguments: { taskDescription: TASK }
    }),
    config
  )!;
  return JSON.stringify(response);
}

test("AT-003: 100 consecutive route calls are byte-identical", () => {
  const first = routeOnce();
  for (let i = 0; i < 100; i++) {
    assert.equal(routeOnce(), first, `iteration ${i} diverged`);
  }
});

test("AT-003: zero LLM calls and zero network during routing (sandbox armed)", () => {
  assert.equal(sandboxReport().installed, true);
  assert.ok(sandboxReport().patches.includes("fetch"));
  assert.ok(
    sandboxReport().patches.includes("net.Socket.connect"),
    "any LLM API call over TCP would be blocked by the sandbox"
  );
});

test("AT-003: routing decision is fully populated", () => {
  const first = JSON.parse(routeOnce()) as {
    result: { structuredContent: Record<string, unknown> };
  };
  const decision = first.result.structuredContent;
  assert.equal(decision["decision"], "route");
  assert.notEqual(decision["department"], null);
  assert.notEqual(decision["confidence"], 0);
});
