// SPDX-License-Identifier: GPL-3.0-or-later
// SC-001 cold-start benchmark (spec: four server/discover calls, p95 < 200 ms,
// measured on a CI runner). This script deliberately runs OUTSIDE the
// node:test suite: the suite enforces the AT-006 sandbox contract
// (zero subprocesses for the whole suite), while this benchmark spawns the
// real server binary to measure a true process cold start. Node stdlib only.
//
// Usage: npm run build && npm run bench

import { spawn } from "node:child_process";

const THRESHOLD_MS = 200;
const CALLS = 4;

function jsonLine(id, method, params = {}) {
  // The protocol version is declared under the namespaced _meta key defined
  // by the 2026-07-28 stateless contract (see spec FR-011).
  return JSON.stringify({
    jsonrpc: "2.0",
    id,
    method,
    params: {
      ...params,
      _meta: { "io.modelcontextprotocol/protocolVersion": "2026-07-28" }
    }
  });
}

function fail(message) {
  try {
    child.kill();
  } catch {
    // child may not be spawnable yet; nothing to clean up
  }
  console.error(`bench FAIL: ${message}`);
  process.exit(1);
}

if (process.platform !== "linux" && !process.env["BENCH_ALLOW_NON_LINUX"]) {
  // Spec pins the claim to CI runners; other platforms are advisory only.
  console.error("bench: non-linux platform, results are advisory only");
}

const child = spawn(process.execPath, ["dist/src/main.js"], {
  stdio: ["pipe", "pipe", "pipe"]
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
child.stderr.on("data", () => {}); // diagnostics only; server writes no logs
child.on("exit", (code) => {
  if (code !== 0 && pending.size > 0) {
    fail(`server exited early with code ${code}`);
  }
});

function request(id, method, params) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`timeout waiting for response to id ${id}`));
    }, 5000);
    pending.set(id, (value) => {
      clearTimeout(timer);
      resolve(value);
    });
    child.stdin.write(`${jsonLine(id, method, params)}\n`);
  });
}

const samples = [];
try {
  for (let i = 1; i <= CALLS; i++) {
    const start = performance.now();
    const response = await request(i, "server/discover");
    const elapsed = performance.now() - start;
    const result = response.result ?? {};
    if (!Array.isArray(result.supportedVersions) ||
        !result.supportedVersions.includes("2026-07-28")) {
      fail(`discovery response ${i} is missing supportedVersions`);
    }
    samples.push(elapsed);
  }
} catch (error) {
  fail(error.message);
} finally {
  child.kill();
}

// p95 of 4 samples rounds up to the maximum.
const p95 = Math.max(...samples);
const cold = samples[0].toFixed(1);
for (let i = 0; i < samples.length; i++) {
  console.error(`  call ${i + 1}${i === 0 ? " (cold start)" : ""}: ${samples[i].toFixed(1)} ms`);
}
console.error(`  p95 (max of ${CALLS}): ${p95.toFixed(1)} ms, threshold ${THRESHOLD_MS} ms`);
if (p95 >= THRESHOLD_MS) {
  fail(`p95 ${p95.toFixed(1)} ms exceeds SC-001 threshold ${THRESHOLD_MS} ms`);
}
console.error("bench PASS: SC-001 cold-start p95 within threshold");
