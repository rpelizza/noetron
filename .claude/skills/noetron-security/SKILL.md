---
name: noetron-security
description: Use when a change touches authentication, authorization, untrusted input, queries, sensitive data, uploads, CORS/SSRF surfaces, dependencies, secrets, logging of user data, or deserialization — before the final review of such changes; also when the user asks for a security review.
---

# Noetron Security

The security lens for changes that touch a sensitive surface. It reviews **the diff, not the whole repository** — focused on what changed and what the change newly exposes — and it runs **before the final review**, never deferred to closeout: `noetron-finish`'s safety net only catches what escaped; this skill is the rule the net backs up.

## Trigger surfaces

Any change touching: authentication or authorization · untrusted input (forms, params, headers, files) · queries (SQL/NoSQL/ORM raw paths) · sensitive data (PII, credentials, tokens, financial) · uploads and file handling · CORS, redirects, webhooks, outbound fetches (SSRF) · new or updated dependencies · secrets and configuration · logging that may capture user data · serialization/deserialization.

## Stack-aware, version-first

Before checking anything: identify the technology and **version actually in use** (`noetron-explore`: manifests, lockfiles), then confirm current guidance for that version via context7 or official docs. Security advice from memory ages worse than any other kind — a mitigation pattern for one major version is a vulnerability in the next.

## The pass

Apply the current OWASP Top 10 **to the diff**, surface by surface. For each triggered surface, answer with evidence (`file:line`):

1. **Access** — is every new path authenticated and authorized at the server, not the client? Does it fail closed? Object-level checks (no IDOR)?
2. **Input** — is every new untrusted input validated (allowlist over blocklist) and encoded at output? Parameterized queries only?
3. **Data** — is sensitive data encrypted in transit and at rest where required, excluded from logs, and never in URLs?
4. **Secrets** — no secret in code, diff, or output. **Never print secret values** — report *that* a secret is configured, never *what* it is.
5. **Dependencies** — new/updated packages: known CVEs for the pinned version? Install scripts? Typosquatting on the name?
6. **Design** — does the change create a new trust boundary nobody drew? (webhooks, redirects, file paths from input, outbound requests from user data)
7. **Failure** — do new error paths leak internals (stack traces, queries, versions) to the caller?

Not every item applies to every diff — check the triggered surfaces thoroughly and say which items were not applicable. Zero findings after a real pass is a valid outcome (`noetron-review` pre-report gate applies here too).

## Findings and fixes

Findings enter the normal review flow with `noetron-review` severities — a security Critical/Important triggers the fix loop like any other finding. **Fixes land before the final review.** A risk the user chooses to accept is a decision: it goes through `noetron-interview` and gets recorded (state/plan Decisions, ADR if architectural) — never silently waived. If a secret was exposed in history or logs: rotating it is part of the fix, and similar occurrences get swept (`noetron-explore`).

## Red flags

- Deferring security "to the end" — the end is `noetron-finish`, and it only nets.
- Reviewing from memory instead of version-confirmed guidance.
- Printing a secret value anywhere, including "just to check it".
- Client-side-only validation or authorization presented as protection.
- A blocklist where an allowlist fits.
- Accepting a risk without the user's ratified decision on record.

## Integration

- `noetron-review` — composes as an additional lens on sensitive diffs; severities and the fix loop are shared.
- `noetron-execute` — overlays every task whose territory includes a trigger surface.
- `noetron-spec` — security acceptance criteria for sensitive work are born there.
- `noetron-explore` — version identification and codebase sweeps for similar exposures.
- `noetron-interview` — accepted risks are user decisions, recorded.
- `noetron-finish` — its safety net points here when a sensitive surface slipped through unreviewed.
- `noetron-verify` — every "this is safe now" is a claim with evidence.

---

**This skill is working if:** sensitive diffs never reach the final review unexamined; every accepted risk has a ratified record; no secret value ever appears in a transcript, log, or diff; and security findings arrive with `file:line` and version-confirmed grounding, not vibes.
