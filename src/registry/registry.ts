import { CompanyError } from "../errors/codes.js";

export const PROFILE_ORDER = [
  "micro",
  "small",
  "medium",
  "large",
  "group"
] as const;

export type Profile = (typeof PROFILE_ORDER)[number];

export const DEFAULT_PROFILE: Profile = "micro";

export interface Department {
  slug: string;
  domain: string;
  name: string;
  responsibility: string;
  keywords: string[];
  minProfile: Profile;
}

interface DepartmentSeed {
  domain: string;
  slug: string;
  name: string;
  responsibility: string;
  keywords: string[];
  minProfile: Profile;
}

/**
 * Single versioned dataset (plan S3.1). The five size profiles are filtered
 * views of this one dataset via `minProfile`, so the superset chain
 * micro < small < medium < large < group holds by construction.
 */
const SEEDS: DepartmentSeed[] = [
  { domain: "strategy", slug: "ceo-office", name: "CEO Office", responsibility: "Sets company direction and arbitrates cross-domain priorities.", keywords: ["vision", "direction", "company-level"], minProfile: "micro" },
  { domain: "strategy", slug: "chief-of-staff", name: "Chief of Staff", responsibility: "Coordinates the leadership agenda and unblocks stuck work.", keywords: ["coordination", "priorities", "unblock"], minProfile: "micro" },
  { domain: "engineering", slug: "platform", name: "Platform Engineering", responsibility: "Owns the shared platform layer other teams build upon.", keywords: ["platform", "shared core"], minProfile: "small" },
  { domain: "product", slug: "discovery", name: "Product Discovery", responsibility: "Turns ideas into validated product opportunities and roadmaps.", keywords: ["roadmap", "discovery", "opportunity"], minProfile: "small" },
  { domain: "operations", slug: "delivery", name: "Delivery Operations", responsibility: "Keeps commitments on track from plan to release.", keywords: ["delivery", "shipping", "release"], minProfile: "small" },
  { domain: "design", slug: "brand", name: "Brand Design", responsibility: "Maintains the visual identity and brand system.", keywords: ["brand", "visual identity"], minProfile: "medium" },
  { domain: "growth", slug: "marketing", name: "Marketing", responsibility: "Runs positioning, campaigns, and demand generation.", keywords: ["marketing", "campaign"], minProfile: "medium" },
  { domain: "governance", slug: "compliance", name: "Compliance", responsibility: "Keeps the company aligned with policies and regulations.", keywords: ["compliance", "policy", "regulation"], minProfile: "medium" },
  { domain: "growth", slug: "sales", name: "Sales", responsibility: "Converts qualified demand into signed agreements.", keywords: ["sales", "pipeline", "deal"], minProfile: "medium" },
  { domain: "engineering", slug: "frontend", name: "Frontend Engineering", responsibility: "Builds the user-facing application surfaces.", keywords: ["frontend", "ui implementation"], minProfile: "large" },
  { domain: "engineering", slug: "backend", name: "Backend Engineering", responsibility: "Implements services, APIs, and data flows.", keywords: ["backend", "api", "service"], minProfile: "large" },
  { domain: "engineering", slug: "qa", name: "Quality Assurance", responsibility: "Guards correctness with test plans and regression suites.", keywords: ["qa", "testing", "regression"], minProfile: "large" },
  { domain: "product", slug: "requirements", name: "Requirements", responsibility: "Writes precise, testable requirements for delivery.", keywords: ["requirements", "specification"], minProfile: "large" },
  { domain: "design", slug: "ux", name: "UX Design", responsibility: "Designs flows and interfaces that solve user problems.", keywords: ["ux", "usability", "flow"], minProfile: "large" },
  { domain: "growth", slug: "content", name: "Content", responsibility: "Produces documentation, articles, and lifecycle messaging.", keywords: ["content", "documentation", "article"], minProfile: "large" },
  { domain: "operations", slug: "hr", name: "People Operations", responsibility: "Handles hiring, onboarding, and team health.", keywords: ["hiring", "onboarding", "people"], minProfile: "large" },
  { domain: "operations", slug: "legal", name: "Legal", responsibility: "Reviews contracts and protects the company legally.", keywords: ["legal", "contract", "terms"], minProfile: "large" },
  { domain: "strategy", slug: "market-intelligence", name: "Market Intelligence", responsibility: "Tracks competitors and market movements with sourced evidence.", keywords: ["market intelligence", "competitor"], minProfile: "large" },
  { domain: "engineering", slug: "data", name: "Data Engineering", responsibility: "Owns pipelines, warehouses, and data quality.", keywords: ["data pipeline", "warehouse"], minProfile: "group" },
  { domain: "engineering", slug: "security", name: "Security Engineering", responsibility: "Threat-models and hardens every system the company runs.", keywords: ["security", "threat", "hardening"], minProfile: "group" },
  { domain: "engineering", slug: "infrastructure", name: "Infrastructure", responsibility: "Runs deployment, observability, and capacity.", keywords: ["infrastructure", "deployment", "observability"], minProfile: "group" },
  { domain: "engineering", slug: "mobile", name: "Mobile Engineering", responsibility: "Ships the mobile release train and app store presence.", keywords: ["mobile", "app release"], minProfile: "group" },
  { domain: "product", slug: "analytics", name: "Product Analytics", responsibility: "Instrumented metrics and experiment readouts.", keywords: ["analytics", "experiment", "metric"], minProfile: "group" },
  { domain: "product", slug: "pricing", name: "Pricing", responsibility: "Designs and validates pricing and packaging.", keywords: ["pricing", "packaging"], minProfile: "group" },
  { domain: "design", slug: "research", name: "Design Research", responsibility: "Runs user interviews and synthesizes evidence.", keywords: ["user research", "interview"], minProfile: "group" },
  { domain: "design", slug: "interaction", name: "Interaction Design", responsibility: "Defines motion, state, and interaction patterns.", keywords: ["interaction", "motion", "prototype"], minProfile: "group" },
  { domain: "growth", slug: "partnerships", name: "Partnerships", responsibility: "Builds integration and co-marketing partnerships.", keywords: ["partnership", "integration deal"], minProfile: "group" },
  { domain: "growth", slug: "customer-success", name: "Customer Success", responsibility: "Retains and expands the existing customer base.", keywords: ["customer success", "retention"], minProfile: "group" },
  { domain: "operations", slug: "procurement", name: "Procurement", responsibility: "Sources vendors and manages spend.", keywords: ["procurement", "vendor"], minProfile: "group" },
  { domain: "operations", slug: "facilities", name: "Facilities", responsibility: "Manages the physical and virtual workspace.", keywords: ["facilities", "workspace"], minProfile: "group" },
  { domain: "operations", slug: "support", name: "Support", responsibility: "Answers users and triages incidents.", keywords: ["support", "incident triage"], minProfile: "group" },
  { domain: "governance", slug: "risk", name: "Risk Management", responsibility: "Maintains the risk register and mitigation plans.", keywords: ["risk", "mitigation"], minProfile: "group" },
  { domain: "governance", slug: "ethics", name: "Ethics Board", responsibility: "Reviews decisions with ethical or societal impact.", keywords: ["ethics", "responsible"], minProfile: "group" },
  { domain: "strategy", slug: "corporate-development", name: "Corporate Development", responsibility: "Evaluates M&A and strategic investment options.", keywords: ["corporate development", "investment"], minProfile: "group" },
  { domain: "strategy", slug: "international", name: "International", responsibility: "Adapts the product and company for new regions.", keywords: ["international", "localization"], minProfile: "group" },
  { domain: "strategy", slug: "innovation-lab", name: "Innovation Lab", responsibility: "Prototypes the next product horizon.", keywords: ["innovation", "prototype horizon"], minProfile: "group" }
];

