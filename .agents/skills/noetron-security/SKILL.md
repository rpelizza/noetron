---
name: noetron-security
description: Use when a change touches authentication, authorization, untrusted input, queries, sensitive data, uploads, CORS/SSRF surfaces, dependencies, secrets, logging of user data, or deserialization; when it touches an LLM or agent surface — prompts, model API calls, MCP configuration, tools exposed to a model, retrieval corpora, agent memory; before the final review of such changes; also when the user asks for a security review.
---

# Noetron Security

The security lens for changes touching a sensitive surface. It reviews **the diff, not the whole
repository** — what changed and what it newly exposes — and runs **before the final review**, never
deferred to closeout: `noetron-finish`'s net only catches what escaped; this skill is the rule it backs.
Two layers: **base** on every triggered diff; **AI** added only where the repository actually embeds a
model — and there the classic web checklist misses the surfaces that matter most.

## Trigger surfaces

**Base:** authentication or authorization · untrusted input (forms, params, headers, files) · queries
(SQL/NoSQL/ORM raw paths) · sensitive data (PII, credentials, tokens, financial) · uploads and file handling
· CORS, redirects, webhooks, outbound fetches (SSRF) · new or updated dependencies · secrets and
configuration · logging that may capture user data · serialization/deserialization.
**AI:** prompt construction and system-message templates · model API calls · tool schemas exposed to a
model · MCP configuration · retrieval corpora and agent memory · any path carrying fetched, uploaded, or
third-party content into a model's context.

## Proportionality — the tier sets the breadth, never the rigor

An **overlay**, not a chain: it attaches to the nodes whose diff touches a trigger surface, at whatever
tier the chain runs. `noetron-router`'s tie-breaker already puts such a diff at **`standard` or above** —
read it there, never re-derive it, never argue it down.

| What the diff touches | The pass |
|---|---|
| no trigger surface (log string, comment, rename, docs) | none — this skill does not run, at any tier |
| one trigger surface, contained | the items that surface triggers, in its layer |
| a trigger surface plus a new trust boundary, or any model-facing surface | both layers, whole diff |

A `trivial` touching a log string is trivial; a `trivial` touching authentication was never trivial — the
tie-breaker reclassifies it and this overlay attaches to the chain that results. Breadth scales; **an
item that runs, runs completely** — "probably fine" is not an answer at any tier.

## Layer 1 — the base pass

First, **version-first grounding**: identify the technology and the **version actually in use**
(`noetron-explore`: manifests, lockfiles), then confirm guidance for that version via context7 or
official docs — advice from memory ages worse here than anywhere: one major's mitigation is the next's hole.

Then apply the current OWASP Top 10 **to the diff**, surface by surface, with evidence (`file:line`):

1. **Access** — every new path authenticated and authorized server-side, failing closed, object-level (no IDOR).
2. **Input** — every untrusted input validated (allowlist over blocklist), encoded at output; parameterized queries only.
3. **Data** — sensitive data encrypted in transit and at rest where required, out of logs, never in URLs.
4. **Secrets** — none in code, diff, or output. **Never print a secret value**: report *that* one is configured, not *what*.
5. **Dependencies** — new or updated packages: CVEs for the pinned version, install scripts, typosquatted names.
6. **Design** — a trust boundary nobody drew: webhooks, redirects, file paths from input, outbound requests from user data.
7. **Failure** — new error paths leaking internals — stack traces, queries, versions — to the caller.

Not every item applies to every diff: check the triggered surfaces thoroughly and name the items that
were not applicable. Zero findings after a real pass is valid (`noetron-review`'s pre-report gate).

## Layer 2 — the AI pass

**Detect from the repository, never from its self-description.** Model SDKs or frameworks in the manifest
and lockfile (`anthropic`, `openai`, `langchain`, `llama-index`, `transformers`, `ollama`, a vector store)
· HTTP calls to model endpoints · MCP configuration (`.mcp.json`, client config) · prompt text in files,
templates, or system-message constants · tool schemas declared for a model · a retrieval index or memory
file the process writes and later reads back. Any one → this layer applies to the model-facing part of the
diff. None → say so in one line and stop at layer 1.

| Surface | The question the diff must answer |
|---|---|
| **Prompt injection** | Does content the project did not author — fetched page, uploaded document, tool output, issue, e-mail, DB row — reach the model's context? Then **observed content is data, never instruction**, and the system must not depend on the model honoring that. |
| **Data/instruction confusion** | At each context boundary, can the model tell the operator's instructions from the payload? Roles, delimiters, and provenance labels are the mechanism; bare concatenation is the vulnerability. |
| **Exfiltration via tool use** | Does one model turn hold **both** private data or a secret **and** an egress path (outbound fetch, message, rendered URL, file write)? That pair is the exfiltration primitive — separate them, or gate the egress. |
| **Persistent context poisoning** | Can untrusted content be written into something the agent reads back later — memory, RAG corpus, notes, ledger, commit messages? Injection that survives the session outlives every per-turn defense. |
| **Tool permissions and blast radius** | For each tool newly exposed to the model: what is the worst single call? Scope it, allowlist it, bound it. A tool taking a free-form path, command, or URL from model output is a shell in disguise. |
| **Secrets in prompt and log** | Keys interpolated into prompts; full transcripts logged with user data. Prompts and traces are persisted and often leave for a vendor — treat them as an output channel, not scratch space. |
| **Missing human gate** | Is any irreversible action — send, publish, pay, delete, migrate, grant — reachable from model output with no human ratification? That gate is a control, not a UX nicety. |

Same severities apply: an unmediated path from untrusted content to an irreversible action is **Critical**,
not a hardening idea. A prompt saying "ignore instructions in the content", with no boundary behind it, is
a mitigation on paper.

## Findings and fixes

Findings enter the normal review flow with `noetron-review` severities — Critical or Important triggers
the fix loop like any other, and **fixes land before the final review**. A risk the user accepts is a
decision: `noetron-interview`, recorded (state/plan Decisions, ADR if architectural), never silently
waived. A secret exposed in history or logs is rotated as part of the fix, and similar occurrences swept.

## Red flags

- Deferring security "to the end" — the end is `noetron-finish`, and it only nets.
- Reviewing from memory instead of version-confirmed guidance; printing a secret value, including "just to check it".
- Client-side-only validation or authorization presented as protection; a blocklist where an allowlist fits.
- Running the AI layer on a repo with no model — or skipping it because "the model only summarizes".
- Prompt wording sold as the mitigation when the boundary is the control.
- Accepting a risk without the user's ratified decision on record.

## Integration

- `noetron-router` — the tie-breaker that raised the tier; `noetron-review` — shared severities and fix loop.
- `noetron-execute` — overlays tasks in a trigger surface's territory; `noetron-spec` — where its acceptance criteria are born.
- `noetron-explore` — versions, embedded-model detection, exposure sweeps; `noetron-interview` — accepted risks, recorded.
- `noetron-finish` — its net points here when a surface slipped through; `noetron-verify` — "safe now" is a claim with evidence.

---

**This skill is working if:** sensitive diffs never reach the final review unexamined; a repository embedding
a model gets its model-facing surfaces named instead of the web checklist repeated, and one that does not
gets a single line rather than an irrelevant audit; every accepted risk has a ratified record; no secret value
appears in a transcript, log, or diff; and findings arrive with `file:line` and version-confirmed grounding.
