# Template: noetron/history/

Record of every task ever executed — the audit trail of what was done and why.

## Scaffold

`noetron-setup` creates only `noetron/history/README.md`, with exactly this content:

```markdown
# History

One file per completed task: `YYYY-MM-DD-<slug>.md` — the date the task finished plus
the task slug from `noetron/state.md`. The entry is written once, when the task
completes, by summarizing the live state. Entries are immutable history.
```

## Entry format

```markdown
---
date: YYYY-MM-DD
slug: <task-slug>
type: feature | fix | improvement | refactor | chore | docs
plan: <relative path or none>
spec: <relative path or none>
---

# <Task title>

**Request:** what the user asked for, in one or two sentences.
**Outcome:** what was actually done.

## Files touched
- `path` — what changed

## Decisions
Decisions made during the task and why. Link ADRs if any were recorded.

## Notes
Anything the next agent should know — follow-ups, known limitations. Omit if none.
```

## Rules

- Written exactly once, at task completion: the executing skill summarizes `noetron/state.md` into the entry, then resets the state to idle.
- Never rewrite past entries. If something proves wrong later, the correcting task records that in its own entry and links back.
