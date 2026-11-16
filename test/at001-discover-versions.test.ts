import assert from "node:assert/strict";
import { test } from "node:test";
import { handleRequest } from "../src/core/handlers.js";
import {
  PRIMARY_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS
} from "../src/core/version.js";
import { handleHttpPost } from "../src/transport/http.js";
import { processLine } from "../src/transport/stdio.js";
import { installSandbox } from "./sandbox.js";
import { makeTestConfig, META, metaWithVersion, rpc } from "./helpers.js";

installSandbox();
const config = makeTestConfig();

const PUBLISHED = [
  "2024-11-05",
  "2025-03-26",
  "2025-06-18",
  "2025-11-25",
  "2026-07-28"
];

test("AT-001: server/discover advertises all published versions and capabilities", () => {
  const response = handleRequest(rpc(1, "server/discover", { _meta: META }), config)!;
  const result = response.result as Record<string, unknown>;
  const versions = result["supportedVersions"] as string[];
  for (const version of PUBLISHED) {
    assert.ok(versions.includes(version), `missing ${version}`);
  }
  assert.equal(result["primaryProtocolVersion"], PRIMARY_PROTOCOL_VERSION);
  const capabilities = result["capabilities"] as Record<string, unknown>;
  for (const capability of ["tools", "resources", "prompts"]) {
    assert.ok(capabilities[capability], `capability ${capability} missing`);
  }
});

for (const version of PUBLISHED) {
  test(`AT-001: request declaring ${version} negotiates successfully`, () => {
    const response = handleRequest(
      rpc(2, "resources/list", { _meta: metaWithVersion(version) }),
      config
    )!;
    assert.ok(response.error === undefined, JSON.stringify(response.error));
    assert.ok(response.result !== undefined);
  });
}

test("AT-001: missing protocol version is rejected with UnsupportedProtocolVersionError", () => {
  const response = handleRequest(rpc(3, "resources/list", {}), config)!;
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_002");
  assert.match(response.error.message, /UnsupportedProtocolVersion/);
  const supported = response.error.data?.["supportedVersions"] as string[];
  for (const version of PUBLISHED) {
    assert.ok(supported.includes(version));
  }
});

test("AT-001: unsupported protocol version is rejected listing the supported range", () => {
  const response = handleRequest(
    rpc(4, "resources/list", { _meta: metaWithVersion("1999-01-01") }),
    config
  )!;
  assert.ok(response.error);
  assert.equal(response.error.data?.["companyCode"], "COMPANY_002");
  const supported = response.error.data?.["supportedVersions"] as string[];
  assert.ok(supported.includes("2026-07-28"));
});

test("AT-001: stdio full-chain server/discover via processLine", () => {
  const out = processLine(JSON.stringify(rpc(5, "server/discover", { _meta: META })), config);
  assert.ok(out);
  const parsed = JSON.parse(out) as { result: Record<string, unknown> };
  const versions = parsed.result["supportedVersions"] as string[];
  assert.ok(versions.includes("2026-07-28"));
});

test("AT-001: MCP-Protocol-Version header mismatch is rejected", () => {
  const result = handleHttpPost(
    {
      body: JSON.stringify(rpc(6, "resources/list", { _meta: META })),
      headers: { "MCP-Protocol-Version": "2025-06-18" }
    },
    config
  );
  assert.equal(result.status, 400);
  const parsed = JSON.parse(result.body) as {
    error: { data: Record<string, unknown> };
  };
  assert.equal(parsed.error.data["companyCode"], "COMPANY_002");
});

test("SC-001: four discovery calls p95 < 200 ms", () => {
  const durations: number[] = [];
  for (let i = 0; i < 4; i++) {
    const start = performance.now();
    handleRequest(rpc(100 + i, "server/discover", { _meta: META }), config);
    durations.push(performance.now() - start);
  }
  durations.sort((a, b) => a - b);
  const p95 = durations[durations.length - 1];
  assert.ok(p95 < 200, `p95 was ${p95} ms`);
});
