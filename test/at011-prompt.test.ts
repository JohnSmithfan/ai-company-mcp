import assert from "node:assert/strict";
import { test } from "node:test";
import { handleRequest } from "../src/core/handlers.js";
import { installSandbox } from "./sandbox.js";
import { makeTestConfig, META, rpc } from "./helpers.js";

installSandbox();
const config = makeTestConfig();

test("AT-011: prompts/list advertises department-brief", () => {
  const response = handleRequest(rpc(1, "prompts/list", { _meta: META }), config)!;
  const prompts = response.result as {
    prompts: { name: string }[];
  };
  assert.ok(prompts.prompts.some((p) => p.name === "department-brief"));
});

test("AT-011: prompts/get department-brief returns a structured brief", () => {
  const response = handleRequest(
    rpc(2, "prompts/get", { _meta: META, name: "department-brief" }),
    config
  )!;
  const result = response.result as {
    messages: { role: string; content: { type: string; text: string } }[];
  };
  assert.equal(result.messages.length, 1);
  assert.equal(result.messages[0].role, "user");
  assert.equal(result.messages[0].content.type, "text");
  const text = result.messages[0].content.text;
  assert.ok(text.includes("ceo-office"), "micro profile departments missing");
  assert.ok(text.includes("chief-of-staff"));
});

test("AT-011: brief contains no external tool invocation instructions", () => {
  const response = handleRequest(
    rpc(3, "prompts/get", { _meta: META, name: "department-brief" }),
    config
  )!;
  const text = (response.result as {
    messages: { content: { text: string } }[];
  }).messages[0].content.text;
  assert.doesNotMatch(text, /tools?\/call/i);
  assert.doesNotMatch(text, /elicitation/i);
  assert.doesNotMatch(text, /approvalToken/i);
  assert.doesNotMatch(text, /call (any|the) tool/i);
});

test("AT-011: unknown prompt name is rejected with a stable error", () => {
  const response = handleRequest(
    rpc(4, "prompts/get", { _meta: META, name: "no-such-prompt" }),
    config
  )!;
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_001");
});
