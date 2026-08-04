---
name: noetron-interview
description: Use when a material decision is open — an ambiguous requirement, an undefined interface contract, a scope, UX, architecture, data, security, cost, or acceptance choice no spec, plan, or prior ratification covers; when execution hits such a decision mid-task; or when the user asks to be interviewed or to have a design, plan, or spec stress-tested.
---

# Noetron Interview

The harness's gap-closing mechanism, and a standing guard: it fires **anywhere, in any chain**, the
moment a decision belonging to the user is about to be filled by something else. Autonomy covers
mechanical, verifiable steps inside ratified boundaries; everything else stops here.

## Facts are not questions

`noetron-explore` answers questions of **fact**; this skill asks questions of **decision**. A
question reaches the user only after surviving this boundary.

**Not a gap — resolve it yourself, do not ask:**

- anything verifiable in the repository: code, tests, manifests, git history, the `.noetron/` workspace;
- an external technical fact verifiable for the **version actually in use**, via context7 or the
  official docs for that version — the answer exists; go get it;
- a mechanical step inside a boundary already ratified in a spec, plan, or prior decision;
- an implementation detail with no observable effect: internal names, helper order, formatting.

**A gap — stop and ask:**

- a requirement, acceptance criterion, or priority with two materially different readings;
- an undefined interface contract — signature, payload, error, empty state, authorization;
- a scope, UX, architecture, or data-model choice no spec or plan wrote down;
- a cost, performance, or risk trade-off nobody explicitly accepted; a security posture nobody chose;
- a contradiction between spec, plan, and code.

**A product decision does not stop being the user's because a safe, common, or reversible default
exists.** The default becomes the question's *recommendation* — never its answer. Documentation
grounds the options; it never ratifies a decision. **Silence plus a recommendation is not consent.**

## Modes

| Mode | Trigger | Outcome |
|---|---|---|
| Discovery | the goal or acceptance admits materially different readings | objective, scope, constraints, acceptance fixed |
| Focused stress | a design, plan, or spec carries an unproven premise or risk | decision; risk accepted or mitigated; change recorded |
| Gap | execution hit a decision the spec/plan does not cover | decision ratified, recorded, execution resumed |
| Explicit | the user asked for questions, an interview, or stress | the depth asked for — no more |

## Before asking

1. Read the request, the active plan or spec, `.noetron/state.md`, and only the relevant code —
   anything factual through `noetron-explore`.
2. Separate observed facts, your inferences, and the decisions that belong to the user.
3. Delete every question the project already answers. Keep every product decision, even reversible
   ones — turning its default into the recommendation.
4. Order what remains by dependency and impact: the decision that conditions the others goes first.

## How to ask

- **Exactly one question per turn.** After each answer, recompute the rest of the script — answers
  change the questions that follow.
- Offer **2–3 real options** where real options exist, each with its consequence in one line, and
  mark `Recommended: <option> — <reason>`. A facade option (one good, two absurd) is not an option;
  the intelligence is in building genuinely viable alternatives grounded in evidence.
- Use an open question for discovery, or when listing options would bias the answer.
- Say what the answer changes in the delivery. A question that changes nothing is not asked.
- **Escape valve:** if the user says "you decide", recommend and ratify — state the choice and the
  reason, record it as user-delegated, and proceed.

## Recording — one canonical place, pointers elsewhere

<EXTREMELY-IMPORTANT>
A decision is written **once**, in one canonical place. Every other file carries a **pointer** —
never a second copy of the rationale or the rejected options.
</EXTREMELY-IMPORTANT>

| Situation | Canonical place | What the rest carries |
|---|---|---|
| A chain with a plan (`standard`, `large`) | the plan's `## Decisions` | `.noetron/state.md`: one line — `Decision: <slug> → <plan path>#decisions` |
| An architectural decision | an ADR in `docs/adr/` | the plan's `## Decisions`: one line pointing at the ADR |
| A chain with no plan (`trivial`, `small`, `bug`) | `.noetron/state.md`, one line | it migrates into the history entry at closeout |

The choice, the reason, and what was rejected go in the canonical place only.

