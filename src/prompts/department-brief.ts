import { getRegistry, type Profile } from "../registry/registry.js";

export const DEPARTMENT_BRIEF_PROMPT_NAME = "department-brief";

/**
 * FR-013: a pure structural template over the active profile's registry.
 * It contains no instructions that require external tools.
 */
export function buildDepartmentBrief(profile: Profile): string {
  const registry = getRegistry(profile);
  const lines: string[] = [
    `AI virtual company brief - profile: ${profile} (${registry.departments.length} departments).`,
    ""
  ];
  let currentDomain = "";
  for (const department of registry.departments) {
    if (department.domain !== currentDomain) {
      currentDomain = department.domain;
      lines.push(`## ${department.domain}`);
    }
    lines.push(
      `- ${department.slug}: ${department.name} - ${department.responsibility}`
    );
  }
  return lines.join("\n");
}
