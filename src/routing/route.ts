import { CompanyError } from "../errors/codes.js";
import { maskPii } from "../pii/mask.js";
import type { Department } from "../registry/registry.js";

export const MAX_INPUT_CHARS = 100 * 1024;

export interface RoutingCandidate {
  slug: string;
  score: number;
}

export interface RoutingDecision {
  decision: "route" | "fallback";
  department: string | null;
  domain: string | null;
  candidates: RoutingCandidate[];
  confidence: number;
  marker: "NEEDS_CLARIFICATION" | null;
  input_masked: string;
}

export function validateTaskInput(description: unknown): void {
  if (typeof description !== "string") {
    throw new CompanyError("COMPANY_001", "taskDescription must be a string");
  }
  if (description.trim().length === 0) {
    throw new CompanyError("COMPANY_001", "taskDescription must not be empty");
  }
  if (description.length > MAX_INPUT_CHARS) {
    throw new CompanyError(
      "COMPANY_001",
      `taskDescription exceeds the ${MAX_INPUT_CHARS} character limit`
    );
  }
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) {
    return 0;
  }
  return haystack.split(needle).length - 1;
}

/**
 * FR-003/FR-005: deterministic keyword routing. No LLM call, no random
 * source, no time-dependent value enters the decision — identical input
 * yields byte-identical output (SC-002).
 */
export function routeTask(
  description: string,
  departments: Department[]
): RoutingDecision {
  validateTaskInput(description);
  const lower = description.toLowerCase();
  const scored = departments
    .map((department) => ({
      slug: department.slug,
      domain: department.domain,
      score: department.keywords.reduce(
        (sum, keyword) => sum + countOccurrences(lower, keyword.toLowerCase()),
        0
      )
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0)
    );
  const masked = maskPii(description);
  if (scored.length === 0) {
    return {
      decision: "fallback",
      department: null,
      domain: null,
      candidates: [],
      confidence: 0,
      marker: "NEEDS_CLARIFICATION",
      input_masked: masked
    };
  }
  const primary = scored[0];
  return {
    decision: "route",
    department: primary.slug,
    domain: primary.domain,
    candidates: scored
      .slice(0, 3)
      .map(({ slug, score }) => ({ slug, score })),
    confidence: Math.round(Math.min(1, primary.score / 5) * 100) / 100,
    marker: null,
    input_masked: masked
  };
}
