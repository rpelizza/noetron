# Template: noetron/adr/

Architecture Decision Records: every architectural decision, its context, and its consequences.

## Scaffold

`noetron-setup` creates only `noetron/adr/README.md`, with exactly this content:

```markdown
# ADR

One file per architectural decision: `NNNN-<slug>.md` (sequential, zero-padded:
0001, 0002, …). Lean MADR format. Lifecycle: proposed → accepted → superseded.
Stable references look like ADR-0007.
```

## Entry format

```markdown
---
status: proposed | accepted | superseded by ADR-NNNN
date: YYYY-MM-DD
---

# ADR-NNNN: <Decision title>

## Context
What forces the decision: the problem, constraints, requirements.

## Decision
What was decided, stated actively ("We will …").

## Consequences
What becomes easier, what becomes harder, what debt is knowingly accepted.

## Alternatives considered
- <Alternative> — why it was rejected
```

## Rules

- Record an ADR whenever a task makes a decision that shapes architecture: a new dependency, a data model, a module boundary, a protocol, a build or deploy strategy.
- The task proposes the ADR; the user ratifies it (propose-confirm). Only then does it become `accepted`.
- Never edit an accepted ADR's substance — supersede it with a new one and cross-link both.
