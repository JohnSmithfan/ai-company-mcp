# Security Policy

## Supported versions

No version has been released. The repository is at SDD Step 1 (specification
only) and contains no runnable server.

| Version | Supported |
| --- | --- |
| `v0.1.0` and later | Planned; support terms will be defined at first release |
| Pre-release `main` | Not supported; no stability or security guarantee |

## Reporting a vulnerability

Use GitHub's **private vulnerability reporting** (repository Security tab ->
"Report a vulnerability"). Enable that feature before publishing. Do **not** open
a public issue, discussion, or pull request for a security problem.

Include: affected component/path, MCP protocol version and transport used,
reproduction steps, observed vs expected behavior, and impact. Do not include
real credentials, personal data, or third-party confidential information.

This project is maintained on a best-effort basis by a small team. Reports are
triaged privately; please allow time for a response before any public disclosure.

## MCP-specific threat model (design constraints)

These are enforced by `CONSTITUTION.md` and the specification, and are the first
things to re-check when implementation begins:

| Risk | Mitigation |
| --- | --- |
| Malicious or misleading tool descriptions | Tool metadata is versioned and reviewed; no dynamic tool descriptions from task input |
| Command injection through stdio servers | No subprocess execution, no shell interpolation, no filesystem writes |
| Token passthrough / confused deputy | No credential access, no downstream token forwarding, no outbound network calls |
| Unapproved side effects | Read-only by default; all mutations require human approval via elicitation |
| PII leakage through logs or audit records | PII-like patterns masked before any audit record or response |
| Deprecated MCP client primitives | `sampling` and `logging` are not used (deprecated in `2026-07-28`) |
| Protocol downgrade | Unsupported or missing `_meta.protocolVersion` is rejected, never guessed |

## Out of scope

Security issues in upstream MCP hosts, model providers, operating systems, or
third-party orchestration frameworks should be reported to those projects. This
policy covers only the code and documents in this repository.
