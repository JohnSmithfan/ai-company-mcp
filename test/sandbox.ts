import net from "node:net";
import fs from "node:fs";
import cp from "node:child_process";

const patches: string[] = [];
const failures: string[] = [];
let installed = false;

export function installSandbox(): void {
  if (installed) {
    return;
  }
  installed = true;
  try {
    (globalThis as { fetch?: unknown }).fetch = () => {
      throw new Error("SANDBOX_VIOLATION: fetch blocked");
    };
    patches.push("fetch");
  } catch {
    failures.push("fetch");
  }
  try {
    (net.Socket.prototype as unknown as { connect: unknown }).connect =
      function connectBlocked() {
        throw new Error("SANDBOX_VIOLATION: socket connect blocked");
      };
    patches.push("net.Socket.connect");
  } catch {
    failures.push("net.Socket.connect");
  }
  try {
    const proto = Object.getPrototypeOf(fs.promises) as Record<string, unknown>;
    for (const method of [
      "writeFile",
      "appendFile",
      "open",
      "mkdir",
      "rm",
      "rmdir",
      "unlink",
      "rename",
      "copyFile",
      "truncate"
    ]) {
      if (typeof proto[method] === "function") {
        proto[method] = () => {
          throw new Error(`SANDBOX_VIOLATION: fs.promises.${method} blocked`);
        };
        patches.push(`fs.promises.${method}`);
      }
    }
  } catch {
    failures.push("fs.promises");
  }
  try {
    const proto = (cp.ChildProcess.prototype as unknown as Record<string, unknown>);
    proto["spawn"] = () => {
      throw new Error("SANDBOX_VIOLATION: subprocess spawn blocked");
    };
    patches.push("child_process.spawn");
  } catch {
    failures.push("child_process.spawn");
  }
  try {
    const mutable = fs as unknown as Record<string, unknown>;
    for (const method of [
      "writeFileSync",
      "appendFileSync",
      "mkdirSync",
      "mkdtempSync",
      "openSync",
      "rmSync",
      "rmdirSync",
      "unlinkSync",
      "renameSync",
      "copyFileSync",
      "truncateSync",
      "chmodSync",
      "createWriteStream",
      "writeSync"
    ]) {
      if (typeof mutable[method] === "function") {
        mutable[method] = () => {
          throw new Error(`SANDBOX_VIOLATION: fs.${method} blocked`);
        };
        patches.push(`fs.${method}`);
      }
    }
  } catch {
    failures.push("fs.sync");
  }
}

export interface SandboxReport {
  installed: boolean;
  patches: string[];
  failures: string[];
}

export function sandboxReport(): SandboxReport {
  return { installed, patches: [...patches], failures: [...failures] };
}
