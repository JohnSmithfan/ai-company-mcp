import { CompanyError } from "../errors/codes.js";
import {
  PRIMARY_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS
} from "./version.js";

/**
 * Per-connection session state (FR-016). A handshake-era host completes an
 * `initialize` exchange; afterwards, requests on the same connection may omit
 * the `_meta` protocol declaration and inherit the negotiated version.
 * Explicit `_meta` declarations always win; a session without a completed
 * handshake keeps FR-011 rejection semantics.
 */
export interface SessionState {
  negotiatedVersion?: string;
}

export function createSession(): SessionState {
  return {};
}

/**
 * Validates a handshake-era `initialize` request's top-level protocolVersion
 * against the supported published versions. Rejections are documented
 * COMPANY_* errors (FR-014) with the same support data as FR-011.
 */
export function negotiateHandshakeVersion(protocolVersion: unknown): string {
  if (
    typeof protocolVersion !== "string" ||
    !(SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(protocolVersion)
  ) {
    const reason =
      typeof protocolVersion === "string"
        ? `unsupported protocol version: ${protocolVersion}`
        : "initialize request is missing the protocol version declaration";
    throw new CompanyError("COMPANY_002", reason, {
      supportedVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
      primaryProtocolVersion: PRIMARY_PROTOCOL_VERSION
    });
  }
  return protocolVersion;
}
