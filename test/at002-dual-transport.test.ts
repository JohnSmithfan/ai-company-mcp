import assert from "node:assert/strict";
import { test } from "node:test";
import { handleHttpPost } from "../src/transport/http.js";
import { processLine } from "../src/transport/stdio.js";
import { installSandbox } from "./sandbox.js";
import { makeTestConfig, META, rpc } from "./helpers.js";

installSandbox();
const config = makeTestConfig();

const REQUESTS = [
  rpc(1, "tools/list", { _meta: META }),
  rpc(2, "resources/list", { _meta: META }),
  rpc(3, "prompts/list", { _meta: META }),
  rpc(4, "tools/call", {
    _meta: META,
    name: "company.route",
    arguments: { taskDescription: "plan the q3 platform roadmap and ship the mobile release" }
  }),
  rpc(5, "resources/read", { _meta: META, uri: "company://departments" })
];

for (const request of REQUESTS) {
  test(`AT-002: ${request.method} is byte-level identical over stdio and Streamable HTTP`, () => {
    const stdioOut = processLine(JSON.stringify(request), config);
    const httpResult = handleHttpPost(
      { body: JSON.stringify(request), headers: {} },
      config
    );
    assert.ok(stdioOut, "stdio produced no response");
    assert.equal(httpResult.status, 200);
    assert.equal(stdioOut, httpResult.body);
  });
}
