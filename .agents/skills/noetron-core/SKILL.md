---
name: noetron-core
description: Use when starting any conversation — before ANY response or action, including clarifying questions.
---

<DELEGATED-AGENT-STOP>
If you received a closed briefing as a subagent or team member assigned to a specific task,
**do not route**: apply only the skills and contracts your briefing names. Your briefing carries
the harness floor — you are not expected to discover it.

This exception applies ONLY to agents that received a delegated task. Working inline, without a
task delegated to you by another agent, this exception is discarded and this skill applies in full.
</DELEGATED-AGENT-STOP>

# Noetron Core

The door. It answers three things before anything else happens — **is the harness installed**, **is
this a task at all**, and **how a skill is used here** — then hands the request to
`noetron-router`, which owns the tier classifier, the chains, and gate G0. `CLAUDE.md` carries the
standing contract: the 1% rule, the authority boundary, the three gates, the guardrails.

Core holds no graph, by design: an entry point that also classified kept growing, and "how to enter"
drifted against "where to go" inside one file. The door does not draw the map.

## 1. FIRST-USE CHECK

Before any task-related action, check `.noetron/` at the repository root — three exits, in order:

- **Missing or incomplete** → `noetron-setup` (it proposes before creating anything), then return
  to the user's task.
- **Present, and `.noetron/state.md` carries `status: active`** → `noetron-recovery` first. The
  record may not match the repository, and a session that classifies before reconciling re-opens a
  gate the user already closed. **Read the ledger's `task:` in the same breath as its `status:`**:
  an open task plus a request that is not that task is a **conflict to state, never a swap to
  perform**. Name both — *`<open task>` is open at `phase: <phase>`; you asked for `<request>`* —
  and hand the choice to `noetron-recovery`, which owns it. Silently resuming the open task the user
  did not ask about, and silently starting the new one under the open task's ratified G0, are the
  same failure from opposite ends: one answers a question nobody asked, the other runs new work on a
  tier, scope, branch, and commit strategy ratified for something else.
- **Present, and `.noetron/state.md` carries no `status:` key at all** → `noetron-recovery` as well.
  A file that states nothing is **unknown, not idle**: legacy layouts predate the field, and reading
  absence as idleness is how a live task gets a fresh G0 written over it in one write.
- **Present and idle, with a `destination-pending.md` under any `.noetron/work/<slug>/`** →
  `noetron-recovery`. A closeout writes that marker before executing its destination and deletes it
  after, so finding one means the last closeout stopped in between: the ledger was already reset and
  the work was never integrated. Reading the idle ledger at face value there starts a fresh task over
  a delivery that exists only on a branch.
- **Present and idle** → hand off. Idle means the file *says* `status: idle`, and no marker contradicts it.

## 2. HAND OFF — to the router

Everything that is not purely conceptual goes to `noetron-router` **before** the first substantive
move: it classifies the tier, assembles the chain, and holds G0. Core never classifies, never
plans, and never writes.

**Purely conceptual questions that need no project context are answered directly.** The test is
falsifiable, so use it instead of a feeling: *would the answer change depending on what is in this
repository?* Yes → it is a question of fact or a task, and it goes to the router. No → answer it.

## 3. THE INVOCATION RULE

Loading a skill is not following it. A skill that applies is followed **entirely and in order**;
summarizing it back to the user is not following it, and a skill loaded then discarded needs a
stated reason **in the conversation**, before the work continues.

Two questions, never conflated:

| Question | Answered by | Nature |
|---|---|---|
| which skills to load | the 1% rule in `CLAUDE.md` | inclusive — doubt loads it |
| which route to take | the tier classifier in `noetron-router` | deterministic — one answer |

Confusing them produces the two characteristic failures: a route chosen by vibes, and a skill
skipped because the route "seemed obvious".

## Trap thoughts

Each row is the thought that precedes a violation. Catching yourself thinking the left column
means: stop and invoke.

| Trap | Reality |
|---|---|
| "It's just a simple question" | Questions are tasks. Routing applies to them. |
| "I need more context first" | Skills tell you *how* to gather context. Route first. |
| "I remember what that skill says" | Skills change between sessions. Read the current one. |
| "The skill is overkill for this" | That is what the tier is for. Classify, don't skip. |
| "I'll check it after I get started" | After you start is where the mistakes already happened. |
| "This one I can answer without the repo" | Then the answer holds in any repository. If it doesn't, route. |
| "There's a task open, so this request continues it" | Two names, one ledger. Say both out loud and let the user pick. |

---

**This skill is working if:** the first substantive move of every conversation is a skill
invocation and not a partial answer; no conversation reaches a write without having passed through
`noetron-router`; a repository with no `.noetron/` is offered setup before its first task action; a
request that is not the open task never displaces it without the user seeing both named; and no
tier, chain, or gate is ever decided inside this file.
