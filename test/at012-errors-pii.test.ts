import assert from "node:assert/strict";
import { test } from "node:test";
import { handleRequest } from "../src/core/handlers.js";
import { processLine } from "../src/transport/stdio.js";
import { maskPii } from "../src/pii/mask.js";
import { installSandbox } from "./sandbox.js";
import { makeTestConfig, META, rpc } from "./helpers.js";

installSandbox();
const config = makeTestConfig();

test("AT-012: company://error-codes exposes exactly the five documented codes", () => {
  const response = handleRequest(
    rpc(1, "resources/read", { _meta: META, uri: "company://error-codes" }),
    config
  )!;
  const contents = (response.result as {
    contents: { text: string }[];
  }).contents;
  const payload = JSON.parse(contents[0].text) as {
    codes: { code: string; name: string; description: string }[];
  };
  const codes = payload.codes.map((c) => c.code).sort();
  assert.deepEqual(codes, [
    "COMPANY_001",
    "COMPANY_002",
    "COMPANY_003",
    "COMPANY_004",
    "COMPANY_005"
  ]);
  for (const entry of payload.codes) {
    assert.ok(entry.name.length > 0);
    assert.ok(entry.description.length > 0);
  }
});

test("AT-012: unknown method returns a documented stable error code", () => {
  const response = handleRequest(
    rpc(2, "company/nonexistent", { _meta: META }),
    config
  )!;
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_001");
});

test("AT-012: malformed JSON line returns COMPANY_001, never a free-form exception", () => {
  const out = processLine("this is not json", config);
  assert.ok(out);
  const parsed = JSON.parse(out) as {
    error: { data: Record<string, unknown> };
  };
  assert.equal(parsed.error.data["companyCode"], "COMPANY_001");
});

test("AT-012: empty task description is rejected with COMPANY_001", () => {
  const response = handleRequest(
    rpc(3, "tools/call", {
      _meta: META,
      name: "company.route",
      arguments: { taskDescription: "   " }
    }),
    config
  )!;
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_001");
});

test("AT-012: oversized input (>100 KB) is rejected with COMPANY_001", () => {
  const response = handleRequest(
    rpc(4, "tools/call", {
      _meta: META,
      name: "company.route",
      arguments: { taskDescription: "x".repeat(100 * 1024 + 1) }
    }),
    config
  )!;
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_001");
});

test("AT-012: maskPii masks emails and phone numbers", () => {
  const masked = maskPii(
    "contact alice@example.com or +1-415-555-0100 and 13800138000"
  );
  assert.ok(masked.includes("[MASKED_EMAIL]"));
  assert.ok(masked.includes("[MASKED_PHONE]"));
  assert.ok(!masked.includes("alice@example.com"));
  assert.ok(!masked.includes("13800138000"));
  assert.ok(!masked.includes("415-555-0100"));
});

test("AT-012: route response carries masked input, never raw PII", () => {
  const response = handleRequest(
    rpc(5, "tools/call", {
      _meta: META,
      name: "company.route",
      arguments: { taskDescription: "email alice@example.com about the roadmap" }
    }),
    config
  )!;
  const decision = (response.result as {
    structuredContent: { input_masked: string };
  }).structuredContent;
  assert.ok(decision.input_masked.includes("[MASKED_EMAIL]"));
  assert.ok(!decision.input_masked.includes("alice@example.com"));
});
