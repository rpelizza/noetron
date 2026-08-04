# Template: `.noetron/profile.md`

What this project is, mechanically: the commands that actually run, per package; the versions every
documentation lookup is anchored to, per package; the language; and the MCP decisions. Everything here is
read from files and confirmed with the user — never assumed from stack convention.

**One profile per repository, one block per package.** A single-project repository has exactly one package
block, rooted at `.`, so no skill needs a second reader for the simple case.

## Scaffold

```markdown
# Profile

**Language:** <the language the user communicates in>
**Repository kind:** <single project | monorepo | library | service>
**Packages:** `.` | `packages/api`, `packages/web`, `packages/ml`

## Workspace

| Field | Value | Source |
|---|---|---|
| workspace tool | <pnpm workspaces / turbo / nx / cargo workspace / go work / none> | `<file>` |
| cross-package command | `<the command that fans a target out over packages, or none>` | `<file>` |

### Dependency edges

| Package | Consumed by |
|---|---|
| `packages/api` | `packages/web` |

A change inside a package is verified together with the packages that consume it. This table is what
turns a ratified scope into a **verification set**: scope ∪ its dependents. Omit the section when the
repository has one package.

## Package: `packages/api`

**Package manager:** <pnpm | npm | uv | poetry | cargo | go | …> — from `<lockfile>`

| Purpose | Command (run from `packages/api`) | Source |
|---|---|---|
| install | `<cmd>` | `<manifest / Makefile / CI file>` |
| test | `<cmd>` | … |
| lint | `<cmd>` | … |
| typecheck | `<cmd>` | … |
| build | `<cmd>` | … |
| run locally | `<cmd>` | … |

**Stack baseline** — the anchor for every context7 lookup about this package:

| Technology | Version | Pinned in |
|---|---|---|
| <runtime / framework / library> | <exact version> | `<lockfile or manifest>` |

## Package: `packages/web`
<same shape — its own package manager, its own commands, its own baseline>

## Decision records — `docs/adr/` | `<detected path>` | none yet

## MCP

| Server | Status | Scope | Date |
|---|---|---|---|
| context7 | installed / already present / declined | project / user / — | YYYY-MM-DD |
| playwright | installed / already present / declined | project / user / — | YYYY-MM-DD |

## Preferences

Max 10. Each is something an agent must know before writing, that no config can enforce.

- <project-level preference the user stated, at setup or later> — stated <date>

Preferences recorded here override the harness floor in `noetron-preferences`.
```

## The Preferences budget — 10 bullets, hard

This section is read before every line the project keeps, so it competes with the domain skills for
the same attention. Ten is what a writer can actually hold; the eleventh silently displaces one of
the first ten and nobody can say which.

At the ceiling, the entry that has to go is found by asking which channel a bullet really belongs to.
Three of the four remove it from here:

| The bullet is really… | Where it goes | What stays here |
|---|---|---|
| enforceable by a tool — formatter, linter, `tsconfig`, `.editorconfig`, a commit-message hook | into that config, in its own ratified change | nothing; the tool is now the authority |
| a rule with a scope, learned from a failure | `.noetron/learnings.md` Active rules, via `noetron-evolve` | nothing; the rule fires where it applies |
| true of how this user works everywhere, not of this project | a proposal to the harness floor in `noetron-preferences` | nothing, once adopted |
| a genuine project preference no tool can express | here | the bullet |

A preference a linter already enforces is a bullet that costs attention on every task and changes no
outcome — that is the first one out. Removals are proposed with the channel named, never silent: the
user stated it, and only the user retires it.

## Rules

- **Evidence over convention.** A Python package with a `uv.lock` uses `uv`, whatever its README says. Read
  the lockfile — one per package, since a monorepo routinely runs three of them.
- **A command nobody ran is `(unverified)`.** Once quoted as proof of a green suite, an aspirational script
  is worse than a blank row.
- **Never promote a package command to the workspace level.** A `test` that only exercises `packages/api`,
  filed under Workspace, will later be read as proof that `web` is green. A row belongs to Workspace only
  when the tool actually fans it out — and then it names how (`turbo run test --filter=…`).
- **One stack baseline per package.** Go 1.22 in `api` and TypeScript 5.6 in `web` answer different
  questions; a merged table makes every context7 lookup guess which row applies to the file in front of it.
- **Greenfield fills what exists** — usually language and preferences — and marks the rest `pending`. Each
  package's baseline is written **by `noetron-plan`, on approval at G1**, from the stack that plan ratified
  — before its first dependency lands. The `## Decision records` line is filled the same way when the first
  plan detects a convention setup missed. A baseline nobody writes leaves every later context7 lookup
  re-deriving a version that was ratified once and recorded nowhere.
- Correct the file the moment reality contradicts it: a renamed script, a bumped major, a package added or
  dropped. Skills read this instead of re-deriving, so a stale row propagates in silence.
- Never record a secret. "API key configured in the user's MCP scope" is the whole entry.

## Who reads what

| Reader | What it takes from here |
|---|---|
| `noetron-branch` | the verification set for the ratified scope, and the commands to run it as a baseline |
| `noetron-verify` | the same set at every claim of success |
| `noetron-plan`, `noetron-spec`, `noetron-create-skill` | the stack baseline of the package in the **ratified scope** — the version every context7 lookup is anchored to. `noetron-plan` also **writes** it, at G1 |
| `noetron-finish` | the commands run on the merged result |

---

**This profile is working if:** any agent can run the suite of any package in the ratified scope from this
file alone, without opening a manifest; no context7 lookup has to guess which package's version applies;
no command row is ever quoted as evidence for a package it never ran in; and `## Preferences` never holds
more than ten bullets, none of them restating something a linter already enforces.
