# Decision records — `docs/adr/`

Architecture decision records live **with the project**, at `docs/adr/`, following the adr-tools and
MADR convention. They are not harness bookkeeping: an ADR outlives the harness that produced it, and
it is read by reviewers, new maintainers, and tools that already know that path.

This is why `noetron/adr/` is gone. A decision record filed inside the harness's own workspace is
invisible to everyone who does not use the harness, and it competes with the `docs/` the project
already has.

## At setup

Detect an existing convention before proposing anything — `docs/adr/`, `doc/adr/`, `docs/decisions/`,
`adr/`, or an `.adr-dir` file left by adr-tools. Found one → record that real path in
`.noetron/profile.md` and use it. Found none → propose creating `docs/adr/`, and create it only if the
user agrees. Setup never seeds an empty directory or a placeholder record: the first accepted decision
creates the first file.

## Naming and format

`NNNN-<kebab-title>.md`, sequential and zero-padded — `0001-use-postgres.md`. Stable references read
`ADR-0007`. Lean MADR:

```markdown
---
status: proposed | accepted | superseded by ADR-NNNN
date: YYYY-MM-DD
---

# ADR-NNNN: <Decision title>

## Context
The forces: problem, constraints, requirements.

## Decision
What was decided, stated actively — "We will …".

## Consequences
What becomes easier, what becomes harder, what debt is knowingly accepted.

## Alternatives considered
- <alternative> — why it was rejected
```

If the repository already has ADRs in a different format, follow that format. A second convention in
the same directory is worse than a less-preferred one.

## When a decision earns a record

A choice that shapes architecture and would be expensive to reverse: a new dependency or service, a
data model, a module boundary, a protocol or wire format, a build or deploy strategy, an accepted
security trade-off. A decision a task makes and unmakes inside its own diff is a plan `## Decisions`
line, not an ADR.

## Rules

- **Propose, then ratify.** The task drafts the ADR as `proposed`; only the user's word makes it
  `accepted`. It records a decision that was already the user's to make.
- **Never edit an accepted ADR's substance.** Supersede it with a new record and cross-link both —
  status on the old one, `## Context` on the new.
- The ADR travels in the task's own commits, not the closeout metadata commit: it is project
  documentation, and it belongs with the change it justifies.
- Plans, specs, and history entries link ADRs by relative path instead of restating the decision.

---

**These records are working if:** a reviewer who has never heard of Noetron finds the project's
decisions where they expected them; and no accepted ADR was ever quietly rewritten instead of
superseded.
