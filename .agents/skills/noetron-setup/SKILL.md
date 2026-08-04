---
name: noetron-setup
description: Use when `.noetron/` is missing or incomplete at the repository root, when a legacy `noetron/` directory is present, on the first use of Noetron in a repository, or when the user asks to install, bootstrap, migrate, configure, or repair Noetron.
---

# Noetron Setup

Lay down the harness's footprint: the `.noetron/` workspace, the standing contract in `CLAUDE.md` and
`AGENTS.md`, the project profile, and the domain-skill catalog. Setup scaffolds and records — it writes no
product code and no product documentation, because `docs/` belongs to the project and a harness keeping its
own copy produces two sources of truth about one product. That is the measured reason `noetron/docs/` is gone.

<HARD-GATE>
Propose before creating. One confirmation covers the scaffold; the migration, the anchor, the MCP
servers, and the domain-skill set each carry their own. Existing content is appended to, never rewritten
— the single exception is the legacy marker in step 3, which asks first.
</HARD-GATE>

## 0. GUARD — is this the harness's own repository?

Check the root `README.md` for `<!-- noetron:source-repo -->`. Present → **do not bootstrap**: say that
this is the Noetron source repository, that `.noetron/` is absent here by design because the harness is
authored in this repository rather than consumed by it, and stop. Nothing is created, nothing is appended.

The marker is the criterion because structure cannot separate source from consumer — a consumer installs
`.claude/skills/` and `scripts/` verbatim, so `noetron-core/SKILL.md` and `sync-noetron.mjs` exist on both
sides — while the marker sits in the one root file an install never copies, and the root `CLAUDE.md` is kept
byte-identical to [`assets/contract.md`](assets/contract.md), so a marker there would break the `diff` that
keeps them honest.

Bootstrapping here is not a harmless extra pass: step 5 would derive the prefix `noetron` from the directory
name and propose `<prefix>-*` domain skills straight into the namespace the harness skills already occupy.

Marker absent, but every tracked file belongs to the harness itself (`.claude/skills/noetron-*`, `.agents/`,
`.cursor/`, `scripts/sync-noetron.mjs`, the root markdown, and nothing else) → say what you observe and ask
before proceeding. A fork that dropped the marker is a question, never a silent bootstrap.

## 1. DETECT and PROPOSE

| Root evidence | State | Action |
|---|---|---|
| neither `.noetron/` nor `noetron/` | fresh | full setup |
| `noetron/` present | legacy | propose the migration first — [migration.md](references/migration.md) |
| `.noetron/` present, entries missing | partial | create only what is missing |
| `.noetron/` complete | installed | report and stop |

Classify the repository on two more axes, because steps 4 and 5 branch on both:

- **maturity** — **existing** (source beyond scaffolding) or **greenfield** (empty, or manifest and README
  only);
- **shape** — **single project** (one manifest, at the root) or **workspace** (several manifests under one
  repository: `packages/*`, `apps/*`, a `pnpm-workspace.yaml`, a Cargo `[workspace]`, a `go.work`). Find
  them by listing manifests, never by trusting a README: `git ls-files '*package.json' 'Cargo.toml'
  'go.mod' 'pyproject.toml' '*.csproj'`.

**The harness root is the repository root, always** — `git rev-parse --show-toplevel`, one `.noetron/`, no
matter how many packages sit below it, for the reason in
[directory-layout.md](references/directory-layout.md). Several *independent repositories* under one
directory are N projects: say so, and run setup once per repository the user names.

Then name the state, list every path that will be created or appended to (`.noetron/` entries, `CLAUDE.md`,
`AGENTS.md`, `.gitignore`) plus the decisions still coming, and wait. Hold the conversation in the user's
language and record it in the profile; the files are English.

## 2. SCAFFOLD

Create `.noetron/` per [directory-layout.md](references/directory-layout.md), each entry seeded from
its template:

| Entry | What it holds | Template |
|---|---|---|
| `state.md` | cursor of the active task | [state.md](references/state.md) |
| `profile.md` | per-package commands, package manager, stack baseline; dependency edges; MCP record | [profile.md](references/profile.md) |
| `domain-skills.md` | the catalog and the prefix authority | [domain-skills.md](references/domain-skills.md) |
| `history/` | one immutable block per closed task | [memory.md](references/memory.md) |
| `verification-standard.md`, `learnings.md` | what "correct" means, execution memory | [`noetron-evolve/templates/`](../noetron-evolve/templates/) — their format authority |

`plans/` and `specs/` arrive on demand from `noetron-plan` and `noetron-spec`, seeded from
[artifacts.md](references/artifacts.md). `work/` is created per task — append `.noetron/work/` to `.gitignore` now, appending only.

## 3. ANCHOR — CLAUDE.md and AGENTS.md

The contract in `CLAUDE.md` stands in for a bootstrap hook: it is the only text guaranteed loaded in every
session, so it carries the 1% rule, the authority boundary, the three gates, and the guardrails. `AGENTS.md`
gets the identical block, for runtimes that read the open agents convention instead of loading skills
natively. Copy it **verbatim, markers included**, from [`assets/contract.md`](assets/contract.md), the copy
that ships with the skills — byte equality is what lets a later session detect drift with a plain `diff`.
Mechanics in [anchor.md](references/anchor.md).

| Condition, per file | Action |
|---|---|
| absent, or present without `<!-- noetron:contract -->` | create with only the block, or append it at the end |
| marker present, block identical to the asset | skip |
| marker present, block differs | report the drift, offer to re-sync that block alone |
| legacy `<!-- noetron -->` block present | offer to replace it — the one edit setup makes to existing content |

## 4. MCP and PROFILE

