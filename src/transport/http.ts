import { CompanyError } from "../errors/codes.js";
import {
  handleRequest,
  type ServerConfig
} from "../core/handlers.js";
import { PROTOCOL_VERSION_META_KEY } from "../core/version.js";

export interface HttpInput {
  body: string;
  headers?: Record<string, string | undefined>;
}

export interface HttpResult {
  status: number;
  headers: Record<string, string>;
  body: string;
}

function errorResult(
  status: number,
  error: CompanyError,
  id: number | string | null
): HttpResult {
  return {
    status,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(error.toJsonRpc(id))
  };
}

/**
 * Streamable HTTP adapter (FR-010) as a pure function: the host wires any
 * HTTP server to it, the adapter itself performs no network I/O. The
 * MCP-Protocol-Version header must carry the same version as the request
 * _meta when both are present (plan P-4).
 */
export function handleHttpPost(input: HttpInput, config: ServerConfig): HttpResult {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(input.headers ?? {})) {
    if (value !== undefined) {
      headers[key.toLowerCase()] = value;
    }
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(input.body);
  } catch {
    return errorResult(
      400,
      new CompanyError("COMPANY_001", "request body is not valid JSON"),
      null
    );
  }
  const meta = ((parsed as { params?: { _meta?: Record<string, unknown> } })
    .params?._meta ?? {}) as Record<string, unknown>;
  const headerVersion = headers["mcp-protocol-version"];
  const metaVersion = meta[PROTOCOL_VERSION_META_KEY];
  if (
    typeof headerVersion === "string" &&
    typeof metaVersion === "string" &&
    headerVersion !== metaVersion
  ) {
    return errorResult(
      400,
      new CompanyError(
        "COMPANY_002",
        `MCP-Protocol-Version header (${headerVersion}) does not match the _meta protocolVersion (${metaVersion})`
      ),
      (parsed as { id?: number | string }).id ?? null
    );
  }
  const response = handleRequest(parsed, config);
  if (response === null) {
    return { status: 202, headers: {}, body: "" };
  }
  return {
    status: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(response)
  };
}
