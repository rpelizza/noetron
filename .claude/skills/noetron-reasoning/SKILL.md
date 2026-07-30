---
name: noetron-reasoning
description: Use when facing material uncertainty — competing hypotheses, a decision between alternatives, evidence that needs synthesis, a high-impact validation, or an investigation without an obvious next step. Not for mechanical steps whose contract and proof are already clear.
---

# Noetron Reasoning

Technique selection for material uncertainty. The harness's skills already embed the right reasoning where it is mandatory (single hypothesis in `noetron-debug`, competing approaches in `noetron-plan`, proportional stress in `noetron-interview`); this skill covers the open ground between them — and keeps two lines bright: **reasoning is the harness's job, deciding is the user's**, and a technique produces evidence or options, never a self-ratified decision.

## Pick by the dominant question

| The question in front of you | Technique |
|---|---|
| "What is actually true here?" | **Evidence triangulation** — via `noetron-explore`, from independent sources, hunting *disconfirming* evidence first; a claim confirmed only by sources that share an origin is one claim, not three. |
| "Which option?" | **Weighted trade-off** — explicit criteria named before scoring, real options (no facades), and a recommendation: never hand the user a menu without a pick and its reason. |
| "Will this survive contact?" | **Assumption tracking** — list the premises, mark the load-bearing ones, test the cheapest load-bearing premise first; a plan is as strong as its cheapest untested load-bearing assumption. |
| "Why did this happen?" | **Falsifiable hypothesis chain** — one written hypothesis at a time (`noetron-debug`'s discipline, usable outside debugging). |
| "What am I missing?" | **Completeness sweep** — which source, modality, stakeholder, or failure mode was never consulted? What was silently scoped out? |
| "Is this loop converging?" | **OODA check** — is new information still changing the decision? If two iterations changed nothing, stop looping: act or escalate. |

## Rules

- **Write the reasoning down** where the work lives (plan/state `## Decisions`, the investigation notes) — reasoning that only happened in context is unauditable and dies at compaction.
- **Evidence before technique.** Every technique consumes facts from `noetron-explore`; none of them substitutes for looking.
- **Outputs are inputs to a gate.** A trade-off's recommendation feeds a `noetron-interview` question; a stress result feeds the plan; a triangulation feeds a claim that `noetron-verify` will demand evidence for.

## Anti-patterns

- **Technique theater** — applying a framework to look thorough when the answer needed one read of the code.
- **Infinite analysis** — more analysis after it stopped changing the recommendation is stalling, not rigor.
- **Self-ratification** — "the trade-off clearly favors X, proceeding with X" on a decision that belongs to the user.
- **Confirmation sweep** — collecting only evidence that agrees; disconfirming evidence is the point of looking.

## Integration

- `noetron-interview` — options and recommendations inside questions are built here.
- `noetron-plan` — APPROACHES and risk sections consume these techniques.
- `noetron-debug` — the hypothesis discipline, shared.
- `noetron-explore` — every technique's raw material.
- `noetron-verify` — conclusions are claims; claims need evidence.

---

**This skill is working if:** recommendations arrive with named criteria and disconfirming evidence considered; load-bearing assumptions get tested before the plan bets on them; analysis stops when it stops changing the answer; and no decision is ever ratified by its own trade-off table.
