export interface ErrorCodeEntry {
  code: string;
  name: string;
  description: string;
  jsonrpc: number;
}

export const ERROR_CODES = {
  COMPANY_001: {
    code: "COMPANY_001",
    name: "InvalidInput",
    description:
      "The request input is missing, malformed, unknown, or exceeds the documented size limit.",
    jsonrpc: -32602
  },
  COMPANY_002: {
    code: "COMPANY_002",
    name: "UnsupportedProtocolVersion",
    description:
      "The request declares a protocol version the server does not support; the supported range is returned in the error data.",
    jsonrpc: -32000
  },
  COMPANY_003: {
    code: "COMPANY_003",
    name: "ReadOnlyMode",
    description:
      "The server operates in default read-only mode and rejects every mutating tool.",
    jsonrpc: -32002
  },
  COMPANY_004: {
    code: "COMPANY_004",
    name: "ApprovalRequired",
    description:
      "A side-effecting tool requires an approval token obtained via elicitation/create.",
    jsonrpc: -32003
  },
  COMPANY_005: {
    code: "COMPANY_005",
    name: "RegistryUnavailable",
    description:
      "The department registry is missing, unparsable, or its profile configuration is invalid.",
    jsonrpc: -32004
  }
} as const satisfies Record<string, ErrorCodeEntry>;

export type CompanyCode = keyof typeof ERROR_CODES;

export interface JsonRpcErrorShape {
  code: number;
  message: string;
  data?: Record<string, unknown>;
}

export interface JsonRpcResponseShape {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: unknown;
  error?: JsonRpcErrorShape;
}

export class CompanyError extends Error {
  readonly code: CompanyCode;
  readonly extra?: Record<string, unknown>;

  constructor(
    code: CompanyCode,
    message: string,
    extra?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.extra = extra;
  }

  get errorName(): string {
    return this.code === "COMPANY_002"
      ? "UnsupportedProtocolVersionError"
      : `CompanyError(${this.code})`;
  }

  toJsonRpc(id: number | string | null): JsonRpcResponseShape {
    const entry = ERROR_CODES[this.code];
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: entry.jsonrpc,
        message: `${this.errorName}: ${this.message}`,
        data: { companyCode: this.code, ...this.extra }
      }
    };
  }
}
