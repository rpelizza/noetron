---
name: noetron-plan
description: Use when work needs planning before code — a greenfield product or project; a feature, refactor, or structural change with open requirements, architecture, UX, data, or risk decisions; when the user asks for a plan or design; or when it is unclear whether a task needs a plan, a spec, or neither.
---

# Noetron Plan

Turn a ratified objective into an approved plan — the durable record of the planning conversation. A plan is always complete: it resolves every open material decision before execution exists. What scales with task size is not the plan's rigor but **which chain of artifacts the task gets** — and deciding that is also this skill's job.

<HARD-GATE>
No implementation while planning. Do not write code, scaffold files, or take any implementation action until the plan is approved — regardless of how simple the task seems. "Too simple to need a plan" is exactly where unexamined assumptions cost the most. If it is truly simple, the classifier below routes it out of planning — through the gate, not around it.
</HARD-GATE>

## Entry: classify the chain

Chains scale; plans do not. Classify by observable evidence (gathered via `noetron-explore`), recommend, and get the user's ratification in one line before starting:

| Evidence | Chain |
|---|---|
| Any open material decision — requirement, scope, architecture, UX, data, risk (the gap list in `noetron-interview`) | **Plan + spec.** Greenfield and structural change are always here — a defined stack does not close product decisions. |
| No open decisions (goal, approach, acceptance already ratified), but multi-step execution needing per-step oracles | **Spec only** (`plan: none` — see `noetron/specs/README.md`) |
| Small mechanical change, roughly one surface, obvious oracle | **Direct execution** with an inline micro-plan (`step → verify: check` in the response), honoring the core doctrines |
| Read-only or conceptual | **Nothing** — no artifacts, no state |

Misclassification has one common direction: calling work "quick" to escape the chain. The classifier runs on evidence, not on the wish to skip ceremony — and the user ratifies it.

## The planning loop

### 1. DISCOVER

If the objective or acceptance admits materially different readings, run `noetron-interview` (discovery mode) first — objective, scope, constraints, and acceptance get fixed before any design. One question per turn.

### 2. EXPLORE

Map the territory via `noetron-explore`: the patterns to follow, prior art in `noetron/` (plans, ADRs, docs, history), the surfaces the work will touch. Facts collected here feed every later step — a plan built on unread code is imagination.

### 3. APPROACHES

- Propose **2–3 genuinely different approaches** with trade-offs, leading with `Recommended: <approach> — <reason>`. Offer one approach only when the territory truly admits one — and say so explicitly.
- **YAGNI check** every approach: solve today's problem; complexity needs a present signal that authorizes it.
- **Decomposition check**: if the request contains independent subsystems, split before refining — each plan must yield working, verifiable software on its own.

### 4. DESIGN

Present the chosen approach as a design, scaled to complexity:

- **Short design** (a few sentences suffice) → present it whole, one approval.
- **Complex design** → present in sections — architecture, components, data flow, error handling, testing strategy — with a "does this hold so far?" checkpoint per section, then a final approval.

Cover what the work needs, not a fixed template: interfaces and contracts, data, error and empty states, and the acceptance criteria the spec will later turn into oracles.

### 5. WRITE

Write `noetron/plans/YYYY-MM-DD-<slug>.md`, `status: draft`, following the format in `noetron/plans/README.md` (format authority: the `noetron-setup` template). The `## Decisions` section records every decision ratified so far — including rejected alternatives and why. Open questions stay marked `(open)` and block approval.

### 6. STRESS

Mandatory — never skipped to save time. Run `noetron-interview` (focused stress) against the draft, proportional to the real surface. Every gap found is resolved with the user or explicitly accepted; the plan is updated. A plan that was never stressed is a draft, whatever its status says.

### 7. APPROVE

Present the synthesis: decisions, gaps and their fates, risks. The user approves → `status: approved`. Only approved plans derive specs. Approval is an attestation oracle — evidence presented, human decides.

### 8. HANDOFF

Deriving the executable spec belongs to `noetron-spec`. The plan's slug names everything downstream: the spec, the branch, the history entry.

## Plan altitude

The plan records **what and why**; the spec records **how, step by step, with oracles**. No file-by-file task lists in the plan — and no unresolved "we'll see during implementation" either: that phrase names a gap, and gaps go to `noetron-interview`. Acceptance criteria are the bridge: the plan states them; the spec turns each one into a verifiable check.

## Red flags

- Writing any code or scaffold before approval — the HARD GATE has no trivial-task exception; triviality routes through the classifier.
- Classifying as "direct execution" to escape the chain, or padding a plan when nothing is open — both misclassify, both get caught by the evidence table.
- Designing without exploring, or exploring from memory instead of `noetron-explore`.
- One facade approach plus two absurd ones.
- Skipping the stress "because the design is obviously right".
- Approving with `(open)` questions still in the plan.
- Resolving a mid-planning decision by default instead of `noetron-interview`.

## Integration

- `noetron-interview` — discovery before design; mandatory stress after; every mid-planning decision.
- `noetron-explore` — territory mapping and classifier evidence.
- `noetron-verify` — any claim about current system behavior made while planning needs evidence.
- `noetron-spec` — derives the executable spec from the approved plan.
- `noetron-execute` — runs the ready spec inside the ratified boundary.

---

**This skill is working if:** greenfield and structural work never reach code without an approved, stressed plan; quick fixes never acquire plans or specs; every plan's Decisions section names its rejected alternatives; and execution stops hitting decisions the plan should have resolved.
