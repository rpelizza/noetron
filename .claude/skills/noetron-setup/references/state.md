# Template: noetron/state.md

The live state of the task currently in progress. Noetron updates it in real time while working; between tasks it rests in the idle state.

## Scaffold

`noetron-setup` creates `noetron/state.md` in the idle state, with exactly this content:

```markdown
---
task: none
status: idle
---

# State

No task in progress.
```

## Active-task format

While a task runs, the file takes this shape:

```markdown
---
task: <short imperative title>
slug: <task-slug>
status: active
phase: plan | spec | execute | validate | done
branch: <git branch>
isolation: inline | subagents | agent-team
commit_strategy: <e.g. single commit at the end | commit per step | user commits>
plan: <relative path or none>
spec: <relative path or none>
project_type: <workspace | simple | fullstack | frontend | backend | …>
review: <review strategy for this task>
---

# <Task title>

## Progress
- [x] What is already done
- [ ] What comes next

## Decisions
Decisions taken mid-task, each marked as user decision or agent proposal ratified by
the user.

## Next steps
What the next agent or session should do first if work resumes here.
```

The `slug` (kebab-case) names everything the task produces: the branch, the plan/spec files, and the history entry.

## Rules

- Update the file at every phase change and after every meaningful step — it is the crash-recovery point for interrupted sessions.
- One task at a time: if a new task arrives while one is active, surface the conflict to the user; never silently swap the state.
- On completion: summarize into `noetron/history/YYYY-MM-DD-<slug>.md` (see `history.md`), then reset this file to the idle state.