export const DEPARTMENTS: Department[] = SEEDS.map((seed) => ({ ...seed }));

const profileRank = (profile: Profile): number =>
  PROFILE_ORDER.indexOf(profile);

export function parseProfile(value: unknown): Profile {
  if (
    typeof value === "string" &&
    (PROFILE_ORDER as readonly string[]).includes(value)
  ) {
    return value as Profile;
  }
  throw new CompanyError(
    "COMPANY_005",
    `unknown size profile: ${String(value)}; expected one of ${PROFILE_ORDER.join(", ")}`
  );
}

export interface RegistryView {
  profile: Profile;
  registryVersion: string;
  departments: Department[];
}

export function getRegistry(profile: Profile): RegistryView {
  const maxRank = profileRank(profile);
  return {
    profile,
    registryVersion: "0.1.0",
    departments: DEPARTMENTS.filter(
      (department) => profileRank(department.minProfile) <= maxRank
    )
  };
}

export function departmentCount(profile: Profile): number {
  return getRegistry(profile).departments.length;
}

export function renderRegistryResource(profile: Profile): string {
  const registry = getRegistry(profile);
  const domains: Array<{
    domain: string;
    departments: Array<Record<string, unknown>>;
  }> = [];
  for (const department of registry.departments) {
    let bucket = domains.find((entry) => entry.domain === department.domain);
    if (bucket === undefined) {
      bucket = { domain: department.domain, departments: [] };
      domains.push(bucket);
    }
    bucket.departments.push({
      slug: department.slug,
      name: department.name,
      responsibility: department.responsibility,
      keywords: department.keywords
    });
  }
  return JSON.stringify({
    registry_version: registry.registryVersion,
    profile,
    department_count: registry.departments.length,
    domains
  });
}
