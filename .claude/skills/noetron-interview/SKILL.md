---
name: noetron-interview
description: Use when a material decision is open — an ambiguous requirement, an undefined interface contract, a scope, UX, architecture, data, security, cost, or acceptance choice that no spec, plan, or prior ratification covers; when execution hits such a decision mid-task; or when the user asks to be interviewed or to have a design or plan stress-tested.
---

# Noetron Interview

The harness's canonical gap-closing mechanism. Decisions that evidence cannot answer are obtained from the user — never filled by default, convention, documentation, or "reasonable inference", even when the choice looks obvious and reversible. Autonomy covers mechanical, verifiable steps inside ratified boundaries; everything else stops here first.

Announce: "Using noetron-interview to resolve the open decisions."

## Facts are not questions

`noetron-explore` answers questions of fact; this skill asks questions of decision. A question only reaches the user after surviving this boundary:

**Not a gap — resolve it yourself (via `noetron-explore`):**

- anything verifiable in the repository (code, tests, manifests, git history, `noetron/` workspace);
- external technical facts verifiable for the version in use (context7 / official docs);
- a mechanical step inside a boundary already ratified in spec, plan, or a prior decision;
- an implementation detail with no observable effect (internal names, helper order, formatting).

**A gap — stop and ask:**

- a requirement, acceptance criterion, or priority with two materially different readings;
- an undefined interface contract (signature, payload, error, empty state, authorization);
- a scope, UX, architecture, or data-model choice no spec or plan wrote down;
- a cost, performance, or risk trade-off nobody explicitly accepted;
- a contradiction between spec, plan, and code.

A product decision does not stop being a gap because a common, safe, or reversible default exists — the default becomes the question's **recommendation**, never its answer. Documentation grounds options; it never ratifies a decision that belongs to the user.

## Modes

| Mode | Trigger | Outcome |
|---|---|---|
| Discovery | the goal or acceptance admits materially different readings | objective, scope, constraints, acceptance fixed |
| Focused stress | a design or plan exists but carries a concrete unproven premise or risk | decision; risk accepted or mitigated; change recorded |
| Gap | execution hit a decision the spec/plan does not cover | decision ratified, recorded, execution resumed |
| Explicit | the user asked for questions, an interview, or stress | the depth asked for — no longer |

## Before asking

1. Read the request, the active plan/spec, `noetron/state.md`, and only the relevant code — through `noetron-explore` for anything factual.
2. Separate observed facts, inferences, and decisions that belong to the user.
3. Delete every question the project already answers. Keep every product decision, even reversible ones — turning its default into the recommendation.
4. Order what remains by dependency and impact: the decision that conditions the others comes first.

## How to ask

- **Exactly one question per turn.** After each answer, recompute the remaining script — answers change the questions that follow.
- Offer **2–3 real options** when real options exist, each with its consequence in one line, and mark `Recommended: <option> — <reason>`. Facade options (one good, two absurd) are not options; the intelligence is in building genuinely viable alternatives grounded in evidence.
- Use an open question for discovery, or when listing options would bias the answer.
- Say why the answer changes the delivery. A question that changes nothing is not asked.
- If the platform provides a question tool, use it without changing this contract's semantics.
- **Escape valve:** if the user says "you decide", recommend and ratify — state the choice and the reason, record it as user-delegated, and proceed.

## Gap mode: mid-execution protocol

The approval test: **if the decision is not written in the spec, the plan, or `noetron/state.md`, it is not approved — present it before implementing.**

1. **STOP the task.** Do not implement "the most likely reading" to show later; do not park the doubt behind a TODO, flag, or configurable parameter; do not continue in another file while holding the question. Code written over a self-filled gap is rework, not progress.
2. **Name the gap in one sentence** — what is undefined and which material effect it changes (product/UX, scope, architecture, data, security, cost, acceptance).
3. **Bring 2–3 real options**, each with its consequence, and the recommendation.
4. **One question per turn**, starting from the decision that conditions the rest.
5. **Record the answer** in the active plan's `## Decisions` and mirror it in `noetron/state.md` → `## Decisions`, including what was rejected and why. An architectural decision also becomes an ADR (`noetron/adr/`).
6. **Resume exactly where the task stopped**, now inside a ratified boundary.

**Delegated agents** (under `DELEGATED-AGENT-STOP`): a subagent or team member never interviews the user. Stop at step 1, build steps 2–3, and return `NEEDS_CONTEXT` with the named gap, the options, and the recommendation. The coordinator interviews the user and re-dispatches.

If the gap is large enough to undo the plan, do not patch it with a spot question — send the work back to planning.

## Proportional stress

When stressing a design or plan, hunt only failures plausible for the real surface: missing contract or acceptance; relevant error and empty states; authorization, security, data; compatibility, migration, rollback; unconfirmed scale or integration premises; contradictions between spec, plan, and code. Never invent risks to look thorough — if nothing new was found, say exactly that.

## Stop condition and synthesis

Stop when no open human decision still changes requirement, scope, UX, architecture, data, security, risk, acceptance, or approach — and the next step plus its oracle are clear. Do not chase "complete understanding". If an answer spawns a dependent decision, continue; if it spawns investigable technical work, return it to the flow as a task, not a question.

**Always close with the synthesis gate** — active hunting, not prose:

```text
Decisions:
- choice — reason/evidence

Gaps (numbered — each with what it changes in the solution):
1. gap — changes scope/UX/architecture/data/security — resolved, accepted, or converted to a task

Open premises:
- only those still constraining execution

Next step:
- the skill/artifact that takes back control
```

Present the synthesis for ratification. A summary without the gaps section is incomplete.

## Red flags

- Filling a gap by default, convention, docs, or "reasonable inference".
- Implementing the most likely reading and presenting the decision as a done deal.
- Hoarding gaps to ask in a batch at the end of the task.
- Asking what the code already answers, or fabricating a gap with no material effect.
- More than one question per turn.
- Facade options; a recommendation without evidence.
- Handing control back without exposing the gaps — exposing them is the point.
- Continuing after no open decision depends on the user.
- Declaring that every project necessarily has a gap.

## Integration

- `noetron-explore` — answers the factual half before any question is asked.
- `noetron-create-skill` — FRAME scoping doubts and trigger-test cap escalations land here.
- `noetron-plan` — discovery before design; mandatory stress of the draft plan; every mid-planning decision.
- `noetron-spec` — mandatory integral stress before `status: ready`; every translation-time decision.
- `noetron-execute` — gap mode is its mandatory stop; delegated agents escalate here via `NEEDS_CONTEXT`.

---

**This skill is working if:** clarifying questions arrive before implementation, not after mistakes; every question carries real options and a recommendation; specs and plans reach execution with zero silently-filled decisions; and diffs stop containing choices the user never made.
