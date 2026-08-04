# Migration — `noetron/` to `.noetron/`

A repository set up before the rename carries `noetron/` at its root. Setup detects it, proposes the
move, and executes only on the user's word. Nothing is moved, merged, or deleted silently: the old
layout holds real task history, and a consumer left half-moved has two workspaces and no cursor.

## 1. Detect

`noetron/` exists at the repository root **and** contains any of `state.md`, `history/`, `setup/`,
`plans/`, `specs/`, `adr/`, `docs/`. A directory named `noetron/` holding source code is a project
directory, not a legacy workspace — say so and stop.

## 2. Propose

Present the inventory: every file that moves, every file whose content merges into another, every
inbound reference that will be rewritten, and the one thing that is deleted. Then wait.

| Legacy | Destination |
|---|---|
| `noetron/state.md` | `.noetron/state.md` — moved, then **reconciled**: § 3.1 |
| `noetron/history/` | `.noetron/history/` |
| `noetron/plans/`, `noetron/specs/` | `.noetron/plans/`, `.noetron/specs/` |
| `noetron/setup/preferences.md` | `.noetron/profile.md` — Language and Preferences sections |
| `noetron/setup/mcp.md` | `.noetron/profile.md` — MCP section |
| `noetron/setup/domain-skills.md` | `.noetron/domain-skills.md`, verbatim including `## Last review` |
| `noetron/adr/` | `docs/adr/`, renumbering only if `docs/adr/` already holds records |
| `noetron/docs/` | **the user decides** — merge into the project `docs/`, keep as is, or drop. Never auto-merged: two descriptions of one feature need a human to say which is true. |
| `noetron/work/` | deleted — it was ephemeral by contract |

`profile.md`, `verification-standard.md`, and `learnings.md` have no legacy source. Create them in the same
pass — the profile from evidence per [profile.md](./profile.md), the other two from
[`noetron-evolve/templates/`](../../noetron-evolve/templates/).

## 3. Move

`git mv` for every path, so history follows the file. Then rewrite inbound references — the paths that
would otherwise resolve to nothing:

- `CLAUDE.md`, `AGENTS.md`, `README`, and `CONTRIBUTING`;
- every `<prefix>-*` domain skill in `.claude/skills/` (they link `noetron/docs/...` and
  `noetron/setup/...` by relative path);
- front matter inside moved plans and specs that points at sibling artifacts;
- CI workflows and `.gitignore`.

Grep for the literal `noetron/` after the move and report every remaining hit with its file and line.
A hit inside prose about the harness itself is fine; a hit that is a path is a broken link.

### 3.1 The cursor is moved, then reconciled

`git mv` preserves the file byte for byte, and a legacy `state.md` was written before `status:`,
`phase:`, and `## Delivered` existed. Moved and left alone it lands in `.noetron/` **stating
nothing** — and nothing is read as idle by `noetron-core`'s third exit, so the next request closes a
fresh G0 whose single write covers everything the live task had recorded. That is the opposite of
this migration's own promise that the active task resumes from its cursor.

So after the move, and before anything classifies:

- **no active task in the legacy file** → write the idle scaffold from [state.md](./state.md)
  § Scaffold, exactly.
- **a task was active** → the missing fields are **reconstructed with the user, never defaulted**.
  Present what the file carries (title, ledger lines, plan and spec pointers) beside what git shows
  (branch, commits since the base, worktrees), and ask which node the task stopped at; `status:` and
  `phase:` are written from that answer, and G0 is **not** re-opened for anything the file already
  records. `noetron-recovery` §2.2 owns the reconstruction and is where a consumer that skipped this
  step lands anyway.
- either way, the resulting file parses against the current format before the migration commit.

## 4. Replace the anchor

The legacy `<!-- noetron -->` … `<!-- /noetron -->` block in `CLAUDE.md` and `AGENTS.md` is replaced by
the contract block ([anchor.md](./anchor.md)). This is the one place setup edits existing content, so
it asks first and shows the replacement.

## 5. Verify and commit

`state.md` still parses, the active task's plan and spec still resolve, `git status` shows only
renames plus the intended edits, and `noetron/` is empty and removed. One commit:
`chore(noetron): migrate workspace to .noetron/`.

If the user declines the migration, record that in the report and stop — do not run a parallel setup
that would leave both layouts alive.

---

**This migration is working if:** every moved file keeps its git history; no path anywhere in the
repository still points at `noetron/`; and the task that was active before the migration resumes from
its cursor afterwards.
