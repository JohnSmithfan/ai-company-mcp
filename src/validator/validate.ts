export interface SpecFinding {
  code: string;
  message: string;
  id?: string;
}

export interface ValidationResult {
  status: "pass" | "fail";
  findings: SpecFinding[];
  stats: { frs: number; ats: number };
}

const MANDATORY_SECTIONS = [
  "## User Scenarios & Testing",
  "## Requirements",
  "## Success Criteria",
  "## Assumptions"
];

const FR_RE = /\*\*(FR-\d{3})\*\*/g;
const AT_RE = /AT-\d{3}/g;

function extractSection(text: string, header: string): string {
  const lines = text.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim() === header);
  if (startIndex === -1) {
    return "";
  }
  const stopRe = header.startsWith("###") ? /^#{2,4}\s/ : /^##\s/;
  const collected: string[] = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (stopRe.test(lines[i])) {
      break;
    }
    collected.push(lines[i]);
  }
  return collected.join("\n");
}

/**
 * FR-012: mirrors the repository contract gate rules — mandatory sections,
 * orphaned FR ids, and duplicate AT ids — as a structured result (D5).
 */
export function validateSpec(text: string): ValidationResult {
  const findings: SpecFinding[] = [];
  const lines = text.split(/\r?\n/);
  for (const header of MANDATORY_SECTIONS) {
    if (!lines.some((line) => line.trim() === header)) {
      findings.push({
        code: "missing-section",
        message: `missing mandatory section: ${header}`
      });
    }
  }
  const frSection = extractSection(text, "### Functional Requirements") || text;
  const frIds = [...frSection.matchAll(FR_RE)].map((match) => match[1]);
  const uniqueFrs = [...new Set(frIds)];
  const contract = extractSection(text, "## ATDD Acceptance Contract");
  const atCounts = new Map<string, number>();
  for (const match of contract.matchAll(AT_RE)) {
    atCounts.set(match[0], (atCounts.get(match[0]) ?? 0) + 1);
  }
  for (const [id, count] of atCounts) {
    if (count > 1) {
      findings.push({
        code: "duplicate-at",
        message: `duplicate AT id in acceptance contract: ${id}`,
        id
      });
    }
  }
  for (const fr of uniqueFrs) {
    if (!contract.includes(fr)) {
      findings.push({
        code: "orphan-fr",
        message: `orphan requirement (no AT coverage): ${fr}`,
        id: fr
      });
    }
  }
  return {
    status: findings.length === 0 ? "pass" : "fail",
    findings,
    stats: { frs: uniqueFrs.length, ats: atCounts.size }
  };
}
