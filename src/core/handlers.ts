import { CompanyError, ERROR_CODES } from "../errors/codes.js";
import type { JsonRpcResponseShape } from "../errors/codes.js";
import {
  negotiateProtocolVersion,
  PRIMARY_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS
} from "./version.js";
import { ApprovalRegistry } from "../approval/approval.js";
import { createAuditRecord } from "../audit/audit.js";
import { maskPii } from "../pii/mask.js";
import {
  MAX_INPUT_CHARS,
  routeTask,
  validateTaskInput,
  type RoutingDecision
} from "../routing/route.js";
import {
  getRegistry,
  renderRegistryResource,
  type Profile
} from "../registry/registry.js";
import { validateSpec } from "../validator/validate.js";
import {
  buildDepartmentBrief,
  DEPARTMENT_BRIEF_PROMPT_NAME
} from "../prompts/department-brief.js";

export interface ServerConfig {
  name: string;
  version: string;
  profile: Profile;
  readOnly: boolean;
  approvals: ApprovalRegistry;
  elicitationSupported: boolean;
}

export const MUTATING_TOOLS = ["company.execute-decision"] as const;

const TOOLS: Array<Record<string, unknown>> = [
  {
    name: "company.route",
    description:
      "Deterministic department routing without any LLM call (FR-003/FR-005).",
    inputSchema: {
      type: "object",
      properties: {
        taskDescription: { type: "string", description: "Task to route." }
      },
      required: ["taskDescription"]
    },
    annotations: { readOnlyHint: true }
  },
  {
    name: "company.spec.validate",
    description:
      "Validates a specification document against mandatory sections and FR/AT contract rules (FR-012).",
    inputSchema: {
      type: "object",
      properties: { spec: { type: "string", description: "Spec document." } },
      required: ["spec"]
    },
    annotations: { readOnlyHint: true }
  },
  {
    name: "company.execute-decision",
    description:
      "Executes a routed decision (side-effecting). Requires read-write mode and an approval token from elicitation/create (FR-007/FR-009).",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", description: "Action to execute." }
      },
      required: ["action"]
    },
    annotations: { readOnlyHint: false }
  }
];

const RESOURCES: Array<Record<string, unknown>> = [
  {
    uri: "company://departments",
    name: "Department registry",
    mimeType: "application/json",
    description: "Versioned department registry for the active size profile."
  },
  {
    uri: "company://error-codes",
    name: "Error code contract",
    mimeType: "application/json",
    description: "The only documented, stable error codes this server emits."
  }
];

const PROMPTS: Array<Record<string, unknown>> = [
  {
    name: DEPARTMENT_BRIEF_PROMPT_NAME,
    description:
      "Structural brief of the active department registry (FR-013).",
    arguments: []
  }
];

function ok(id: number | string, result: unknown): JsonRpcResponseShape {
  return { jsonrpc: "2.0", id, result };
}

function dispatch(
  method: string,
  params: Record<string, unknown>,
  config: ServerConfig,
  id: number | string
): JsonRpcResponseShape {
  switch (method) {
    case "server/discover":
      return ok(id, {
        supportedVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
        primaryProtocolVersion: PRIMARY_PROTOCOL_VERSION,
        capabilities: {
          tools: { listChanged: false },
          resources: { subscribe: false },
          prompts: { listChanged: false }
        },
        serverInfo: {
          name: config.name,
          version: config.version,
          profile: config.profile
        }
      });
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call":
      return ok(id, callTool(params, config));
    case "resources/list":
      return ok(id, { resources: RESOURCES });
    case "resources/read":
      return ok(id, readResource(params, config));
    case "prompts/list":
      return ok(id, { prompts: PROMPTS });
    case "prompts/get":
      return ok(id, getPrompt(params, config));
    case "elicitation/create":
      return ok(id, createElicitation(params, config));
    case "initialize":
      throw new CompanyError(
        "COMPANY_001",
        "stateless protocol: initialize was removed in MCP 2026-07-28; declare the protocol version per request via params._meta"
      );
    default:
      throw new CompanyError("COMPANY_001", `unknown method: ${method}`);
  }
}

