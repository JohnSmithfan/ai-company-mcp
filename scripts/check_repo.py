#!/usr/bin/env python3
"""Repository contract gate for ai-company-mcp.

Enforces the mechanical parts of CONSTITUTION.md:
  - required GitHub community health files exist
  - all text files are UTF-8 without BOM and use LF endings
  - no absolute user paths leak into tracked documents
  - issue forms carry the name/description keys GitHub requires
  - the SDD spec has all mandatory sections
  - every FR-* requirement is covered by the ATDD acceptance contract
  - AT-* IDs are unique and each scenario has Given/When/Then

Stdlib only. No network, no writes, no third-party dependencies.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REQUIRED_FILES = (
    "README.md",
    "README.zh.md",
    "LICENSE",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
    "SUPPORT.md",
    "CHANGELOG.md",
    "CONSTITUTION.md",
    "AGENTS.md",
    ".gitignore",
    ".gitattributes",
    ".editorconfig",
    "docs/development-method.md",
    "docs/research/competitive-analysis.md",
    "specs/001-core-mcp-server/spec.md",
    "scripts/check_repo.py",
    ".github/ISSUE_TEMPLATE/bug_report.yml",
    ".github/ISSUE_TEMPLATE/feature_request.yml",
    ".github/ISSUE_TEMPLATE/config.yml",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/workflows/ci.yml",
    ".github/dependabot.yml",
)

SPEC_PATH = "specs/001-core-mcp-server/spec.md"

MANDATORY_SECTIONS = (
    "## User Scenarios & Testing",
    "## Requirements",
    "## Success Criteria",
    "## Assumptions",
    "## ATDD Acceptance Contract",
)

SKIP_DIRS = {
    ".git",
    "__pycache__",
    ".pytest_cache",
    ".venv",
    "venv",
    "node_modules",
    ".workbuddy",
    ".skill-upgrade",
    "htmlcov",
    "dist",
    "build",
}

# "Us[e]rs" is a character class so this detector never matches its own source.
USER_PATH_RE = re.compile(
    r"(?:[A-Za-z]:[\\/]Us[e]rs[\\/]|/c/Us[e]rs/|/Us[e]rs/|/home/[A-Za-z0-9_.-]+/)"
)
FR_RE = re.compile(r"\*\*(FR-\d{3})\*\*")
AT_RE = re.compile(r"AT-\d{3}")


def iter_text_files(root: Path):
    for path in sorted(root.rglob("*")):
        if not path.is_file() or any(part in SKIP_DIRS for part in path.parts):
            continue
        yield path


def section(text: str, heading: str) -> str:
    """Return the body of a section, up to the next heading at the same level."""
    start = text.find(heading)
    if start < 0:
        return ""
    level = len(heading) - len(heading.lstrip("#"))
    body_start = text.find("\n", start)
    if body_start < 0:
        return ""
    match = re.search(rf"^#{{1,{level}}} ", text[body_start + 1 :], re.MULTILINE)
    end = body_start + 1 + match.start() if match else len(text)
    return text[body_start + 1 : end]


def check(root: Path) -> tuple[list[str], dict[str, int]]:
    errors: list[str] = []
    stats: dict[str, int] = {}

    for rel in REQUIRED_FILES:
        if not (root / rel).is_file():
            errors.append(f"missing required file: {rel}")

    files = list(iter_text_files(root))
    stats["files_checked"] = len(files)
    for path in files:
        rel = path.relative_to(root).as_posix()
        data = path.read_bytes()
        if data.startswith(b"\xef\xbb\xbf"):
            errors.append(f"UTF-8 BOM present: {rel}")
        if b"\r\n" in data:
            errors.append(f"CRLF line endings: {rel}")
        try:
            text = data.decode("utf-8")
        except UnicodeDecodeError as exc:
            errors.append(f"not valid UTF-8: {rel} ({exc})")
            continue
        if USER_PATH_RE.search(text):
            errors.append(f"absolute user path leaked: {rel}")

    template_dir = root / ".github" / "ISSUE_TEMPLATE"
    forms = sorted(template_dir.glob("*.yml")) if template_dir.is_dir() else []
    stats["issue_forms"] = len([p for p in forms if p.name != "config.yml"])
    for form in forms:
        if form.name == "config.yml":
            continue
        content = form.read_text(encoding="utf-8")
        for key in ("name:", "description:"):
            if not re.search(rf"^{re.escape(key)}", content, re.MULTILINE):
                errors.append(f"issue form missing top-level {key} {form.name}")

    spec_file = root / SPEC_PATH
    if not spec_file.is_file():
        errors.append(f"spec not found: {SPEC_PATH}")
        return errors, stats

    spec_text = spec_file.read_text(encoding="utf-8")
    for heading in MANDATORY_SECTIONS:
        if heading not in spec_text:
            errors.append(f"spec missing mandatory section: {heading}")

    fr_body = section(spec_text, "### Functional Requirements")
    fr_ids = FR_RE.findall(fr_body)
    contract = section(spec_text, "## ATDD Acceptance Contract")
    at_ids = AT_RE.findall(contract)
    stats["requirements"] = len(set(fr_ids))
    stats["scenarios"] = len(set(at_ids))
    stats["clarifications"] = spec_text.count("NEEDS CLARIFICATION")

    if not fr_ids:
        errors.append("spec has no FR-* requirements")
    if not at_ids:
        errors.append("spec has no AT-* acceptance scenarios")
    if len(at_ids) != len(set(at_ids)):
        errors.append("duplicate AT-* IDs in acceptance contract")
    for fr_id in sorted(set(fr_ids)):
        if fr_id not in contract:
            errors.append(f"orphan requirement (no AT-* coverage): {fr_id}")
    for line in contract.splitlines():
        if line.startswith("| AT-"):
            for keyword in ("Given", "When", "Then"):
                if keyword not in line:
                    errors.append(f"scenario row missing {keyword}: {line[:60]}")

    return errors, stats


def main() -> int:
    parser = argparse.ArgumentParser(description="Repository contract gate")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parent.parent,
        help="Repository root (defaults to the parent of scripts/)",
    )
    args = parser.parse_args()
    root = args.root.resolve()
    errors, stats = check(root)

    summary = " ".join(f"{key}={value}" for key, value in sorted(stats.items()))
    if errors:
        print(f"FAIL ({len(errors)} issue(s)) — {summary}")
        for error in errors:
            print(f"  - {error}")
        return 1
    print(f"PASS — {summary}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
