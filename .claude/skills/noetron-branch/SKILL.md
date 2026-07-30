---
name: noetron-branch
description: Use before the first write of any task that will produce commits — when on a protected branch, a detached HEAD, or an unclear base; when a worktree is needed; or when the user asks to start a branch or an isolated workspace.
---

# Noetron Branch

Isolation before the first write. No chain that commits — full, spec-only, or direct — touches a file before this skill has cleared the ground: protected branches guarded, the base discovered, the task branch created, the choice ratified.

## The protected guard — non-negotiable

Before any `git add` or commit, run `git branch --show-current`. If it returns `main`, `master`, `develop`, `dev`, **or empty** (detached HEAD or mid-rebase — fail closed: empty is NOT cleared), **STOP** and create the task branch first. There is no convenience exception and no trivial-task exception — this rule outranks any pressure to move fast.

## Order of operations

### 1. DETECT existing isolation
Compare `git rev-parse --git-dir` with `--git-common-dir`. Different → possibly already a worktree — but check `git rev-parse --show-superproject-working-tree` first: submodules produce the same signal. Already isolated (harness- or host-created) → report it and use it; **never fight the harness** — a native isolation tool (worktree command, platform workspace) always beats reimplementing it in git, which creates phantom state the host cannot see.

### 2. DETECT workspace shape
A multi-project workspace (several repos or packages under one root)? Confirm with the user **which set** the task touches before choosing where the branch lives.

### 3. DISCOVER the base
The base is what the work forks from — named in the plan, the conversation, or the branch's upstream. Not already known → ask; never assume `develop` exists or that `main` is the base.

### 4. CREATE and ratify
Name the branch from the task slug (`<type>/<slug>`, e.g. `feat/refund-ledger`). Branch in place by default; offer a **worktree** when the current tree must stay untouched (parallel work, long execution) — under `.worktrees/`, with `git check-ignore` verified first (not ignored → add to `.gitignore` and commit that before creating; this prevents committing a worktree into the repository). Present branch + location in the kickoff confirm (`noetron-execute` carries mode and commit strategy in the same confirm) and record in `noetron/state.md`.

### 5. BASELINE
Run the suite once before any work (`noetron-verify`): **a dirty baseline makes every later failure ambiguous.** Red baseline → report it and ask whether to proceed or investigate (`noetron-debug`) — never build on an unexplained red.

## Rationalizations

| Excuse | Reality |
|---|---|
| "It's a one-line fix, I'll commit here" | The protected guard has no size exception. |
| "Obviously I'm not in a worktree" | Run the detection; harness-created isolation and submodules fool the eye. |
| "`git worktree add` is faster than finding the native tool" | Bypassing the native tool creates phantom state the host cannot manage. |
| "The directory is surely ignored already" | Run `git check-ignore`. |
| "The baseline can wait" | Every later failure becomes ambiguous. Run it now. |

## Integration

- `noetron-execute` — the kickoff confirm carries this skill's branch and isolation alongside mode and commit strategy.
- `noetron-finish` — mirrors the same detection and cleans by provenance what this skill created.
- `noetron-plan` — the task slug that names the branch is born there.
- `noetron-verify` — the green baseline proof.
- `noetron-debug` — an unexplained red baseline.

---

**This skill is working if:** no commit ever lands on a protected branch; every task branch traces to a ratified base; worktrees never appear inside version control; and no failure investigation ever starts with "was the baseline even green?".
