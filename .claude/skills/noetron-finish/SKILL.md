---
name: noetron-finish
description: Use when a task's execution is complete and the work needs a destination — merge, PR, or keeping the branch; when the user asks to merge, push, open a PR, or close out a task; or when a finished branch or worktree needs cleanup.
---

# Noetron Finish

Close the loop: prove the work green where it will actually live, let the user choose the destination, write the history, reset the state, clean only what is ours. Entry condition: the final branch review (`noetron-review`) passed and the spec is `done` — finish never substitutes for review or validation.

## Order of operations

### 1. PROVE
Run the suite fresh on the current tree (`noetron-verify`). **The menu comes after a green suite** — a red one stops here and routes to `noetron-debug`.

### 2. DETECT
Identify the environment: worktree vs normal repo (`git rev-parse --git-dir` vs `--git-common-dir`, with the submodule guard: check `--show-superproject-working-tree` before concluding "worktree"). **Capture the worktree path now**, before any directory change — later steps move directories and then need it.

### 3. SAFETY NET — non-blocking
Two last-filter checks (the real duty lives in earlier phases; this is the net, not the rule):

- Behavior changed but the feature's doc in `noetron/docs/` was not touched?
- A security-sensitive surface changed (auth, untrusted input, queries, sensitive data, uploads, dependencies) without a dedicated security pass in review?

Found a gap → **name it and offer** to return the work to the cycle. Never block: the decision is the user's, and it gets recorded.

### 4. CONSOLIDATION — offered, never default
Present the commit list. Offer consolidation (squash / reorganization) with a one-line explanation of what it would produce — and only execute it on an explicit choice. **Honored commits are the default; there is no surprise squash.**

### 5. BASE
Determine the base branch — named in the plan, the conversation, or the branch's upstream. Not already known → ask. Confirm before any merge: merging into the wrong base is expensive to undo.

### 6. MENU — exactly these options, verbatim
> 1. Merge locally into `<base>`
> 2. Push and open a PR
> 3. Keep the branch as is

Wait for the answer — integration is the user's decision. Detached HEAD (externally managed workspace) → options 2 and 3 only. **Discard is not in this menu** (see below).

### 7. EXECUTE
- **Merge local:** go to the main repo root, **merge first**, run the suite on the **merged result** (`noetron-verify`). Failure → stop, leave worktree and branch in place — nothing was pushed; everything is recoverable — and route to `noetron-debug`. Only after green: proceed to closeout and cleanup.
- **PR:** push; create the PR with the forge's own tooling (its CLI, or the URL the push prints), following the repo's PR template if one exists. **Keep the worktree** — PR feedback is iterated there. A rejected push means the remote moved: investigate; force-push only on the user's explicit request.
- **Keep:** record the state and stop — the branch is the deliverable.

### 8. CLOSE OUT — in this order
1. Write the history entry (`noetron/history/YYYY-MM-DD-<slug>.md`, per the template) by summarizing `noetron/state.md`.
2. Mark the spec `done` and the plan `executed`, if not already.
3. Reset `noetron/state.md` to idle.
4. Delete `noetron/work/<slug>/` — **only after the history entry exists**.

### 9. CLEANUP — by provenance
Remove only worktrees under a directory we created (`.worktrees/` or `worktrees/`): `git worktree remove` + `git worktree prune`. Anything else is host-owned — leave it in place; if the platform offers a workspace-exit tool, use that instead. Never clean a sibling worktree because it "looks stale".

## Discard — the only destructive path

Never offered, never in the menu. Only on the user's **explicit, unprompted request**: list exactly what will be permanently deleted (branch, commits, worktree), then require the typed word **`discard`** — only the exact word authorizes; "yes, get rid of it" does not. Afterwards, the history entry still gets written (the task recorded as abandoned; plan/spec → `abandoned`) — destroyed work is still history.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Tests passed earlier this session" | Run the suite on the tree you are about to integrate — a green run proves only the tree it ran on. |
| "Obviously they want it merged" | Integration is the user's decision. Present the menu. |
| "'Yes, get rid of it' counts as confirmation" | Only the typed word `discard` authorizes deletion. |
| "The PR is up, the worktree is clutter" | PR feedback is fixed in that worktree. Keep it. |
| "That other worktree looks stale, I'll clean it too" | Clean only what is under `.worktrees/`. The rest is host-owned. |
| "The failure on the merged result is probably flaky" | A failing merged result stops everything — `noetron-debug`, with a measured rate if flakiness is claimed. |
| "Push rejected — force-push fixes it" | The remote moved. Investigate; force only on explicit request. |

## Red flags

- Presenting the menu before a green suite.
- Executing a destination the user did not pick.
- Squashing without an explicit choice.
- Deleting `work/<slug>/` before the history entry exists.
- Cleaning a workspace the harness did not create.
- Committing anything on a protected branch.

## Integration

- `noetron-review` — the passed final review is this skill's entry gate.
- `noetron-verify` — the fresh proof at entry and the merged-result proof before cleanup.
- `noetron-execute` — hands off here; its ledger is the source of the history entry.
- `noetron-interview` — safety-net gaps are decisions: named, offered, ratified.
- `noetron-debug` — any red suite found here.

---

**This skill is working if:** merged results are proven green before any cleanup; no branch or worktree ever disappears without its typed authorization or created-by-us provenance; every finished task leaves exactly one history entry and an idle state; and "where did my work go" is a question nobody asks.