function callTool(
  params: Record<string, unknown>,
  config: ServerConfig
): unknown {
  const name = params["name"];
  const args = (params["arguments"] ?? {}) as Record<string, unknown>;
  const meta = (params["_meta"] ?? {}) as Record<string, unknown>;
  if (name === "company.route") {
    const description = args["taskDescription"];
    validateTaskInput(description);
    const decision = routeTask(
      description as string,
      getRegistry(config.profile).departments
    );
    return toolResult(decision);
  }
  if (name === "company.spec.validate") {
    const spec = args["spec"];
    if (typeof spec !== "string") {
      throw new CompanyError("COMPANY_001", "spec must be a string");
    }
    return toolResult(validateSpec(spec));
  }
  if (name === "company.execute-decision") {
    if (config.readOnly) {
      throw new CompanyError(
        "COMPANY_003",
        "server runs in default read-only mode; mutating tools are rejected"
      );
    }
    if (!config.elicitationSupported) {
      throw new CompanyError(
        "COMPANY_004",
        "host does not support elicitation; the mutating tool remains unavailable"
      );
    }
    if (
      !config.approvals.consume(
        meta["approvalToken"],
        "company.execute-decision"
      )
    ) {
      throw new CompanyError(
        "COMPANY_004",
        "a valid approval token from elicitation/create is required"
      );
    }
    const masked = maskPii(
      typeof args["action"] === "string" ? args["action"] : ""
    );
    const audit = createAuditRecord("company.execute-decision", "host", masked);
    return toolResult({ executed: true, audit });
  }
  throw new CompanyError("COMPANY_001", `unknown tool: ${String(name)}`);
}

function toolResult(structured: unknown): unknown {
  return {
    content: [{ type: "text", text: JSON.stringify(structured) }],
    structuredContent: structured
  };
}

function readResource(params: Record<string, unknown>, config: ServerConfig) {
  const uri = params["uri"];
  if (uri === "company://departments") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: renderRegistryResource(config.profile)
        }
      ]
    };
  }
  if (uri === "company://error-codes") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ codes: Object.values(ERROR_CODES) })
        }
      ]
    };
  }
  throw new CompanyError("COMPANY_001", `unknown resource uri: ${String(uri)}`);
}

function getPrompt(params: Record<string, unknown>, config: ServerConfig) {
  if (params["name"] === DEPARTMENT_BRIEF_PROMPT_NAME) {
    return {
      description:
        "Structural brief of the active department registry (FR-013).",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: buildDepartmentBrief(config.profile)
          }
        }
      ]
    };
  }
  throw new CompanyError(
    "COMPANY_001",
    `unknown prompt: ${String(params["name"])}`
  );
}

function createElicitation(
  params: Record<string, unknown>,
  config: ServerConfig
) {
  if (!config.elicitationSupported) {
    throw new CompanyError(
      "COMPANY_004",
      "host does not support elicitation"
    );
  }
  const tool = params["tool"];
  if (
    typeof tool !== "string" ||
    !(MUTATING_TOOLS as readonly string[]).includes(tool)
  ) {
    throw new CompanyError(
      "COMPANY_001",
      `elicitation is only available for mutating tools: ${MUTATING_TOOLS.join(", ")}`
    );
  }
  return config.approvals.issue(tool);
}

export { MAX_INPUT_CHARS, type RoutingDecision };

/**
 * Pure JSON-RPC entry point shared by every transport. Per-request protocol
 * version negotiation (FR-011) runs before dispatch; every error path is a
 * documented COMPANY_* code (FR-014).
 */
export function handleRequest(
  rawRequest: unknown,
  config: ServerConfig
): JsonRpcResponseShape | null {
  if (typeof rawRequest !== "object" || rawRequest === null) {
    return new CompanyError(
      "COMPANY_001",
      "request must be a JSON-RPC 2.0 object"
    ).toJsonRpc(null);
  }
  const request = rawRequest as {
    jsonrpc?: unknown;
    id?: unknown;
    method?: unknown;
    params?: unknown;
  };
  if (request.jsonrpc !== "2.0") {
    return new CompanyError(
      "COMPANY_001",
      'jsonrpc field must be "2.0"'
    ).toJsonRpc(null);
  }
  if (typeof request.method !== "string") {
    return new CompanyError(
      "COMPANY_001",
      "method must be a string"
    ).toJsonRpc(null);
  }
  if (request.id === undefined) {
    return null;
  }
  const id = request.id as number | string;
  try {
    const params =
      typeof request.params === "object" && request.params !== null
        ? (request.params as Record<string, unknown>)
        : {};
    negotiateProtocolVersion(params);
    return dispatch(request.method, params, config, id);
  } catch (error) {
    if (error instanceof CompanyError) {
      return error.toJsonRpc(id);
    }
    return new CompanyError("COMPANY_001", "internal error").toJsonRpc(id);
  }
}