**context7** serves documentation for the version actually in the lockfile — the mechanism behind "facts
come from docs for the version in use": `noetron-spec` grounds signatures and pinned versions with it,
`noetron-create-skill` grounds conventions with it, and without it both fall back to memory, which is how a
wrong-major API enters a spec. **playwright** supplies a real browser, turning a claim about a rendered
screen into evidence; `noetron-design` and `noetron-verify` have no other way to check UI.

Detect via session tools named `mcp__…context7…` / `mcp__…playwright…`, else `claude mcp list`. For each
missing server offer both scopes and let the user pick — `--scope project` versions it in `.mcp.json` for
the team, `--scope user` covers this machine: `claude mcp add --scope <scope> context7 -- npx -y
@upstash/context7-mcp`, `claude mcp add --scope <scope> playwright -- npx @playwright/mcp@latest`. context7
runs keyless; a free key from context7.com/dashboard raises the rate limit (`--api-key <key>` — record that
a key exists, never its value). Every outcome, declines included, goes in the profile.

Then fill `.noetron/profile.md` and `.noetron/verification-standard.md` from evidence: the **lockfile** for
the package manager and the pinned versions — the anchor every later context7 lookup uses — and the scripts
block, Makefile, taskfile, or CI workflow for the commands that actually run. Confirm that list with the
user: a `test` script nobody runs is worse than an empty entry, because it will later be quoted as proof.

**One profile block per package, and no merging** ([profile.md](references/profile.md)). A workspace gets
its own package manager, command table, and stack baseline for each package — Go tests in `packages/api`
and Vitest in `packages/web` are not one row — plus the **dependency edges** between them, which is what
lets `noetron-branch` turn a ratified scope into a verification set. A single-project repository writes the
same shape with one block at `.`, so nothing downstream needs a second reader.

Record any existing decision-record convention (`docs/adr/`, `doc/adr/`, `docs/decisions/`) at its real path
and propose creating `docs/adr/` only when none exists ([adr.md](references/adr.md)) — ADRs live with the
project, never inside `.noetron/`. Greenfield: record what is known, mark the rest `pending`; each package's
baseline lands when the plan ratifies that package's stack.

## 5. DOMAIN SKILLS — before the domain code, not after

Domain skills are `<prefix>-<name>` entries in `.claude/skills/`. The prefix comes from the manifest name in
kebab-case (the repository directory name only when no manifest names the project), is confirmed with the
user, and is recorded in `.noetron/domain-skills.md` — from then on the catalog is the authority and the
prefix is never re-derived. Inventory `.claude/skills/` first: `noetron-*` are harness skills, `<prefix>-*`
are domain skills, anything else is reported and left untouched.

**One repository, one prefix, even with ten manifests.** `.claude/skills/` is a single namespace at the
repository root, so per-package prefixes would seat three naming authorities in one directory with no rule
for a task spanning two. The prefix is the workspace's — the root manifest's name, or one the user picks
when no root manifest names it — and the **package area goes inside the skill name**:
`<prefix>-api-ratelimit`, `<prefix>-web-forms`. A skill binding every package drops the area segment. Each
catalog row carries the packages it covers, so a task scoped to `packages/api` knows which overlays are its
own ([domain-skills.md](references/domain-skills.md)).

**Existing repository** — sweep now through `noetron-explore`, package by package in a workspace: modules,
bounded contexts, integrations, UI areas, infrastructure concerns, and the stack itself. Propose the
**maximum useful set** — the filter is utility, not scarcity — grounding every stack-bearing candidate in
context7 for the version in *that package's* lockfile.

**Greenfield** — the sweep has nothing to find, and deferring to closeout means the domain code is already
written; in the field that left a catalog empty across two phases and ~17k lines. The candidates come
instead from the **stack ratified in the plan**, at the design→plan edge, before the first line of domain
code. Setup arms that gate in `.noetron/domain-skills.md`; `noetron-plan` fires it, and
`noetron-create-skill` writes those skills in greenfield mode — grounded in the pinned version's
documentation, marked `doc-grounded`, re-grounded at the first real diff.

Either path asks one question, carrying a recommendation:

> Detected stack: `<X, Y, Z>` (versions from `<lockfile>`). I propose `<N>` skills:
> 1. `<prefix>-<name>` — `<the decision it settles or the error it prevents>`
> …
> Create all of them, adjust the set, or proceed with none?

Approved skills are built by `noetron-create-skill`; when it is unavailable they go under `## Pending` — a
debt the catalog carries, not a decision quietly dropped.

**Close with the report:** created · already present and untouched · declined · pending, plus the two facts
the next session needs — the confirmed prefix, and whether the greenfield gate is armed.

## Red flags

- Creating anything before the proposal was answered, or stopping a migration halfway.
- Running the consumer bootstrap in the harness's own source repository, or reading its missing `.noetron/` as a fresh install.
- Retyping the contract instead of copying `assets/contract.md`, or editing existing `CLAUDE.md` content outside the legacy-marker offer.
- Scaffolding `docs/` or `adr/` inside `.noetron/`, or a greenfield `domain-skills.md` with no armed gate.
- Recording a command read from a manifest that was never run.
- A `.noetron/` under a package, or a second one anywhere in the same repository.
- One command table or one stack baseline standing in for a workspace's several; a prefix taken from a
  package manifest instead of the workspace.

---

**This skill is working if:** a fresh repository reaches a complete `.noetron/` in one pass; every legacy
`noetron/` consumer is offered the migration and none is left half-moved; the contract block in a consumer's
`CLAUDE.md` stays byte-identical to the harness's; nothing pre-existing is ever rewritten; the harness's own
repository never acquires a `.noetron/` workspace or a `noetron`-prefixed domain skill; a monorepo ends up
with exactly one `.noetron/` and one command table per package; and no project reaches its second phase with
an empty domain-skill catalog.