This is measured, not stylistic: mirroring every decision into the plan **and** the state **and** an
ADR grew `.noetron/state.md` by 440% with a single active task. The ledger has an 80-line ceiling
because it is a **cursor**, not a decision record — and three copies drift until nobody knows which
one was ratified.

## Gap mode — the mid-execution protocol

The approval test: **if the decision is not written in the spec, the plan, or `.noetron/state.md`,
it is not approved — present it before implementing.**

1. **Stop the task.** Do not implement "the most likely reading" to show later; do not park the doubt
   behind a TODO, a flag, or a configurable parameter; do not move to another file while holding the
   question. Code written over a self-filled gap is rework, not progress.
2. **Name the gap in one sentence** — what is undefined, and which material effect it changes
   (product/UX, scope, architecture, data, security, cost, acceptance).
3. **Bring 2–3 real options**, each with its consequence, plus the recommendation.
4. **One question per turn**, starting with the decision that conditions the rest.
5. **Record it** per the table above — one canonical place.
6. **Resume exactly where the task stopped**, now inside a ratified boundary.

**Delegated agents never interview the user.** A subagent or team member under
`DELEGATED-AGENT-STOP` stops at step 1, builds steps 2–3, and returns `NEEDS_CONTEXT` with the gap,
the options, and the recommendation. The **coordinator** interviews, records, and re-dispatches. An
agent that asks the user directly broke the dispatch contract; one that guesses broke this one.

If the gap is large enough to undo the plan, do not patch it with a spot question — return the work
to `noetron-plan`.

## Proportional stress

Hunt only failures plausible for the real surface: missing contract or acceptance; relevant error and
empty states; authorization, security, data; compatibility, migration, rollback; unconfirmed scale or
integration premises; contradictions between spec, plan, and code. Never invent risks to look
thorough — if nothing new was found, say exactly that.

## Stop condition and synthesis

Stop when no open human decision still changes requirement, scope, UX, architecture, data, security,
risk, acceptance, or approach — and the next step plus its oracle are clear. An answer that spawns a
dependent decision continues the interview; one that spawns investigable technical work returns to
the flow as a task, not a question. Do not chase "complete understanding".

Always close with the synthesis gate — active hunting, not prose:

```text
Decisions:
- choice — reason/evidence — recorded in: <canonical place>

Gaps (numbered — each with what it changes):
1. gap — changes scope/UX/architecture/data/security — resolved, accepted, or converted to a task

Open premises: only those still constraining execution
Next step: the skill or artifact that takes back control
```

Present the synthesis for ratification. A summary without the gaps section is incomplete.

## Red flags

- Filling a gap with a default, a convention, documentation, or a "reasonable inference".
- Asking what the repository or the docs for the version in use already answer.
- Implementing the likely reading and presenting the decision as done.
- Hoarding gaps to ask in one batch at the end; more than one question per turn.
- Facade options; a recommendation with no evidence.
- Copying a decision's rationale into a second or third file instead of a pointer.
- A delegated agent interviewing the user, or resolving its own `NEEDS_CONTEXT`.
- Handing control back without exposing the gaps — exposing them is the point.

## Integration

- `noetron-explore` — answers the factual half before any question is asked.
- `noetron-reasoning` — builds the options, trade-offs, and recommendations the questions carry.
- `noetron-plan` — discovery before design, the mandatory stress of the draft, every planning decision.
- `noetron-spec` — the integral stress before `status: ready`, and every translation-time decision.
- `noetron-execute` — gap mode is its mandatory stop; delegated agents arrive via `NEEDS_CONTEXT`.
- `noetron-create-skill` — FRAME scoping doubts and trigger-test cap escalations land here.
- `noetron-evolve` — one ratification per adoption; a proposal declined twice is a decision to revisit.

---

**This skill is working if:** clarifying questions arrive before implementation instead of after
mistakes; every question carries real options and a recommendation; specs and plans reach execution
with zero silently-filled decisions; `.noetron/state.md` stays under its ceiling while decisions
accumulate; and each decision is findable in exactly one place.
