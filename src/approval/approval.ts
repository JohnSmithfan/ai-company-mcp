import { randomUUID } from "node:crypto";

export interface IssuedApproval {
  token: string;
  tool: string;
  instructions: string;
}

/**
 * FR-007: approval tokens are issued in-memory for side-effecting tools and
 * are consumed on first use. Tokens are bound to the tool they were issued
 * for; a token for a different tool never satisfies the gate.
 */
export class ApprovalRegistry {
  private readonly tokens = new Map<string, string>();

  issue(tool: string): IssuedApproval {
    const token = `ELIC-${randomUUID()}`;
    this.tokens.set(token, tool);
    return {
      token,
      tool,
      instructions:
        "Resubmit tools/call with _meta.approvalToken set to this token."
    };
  }

  consume(token: unknown, tool: string): boolean {
    if (typeof token !== "string") {
      return false;
    }
    const issuedFor = this.tokens.get(token);
    if (issuedFor !== tool) {
      return false;
    }
    this.tokens.delete(token);
    return true;
  }
}
