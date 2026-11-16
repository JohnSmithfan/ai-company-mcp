export interface AuditRecord {
  trace_id: string;
  timestamp: string;
  actor: string;
  action: string;
  aigc: { label: string; watermark: string };
  masked_input_digest: string;
}

/** Deterministic 32-bit FNV-1a hash, rendered as 8 hex characters. */
export function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

let sequence = 0;

/**
 * FR-008: AuditRecords are constructed in memory and returned with the
 * response only. There is no persistence and no host-side log sinking.
 */
export function createAuditRecord(
  action: string,
  actor: string,
  maskedInput: string
): AuditRecord {
  sequence += 1;
  const timestamp = `${new Date().toISOString().slice(0, 19)}Z`;
  const compact = timestamp.replace(/[-:T]/g, "");
  return {
    trace_id: `AICM-${compact}-${sequence.toString(16).padStart(4, "0")}`,
    timestamp,
    actor,
    action,
    aigc: {
      label: "AI_ASSISTED_ACTION_HUMAN_APPROVED",
      watermark: "AICOMPANYMCP-AUDIT"
    },
    masked_input_digest: fnv1aHex(maskedInput)
  };
}
