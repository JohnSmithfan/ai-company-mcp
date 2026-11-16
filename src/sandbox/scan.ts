import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * AT-006 static layer: any of these modules imported from src/ would enable
 * network I/O, filesystem writes, or subprocess execution, all forbidden by
 * FR-006. The sandbox modules themselves (src/sandbox/) are the only
 * read-only fs users and are excluded from the scan.
 */
const MODULES = [
  "fs",
  "fs/promises",
  "net",
  "http",
  "https",
  "dns",
  "tls",
  "dgram",
  "child_process",
  "cluster",
  "worker_threads"
].join("|");

export const BANNED_IMPORT_RE = new RegExp(
  `(?:from\\s*|import\\s*|require\\(\\s*)(["'])(node:)?(?:${MODULES})\\1`
);

export interface ScanViolation {
  file: string;
  line: number;
  text: string;
}

export interface ScanResult {
  scanned: number;
  violations: ScanViolation[];
}

export function scanSrc(rootDir: string): ScanResult {
  const violations: ScanViolation[] = [];
  let scanned = 0;
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".ts")) {
        continue;
      }
      const rel = relative(rootDir, full);
      if (rel.split(sep)[0] === "sandbox") {
        continue;
      }
      scanned += 1;
      const content = readFileSync(full, "utf8");
      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        if (BANNED_IMPORT_RE.test(lines[i])) {
          violations.push({ file: rel, line: i + 1, text: lines[i] });
        }
      }
    }
  };
  walk(rootDir);
  return { scanned, violations };
}
