---
name: noetron-setup
description: Use when the noetron/ workspace is missing or incomplete at the repository root, on the first use of Noetron in a repository, or when the user asks to install, configure, or repair Noetron.
---

# Noetron Setup

Initialize (or repair) Noetron in the current repository. This skill only scaffolds the harness workspace and records project configuration. It never generates project documentation or code, and it never creates anything beyond the initial files described by its references.

Flow: detect → propose → scaffold → anchor CLAUDE.md → MCP servers → domain skills → settings → report.

## Installation states

Check `noetron/` at the repository root (see [Directory Layout](references/directory-layout.md)):

| `noetron/` | Meaning | Action |
|---|---|---|
| Absent | First use in this repository | Full setup |
| Present, entries missing | Partial or damaged installation | Repair: create only what is missing |
| Present and complete | Already installed | Skip setup; tell the user |

Never overwrite anything that already exists — setup and repair only fill gaps.

## Ground rules

- **Propose, then act.** Before creating or changing anything, present the full list of planned actions and get the user's confirmation. One confirmation covers the whole scaffold (steps 2-3); steps 4-5 carry their own decisions.
- **Speak the user's language.** Interact in the language the user writes in, and record it in step 6. Harness files themselves stay in English.
- **Everything is relative to the repository root.** Never assume Noetron is running in its own source repository.

## Step 1 — Detect and propose

Identify the installation state from the table above, announce which case applies, list exactly what will be created (directories, files, CLAUDE.md changes), and confirm with the user.

## Step 2 — Scaffold the workspace

Create the `noetron/` layout exactly as specified in [Directory Layout](references/directory-layout.md). Seed each entry from its template:

| Entry | Template |
|---|---|
| `noetron/docs/` | [docs.md](references/docs.md) |
| `noetron/history/` | [history.md](references/history.md) |
| `noetron/adr/` | [adr.md](references/adr.md) |
| `noetron/plans/` | [plans.md](references/plans.md) |
| `noetron/specs/` | [specs.md](references/specs.md) |
| `noetron/setup/` | [setup.md](references/setup.md) |
| `noetron/state.md` | [state.md](references/state.md) |

## Step 3 — Anchor CLAUDE.md

Noetron hooks into the project through `CLAUDE.md` at the repository root:

- No `CLAUDE.md` → create one containing only the block below.
- `CLAUDE.md` exists but has no `<!-- noetron -->` marker → append the block at the end. Never modify existing content.
- Marker already present → skip.

The block, verbatim:

```markdown
<!-- noetron -->
## Noetron

This project uses the **Noetron** harness, an intelligent, skill-driven engineering
harness for reliable AI-assisted software development.

For any given task, always start by reading `.claude/skills/noetron-core/SKILL.md`.
Purely conceptual questions that lack project context can be answered directly.

`.claude/skills/` and the `noetron/` directory are the sources of truth.
<!-- /noetron -->
```

## Step 4 — Verify MCP servers

Noetron recommends two MCP servers:

| Server | Why Noetron wants it |
|---|---|
| **context7** | Live, version-accurate library documentation — skills consult it instead of trusting training data. |
| **playwright** | Real-browser automation — used to verify UI work in a running application. |

Detection, in order:

1. Session tools: if tools named `mcp__…context7…` or `mcp__…playwright…` are available, that server is installed.
2. Otherwise run `claude mcp list` in the shell and read the output.

For each missing server, recommend it, explain the two scopes, and let the user choose — never choose for them:

| Scope | Effect | Commands |
|---|---|---|
| Project | Versioned in `.mcp.json`, shared with the whole team | `claude mcp add --scope project context7 -- npx -y @upstash/context7-mcp`<br>`claude mcp add --scope project playwright -- npx @playwright/mcp@latest` |
| User | This machine only, available in every repository | Same commands with `--scope user` |

context7 works without an API key; a free key from context7.com/dashboard raises rate limits (append `--api-key YOUR_KEY`). Record every decision — installed with which scope, or declined — in step 6.

## Step 5 — Map domain skills

Domain skills teach the harness this project's own domains. They live in `.claude/skills/` and are always named `<repo-name>-<skill-name>` (e.g. `acme-billing`, `acme-auth`).

1. Determine `<repo-name>`: the repository root directory name, lowercased.
2. Inventory `.claude/skills/`: `noetron-*` are harness skills; `<repo-name>-*` are domain skills; report anything else to the user as unrecognized (do not touch it).
3. If domain skills exist, list them and record the catalog in step 6.
4. If none exist, sweep the codebase for domain candidates — modules, bounded contexts, integrations, UI areas, infrastructure concerns — and propose creating a domain skill for each strong candidate. Aim for the maximum useful coverage and let the user trim the list.
5. Creation itself is delegated to the `noetron-create-skill` skill. If it is not installed yet, record the approved list as pending in step 6 so it can be picked up later.

## Step 6 — Record project settings

Record in `noetron/setup/`, following [setup.md](references/setup.md): the user's language, the MCP decisions from step 4, the domain-skill catalog (or pending list) from step 5, and any other project-level preference the user stated during setup.

## Step 7 — Report

Close with a short summary: what was created, what already existed and was left untouched, what was declined, and what is pending (e.g. domain skills awaiting `noetron-create-skill`).
