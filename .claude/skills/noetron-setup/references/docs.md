# Template: noetron/docs/

Documentation of every feature in the project — one file per feature — so any agent can understand a feature without re-reading the codebase.

## Scaffold

`noetron-setup` creates only `noetron/docs/README.md`, with exactly this content:

```markdown
# Docs

One file per feature: `<feature>.md` (kebab-case, named after the feature, not the task).
Each doc explains the feature so an agent can work on it without re-reading the whole
codebase: what it does, why it exists, key files, how the flow runs, and the gotchas.

Docs are written on demand — created or updated by the task that touches the feature.
```

Feature docs are **on demand**: whenever a task creates or meaningfully changes a feature, the executing skill creates or updates that feature's doc. Setup never generates documentation from the existing codebase — a full backfill may be offered later by a dedicated flow.

## Feature doc format

File name: `<feature>.md`, kebab-case.

```markdown
# <Feature name>

**What it does:** one or two sentences.
**Why it exists:** the problem it solves.

## Key files
- `path/to/file` — role in the feature

## How it works
The main flow(s), end to end, in prose or short steps.

## Gotchas
Non-obvious constraints, invariants, known traps. Omit the section if none.
```

## Rules

- Update the doc in the same task that changes the feature's behavior — never leave it for later.
- One feature = one file. Split when a doc starts covering two things.
- Link related docs, ADRs, and history entries by relative path.
