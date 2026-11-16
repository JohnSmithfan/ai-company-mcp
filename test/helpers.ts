import { ApprovalRegistry } from "../src/approval/approval.js";
import type { ServerConfig } from "../src/core/handlers.js";
import type { Profile } from "../src/registry/registry.js";

export interface TestConfigOverrides {
  profile?: Profile;
  readOnly?: boolean;
  elicitationSupported?: boolean;
}

export function makeTestConfig(overrides: TestConfigOverrides = {}): ServerConfig {
  return {
    name: "ai-company-mcp",
    version: "0.1.0",
    profile: overrides.profile ?? "micro",
    readOnly: overrides.readOnly ?? true,
    approvals: new ApprovalRegistry(),
    elicitationSupported: overrides.elicitationSupported ?? true
  };
}

export const META: Record<string, string> = {
  "io.modelcontextprotocol/protocolVersion": "2026-07-28"
};

export function metaWithVersion(version: string): Record<string, string> {
  return { "io.modelcontextprotocol/protocolVersion": version };
}

export interface RpcRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

export function rpc(
  id: number | string,
  method: string,
  params?: Record<string, unknown>
): RpcRequest {
  return { jsonrpc: "2.0", id, method, params };
}
