import assert from "node:assert/strict";
import { test } from "node:test";
import net from "node:net";
import fs from "node:fs";
import cp from "node:child_process";
import { fileURLToPath } from "node:url";
import { installSandbox, sandboxReport } from "./sandbox.js";
import { scanSrc } from "../src/sandbox/scan.js";

installSandbox();

test("AT-006: sandbox hooks are installed before the suite runs", () => {
  const report = sandboxReport();
  assert.equal(report.installed, true);
  assert.ok(report.patches.includes("fetch"), "fetch patch missing");
  assert.ok(
    report.patches.includes("net.Socket.connect"),
    "socket patch missing"
  );
  assert.ok(
    report.patches.includes("child_process.spawn"),
    "subprocess patch missing"
  );
  assert.ok(
    report.patches.includes("fs.writeFileSync"),
    "sync write patch missing"
  );
});

test("AT-006: outbound fetch is blocked at runtime", () => {
  assert.throws(() => fetch("https://example.invalid/"), /SANDBOX_VIOLATION/);
});

test("AT-006: socket connect is blocked at runtime", () => {
  const socket = new net.Socket();
  assert.throws(
    () => socket.connect(80, "example.invalid"),
    /SANDBOX_VIOLATION/
  );
});

test("AT-006: subprocess spawn is blocked at runtime", () => {
  const child = new cp.ChildProcess();
  assert.throws(
    () => (child as unknown as { spawn: () => void }).spawn(),
    /SANDBOX_VIOLATION/
  );
});

test("AT-006: sync filesystem writes are blocked at runtime", () => {
  assert.throws(
    () => fs.writeFileSync("sandbox-probe-should-not-exist.txt", "x"),
    /SANDBOX_VIOLATION/
  );
});

test("AT-006: static scan finds zero banned imports under src/", () => {
  const srcRoot = fileURLToPath(new URL("../../src/", import.meta.url));
  const result = scanSrc(srcRoot);
  assert.equal(
    result.violations.length,
    0,
    JSON.stringify(result.violations)
  );
});
