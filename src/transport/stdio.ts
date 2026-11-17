import { createInterface } from "node:readline";
import { CompanyError } from "../errors/codes.js";
import {
  handleRequest,
  type ServerConfig
} from "../core/handlers.js";
import { createSession, type SessionState } from "../core/session.js";
import { DEFAULT_PROFILE, parseProfile } from "../registry/registry.js";
import { ApprovalRegistry } from "../approval/approval.js";

/**
 * stdio framing (FR-010): one JSON-RPC message per line. Returns the
 * response line, or null for notifications and blank lines. A session
 * (FR-016) may be supplied for connection-scoped handshake compatibility.
 */
export function processLine(
  line: string,
  config: ServerConfig,
  session?: SessionState
): string | null {
  const trimmed = line.trim();
  if (trimmed === "") {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return JSON.stringify(
      new CompanyError("COMPANY_001", "line is not valid JSON").toJsonRpc(null)
    );
  }
  const response = handleRequest(parsed, config, session);
  return response === null ? null : JSON.stringify(response);
}

export function createDefaultConfig(): ServerConfig {
  const profile = parseProfile(
    process.env["AICOMPANY_PROFILE"] ?? DEFAULT_PROFILE
  );
  const readOnly = (
    process.env["AICOMPANY_READ_ONLY"] ?? "true"
  ).toLowerCase().trim() !== "false";
  return {
    name: "ai-company-mcp",
    version: "0.1.0",
    profile,
    readOnly,
    approvals: new ApprovalRegistry(),
    elicitationSupported: true
  };
}

export async function serveStdio(config: ServerConfig): Promise<void> {
  const session = createSession();
  const lines = createInterface({ input: process.stdin });
  for await (const line of lines) {
    const out = processLine(line, config, session);
    if (out !== null) {
      process.stdout.write(`${out}\n`);
    }
  }
}
