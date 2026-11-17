// SPDX-License-Identifier: GPL-3.0-or-later
// End-to-end stdio validation: drives the built server binary over a real
// process boundary (spawned subprocess, real stdio framing via the SDK's
// StdioServerTransport), acting as a minimal MCP host client. This runs
// OUTSIDE the node:test suite on purpose: the suite enforces the AT-006
// sandbox contract (zero subprocesses), while E2E validation by definition
// needs a separate server process.
//
// Usage: npm run build && npm run e2e

import { spawn } from "node:child_process";

function fail(message) {
  try {
    child.kill();
  } catch {
    // child may not be spawnable yet; nothing to clean up
  }
  console.error(`e2e FAIL: ${message}`);
  process.exit(1);
}

// Top-level awaits below reject on timeout; route that to the clean fail path.
process.on("unhandledRejection", (reason) => {
  fail(reason instanceof Error ? reason.message : String(reason));
});

let passed = 0;

function assert(condition, message) {
  if (!condition) fail(message);
  passed++;
  console.error(`  ok: ${message}`);
}

const child = spawn(process.execPath, ["dist/src/main.js"], {
  stdio: ["pipe", "pipe", "pipe"],
  env: { ...process.env, AICOMPANY_PROFILE: "group" }
});

let buffer = "";
const pending = new Map();
child.stdout.on("data", (chunk) => {
  buffer += chunk.toString("utf8");
  let index;
  while ((index = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (line === "") continue;
    let response;
    try {
      response = JSON.parse(line);
    } catch {
      fail(`server sent a non-JSON line: ${line}`);
    }
    const resolve = pending.get(response.id);
    if (!resolve) fail(`server sent an unmatched id: ${response.id}`);
    pending.delete(response.id);
    resolve(response);
  }
});
child.stderr.on("data", () => {});
child.on("exit", (code) => {
  if (code !== 0 && pending.size > 0) {
    fail(`server exited early with code ${code}`);
  }
});

function request(id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`timeout waiting for response to id ${id}`));
    }, 5000);
    pending.set(id, (value) => {
      clearTimeout(timer);
      resolve(value);
    });
    child.stdin.write(
      `${JSON.stringify({
        jsonrpc: "2.0",
        id,
        method,
        params: {
          ...params,
          _meta: { "io.modelcontextprotocol/protocolVersion": "2026-07-28" }
        }
      })}\n`
    );
  });
}

// 1. Discovery over the real transport (stateless: no initialize handshake).
const discover = await request(1, "server/discover");
const versions = discover.result?.supportedVersions;
assert(
  Array.isArray(versions) && versions.includes("2026-07-28"),
  "server/discover declares 2026-07-28 over real stdio"
);

// 2. Tool listing matches the governance tool set.
const tools = await request(2, "tools/list");
const toolNames = (tools.result?.tools ?? []).map((t) => t.name);
assert(
  JSON.stringify(toolNames.sort()) ===
    JSON.stringify([
      "company_execute_decision",
      "company_route",
      "company_spec_validate"
    ]),
  "tools/list exposes exactly the three governance tools"
);

// 3. Routing a real task description end to end (group profile; "mobile" and
// "app release" both map to the mobile department, so this routes uniquely).
const route = await request(3, "tools/call", {
  name: "company_route",
  arguments: { taskDescription: "ship the mobile app release train" }
});
const routeOut = route.result?.structuredContent;
assert(
  routeOut?.decision === "route" && routeOut?.department === "mobile",
  `company_route routes deterministically (department=${routeOut?.department})`
);
assert(
  typeof routeOut?.input_masked === "string" &&
    routeOut.input_masked.length > 0,
  "route response carries the masked input"
);

// 3b. Negative path over the real transport: unmatched input falls back.
const fallback = await request(10, "tools/call", {
  name: "company_route",
  arguments: { taskDescription: "xyzzy completely unmatched" }
});
const fallbackOut = fallback.result?.structuredContent;
assert(
  fallbackOut?.decision === "fallback" &&
    fallbackOut?.department === null &&
    fallbackOut?.confidence === 0 &&
    fallbackOut?.marker === "NEEDS_CLARIFICATION",
  "unmatched input returns fallback (confidence 0, NEEDS_CLARIFICATION)"
);

// 4. Read-only mode blocks the mutating tool with the contract error code.
// The wire format is JSON-RPC numeric code with data.companyCode carrying
// the documented COMPANY_* contract code (FR-014).
const blocked = await request(4, "tools/call", {
  name: "company_execute_decision",
  arguments: { action: "reorganize departments" }
});
assert(
  blocked.error?.data?.companyCode === "COMPANY_003",
  "mutating tool is rejected with COMPANY_003 in read-only default mode"
);

// 5. Resources are readable over the real transport.
const resources = await request(5, "resources/list");
const uris = (resources.result?.resources ?? []).map((r) => r.uri);
assert(
  uris.includes("company://departments") && uris.includes("company://error-codes"),
  "resources/list exposes both contract resources"
);
const registry = await request(6, "resources/read", { uri: "company://departments" });
const registryBody = JSON.parse(registry.result?.contents?.[0]?.text ?? "{}");
assert(
  typeof registryBody.registry_version === "string" &&
    registryBody.profile === "group" &&
    registryBody.department_count === 36 &&
    Array.isArray(registryBody.domains) &&
    registryBody.domains.every((d) => Array.isArray(d.departments)),
  `company://departments parses (profile=${registryBody.profile}, departments=${registryBody.department_count}, domains=${registryBody.domains?.length})`
);

// 6. Prompt template retrieval.
const prompt = await request(7, "prompts/get", { name: "department-brief" });
assert(
  typeof prompt.result?.messages?.[0]?.content?.text === "string" &&
    prompt.result.messages[0].content.text.length > 0,
  "prompts/get returns the department-brief message"
);

// 7. Elicitation endpoint exists for mutating tools.
const elicitation = await request(8, "elicitation/create", {
  tool: "company_execute_decision"
});
assert(
  typeof elicitation.result?.token === "string" &&
    elicitation.result.token.startsWith("ELIC-"),
  "elicitation/create issues an approval token"
);

// 8. Unknown method still yields the contract error.
const unknown = await request(9, "sampling/create");
assert(
  unknown.error?.data?.companyCode === "COMPANY_001",
  "unknown method is rejected with COMPANY_001"
);

child.kill();
console.error(`e2e PASS: ${passed} assertions over a real stdio process boundary`);
