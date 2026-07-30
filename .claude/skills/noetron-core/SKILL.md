---
name: noetron-core
description: Use when starting any conversation — before ANY response or action, including clarifying questions.
---

<DELEGATED-AGENT-STOP>
If you are a subagent assigned to execute a specific task or an agent within a team assigned to execute a specific task **IGNORE THIS SKILL**.

This exception applies ONLY to agents that received a task delegated by another agent (subagents or members of an agent team). If you are executing work inline — without a task having been delegated to you by another agent — this exception is discarded and you MUST follow this skill in full.
</DELEGATED-AGENT-STOP>

# Noetron Core

Noetron routes every task through skills. This file is the root of that graph: it decides what happens before anything else does.

## First-use check

Before any task-related action, check `noetron/` at the repository root:

- **Missing or incomplete** → setup has not finished here. Invoke `noetron-setup` (it proposes before creating anything) and return to the user's task once setup resolves.
- **Present and complete** → proceed to routing.

Purely conceptual questions that need no project context are exempt: answer them directly.

## The invocation contract

<EXTREMELY-IMPORTANT>
If there is even a 1% chance that a skill applies to what you are about to do, invoke it and read it — before responding, before asking a clarifying question, before planning, before making assumptions, before touching any file or tool, before delegating. Applicability is not yours to negotiate: when a skill applies, following it is mandatory, entirely, in order. Reading without following does not count.

Uncertain whether a skill applies? That uncertainty is the signal. Invoke it.

If several skills apply, invoke all of them and follow them in a sensible order. The only valid reasons to skip a skill are a higher-priority instruction or the skill's own scope saying it must not be used here.
</EXTREMELY-IMPORTANT>

### Trap thoughts

Each row is a thought that precedes a violation. Catching yourself thinking the left column means: stop and invoke.

| Trap | Reality |
|---|---|
| "It's just a simple question" | Questions are tasks. Routing applies to them. |
| "I need more context first" | Skills tell you *how* to gather context. Route first. |
| "Let me explore the codebase quickly" | Exploration is substantive action. Route first. |
| "I remember what that skill says" | Skills change between sessions. Read the current version. |
| "The skill is overkill for this" | Simple things become complex mid-flight. The skill is cheaper than the rework. |
| "Doing something now feels productive" | Undirected action costs more than routing ever does. |
| "I know the concept it covers" | Knowing the concept is not following the skill. |
| "I'll check it after I get started" | After you start is where the mistakes already happened. |

## The oracle doctrine

**Autonomy is a function of oracle strength — never a setting.**

A unit of work is only well-defined as **action + oracle + stop condition**:

- The **oracle** is the check that proves the action worked. A **machine oracle** (test, build, lint, command output, diff invariant) closes the loop by itself — iterate freely until it passes. An **attestation oracle** (a human judging evidence) cannot close a loop — present the evidence and pause.
- A plan or spec step **without an oracle is invalid**. Do not execute it; send it back to get one.
- The **stop condition** is declared before the loop starts — an iteration cap, and what happens at the cap (escalate to the user with what was tried). Never improvise it mid-loop.
- To gain autonomy, **strengthen the oracle**. Never loosen the gate.

## Execution doctrine

Two invariants every implementation task inherits:

- **Every changed line traces to the request.** Given the diff and the request, each hunk has a nameable justification. This is the default machine oracle for implementation work when no better one exists.
- **Own your orphans.** Remove the imports, variables, and functions that *your* change made unused. Pre-existing dead code is not yours: report it, never delete it unasked.

## Routing

See [Routing](references/routing.md) for the current routes and the planned per-task dynamic graph.

---

**This skill is working if:** the first substantive move of every conversation is a skill invocation (or setup, in a fresh repository); plans and specs arrive at execution with an oracle on every step; and diffs contain only lines traceable to their requests.
