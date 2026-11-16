import { CompanyError } from "../errors/codes.js";

/**
 * All officially published MCP specification revisions (A-grade evidence:
 * modelcontextprotocol.io Versioning page, snapshot 2026-11-16). Draft
 * revisions are excluded by definition ("not yet ready for consumption").
 */
export const SUPPORTED_PROTOCOL_VERSIONS = [
  "2024-11-05",
  "2025-03-26",
  "2025-06-18",
  "2025-11-25",
  "2026-07-28"
] as const;

export const PRIMARY_PROTOCOL_VERSION = "2026-07-28";

export const PROTOCOL_VERSION_META_KEY =
  "io.modelcontextprotocol/protocolVersion";

export function negotiateProtocolVersion(params: unknown): string {
  const meta = (params as { _meta?: Record<string, unknown> } | undefined)
    ?._meta;
  const declared = meta?.[PROTOCOL_VERSION_META_KEY];
  if (
    typeof declared !== "string" ||
    !(SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(declared)
  ) {
    const reason =
      declared === undefined
        ? "request is missing the protocol version declaration"
        : `unsupported protocol version: ${String(declared)}`;
    throw new CompanyError("COMPANY_002", reason, {
      supportedVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
      primaryProtocolVersion: PRIMARY_PROTOCOL_VERSION
    });
  }
  return declared;
}
