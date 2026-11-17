import assert from "node:assert/strict";
import { test } from "node:test";
import { handleRequest } from "../src/core/handlers.js";
import { PRIMARY_PROTOCOL_VERSION } from "../src/core/version.js";
import { createSession } from "../src/core/session.js";
import { installSandbox } from "./sandbox.js";
import { makeTestConfig, META, rpc } from "./helpers.js";

installSandbox();
const config = makeTestConfig();

function initializeError(response: { error?: { data?: Record<string, unknown> } } | null) {
  assert.ok(response?.error, "expected an error response");
  assert.equal(response.error.data?.["companyCode"], "COMPANY_002");
}

test("AT-013: initialize with a supported legacy version returns a standard result", () => {
  const session = createSession();
  const response = handleRequest(
    rpc(1, "initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "legacy-host", version: "1.0" }
    }),
    config,
    session
  )!;
  assert.ok(response.error === undefined, JSON.stringify(response.error));
  const result = response.result as Record<string, unknown>;
  assert.equal(result["protocolVersion"], "2025-11-25");
  const capabilities = result["capabilities"] as Record<string, unknown>;
  for (const capability of ["tools", "resources", "prompts"]) {
    assert.ok(capabilities[capability], `capability ${capability} missing`);
  }
  const serverInfo = result["serverInfo"] as Record<string, unknown>;
  assert.equal(serverInfo["name"], "ai-company-mcp");
});

test("AT-013: initialize negotiates every published version", () => {
  for (const version of ["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25", "2026-07-28"]) {
    const response = handleRequest(
      rpc(2, "initialize", {
        protocolVersion: version,
        capabilities: {},
        clientInfo: { name: "legacy-host", version: "1.0" }
      }),
      config,
      createSession()
    )!;
    assert.ok(response.error === undefined, JSON.stringify(response.error));
    assert.equal((response.result as Record<string, unknown>)["protocolVersion"], version);
  }
});

test("AT-013: initialize with a missing or unsupported top-level version is rejected", () => {
  const missing = handleRequest(
    rpc(3, "initialize", { capabilities: {}, clientInfo: { name: "legacy-host", version: "1.0" } }),
    config,
    createSession()
  );
  initializeError(missing);
  const unsupported = handleRequest(
    rpc(4, "initialize", {
      protocolVersion: "1999-01-01",
      capabilities: {},
      clientInfo: { name: "legacy-host", version: "1.0" }
    }),
    config,
    createSession()
  );
  initializeError(unsupported);
});

test("AT-013: a session-less connection (stateless transports) still rejects initialize", () => {
  // On a session-less connection the FR-011 declaration check runs first and
  // rejects uniformly: no successful handshake is possible, so stateless
  // transports (HTTP) keep their stateless semantics.
  const rejected = handleRequest(
    rpc(11, "initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "legacy-host", version: "1.0" }
    }),
    config
  )!;
  assert.ok(rejected.error, "expected an error response");
  assert.equal(rejected.error.data?.["companyCode"], "COMPANY_002");
  assert.match(rejected.error.message, /UnsupportedProtocolVersion/);
});

test("AT-013: after a handshake, session requests without _meta inherit the negotiated version", () => {
  const session = createSession();
  const handshake = handleRequest(
    rpc(5, "initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "legacy-host", version: "1.0" }
    }),
    config,
    session
  )!;
  assert.ok(handshake.error === undefined, JSON.stringify(handshake.error));
  assert.equal((handshake.result as Record<string, unknown>)["protocolVersion"], "2025-06-18");

  const discovered = handleRequest(rpc(6, "server/discover", {}), config, session)!;
  assert.ok(discovered.error === undefined, JSON.stringify(discovered.error));
  assert.equal(
    (discovered.result as Record<string, unknown>)["primaryProtocolVersion"],
    PRIMARY_PROTOCOL_VERSION
  );
});

test("AT-013: explicit _meta declarations inside a session keep FR-011 semantics", () => {
  const session = createSession();
  handleRequest(
    rpc(7, "initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "legacy-host", version: "1.0" }
    }),
    config,
    session
  );
  const declaring = handleRequest(rpc(8, "server/discover", { _meta: META }), config, session)!;
  assert.ok(declaring.error === undefined, JSON.stringify(declaring.error));

  const unsupported = handleRequest(
    rpc(9, "resources/list", {
      _meta: { "io.modelcontextprotocol/protocolVersion": "1999-01-01" }
    }),
    config,
    session
  )!;
  initializeError(unsupported);
});

test("AT-013: a connection without a completed handshake still rejects declaration-less requests", () => {
  const bareSession = createSession();
  const rejected = handleRequest(rpc(10, "server/discover", {}), config, bareSession)!;
  initializeError(rejected);
});
