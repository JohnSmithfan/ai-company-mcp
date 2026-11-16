import { join } from "node:path";
import { scanSrc } from "./scan.js";

const root = join(process.cwd(), "src");
const result = scanSrc(root);
for (const violation of result.violations) {
  console.error(
    `banned import at ${violation.file}:${violation.line}: ${violation.text.trim()}`
  );
}
console.error(
  `sandbox scan complete: ${result.scanned} files scanned, ${result.violations.length} violations`
);
if (result.violations.length > 0) {
  process.exitCode = 1;
}
