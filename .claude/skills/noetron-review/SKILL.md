---
name: noetron-review
description: Use after each task during spec execution, when a feature or branch is complete, before integrating any delivery, when the user asks for a review of a working tree, branch, or PR — and when receiving review feedback from any source, before implementing it.
---

# Noetron Review

Independent eyes on the diff — in both directions: dispatching reviewers on the harness's work, and receiving feedback with technical rigor instead of performative agreement. Reviews exist to find what is really there; **zero findings is a valid outcome**, and a fabricated finding is a defect of the review.

## The two lenses (per-task review)

Two dispatches, independent and parallel (read-only fan-out). The lenses never merge and never see each other's verdicts.

| Lens | Sees | Judges |
|---|---|---|
| **Spec — blind** | the brief + the review package (diff). **Not** the report, not the implementer's rationale. | compliance: **Missing / Extra / Misunderstood** against the brief, with the spec's Global constraints as attention lens |
| **Quality** | brief + report + review package + Global constraints | code quality: separation of concerns, error and empty paths, tests that exercise real behavior (a mock assertion proves the mock), DRY without premature abstraction, evidence for every claim in the report |

Rules both lenses obey:

- **Read-only.** Never edit, never move HEAD; a working copy, if needed, is a temporary worktree.
- **The diff is read once**, and its context lines ARE the changed files. Inspect outside the diff only for a **nameable concrete risk** (lock ordering, API contract, shared mutable state — named in the report).
- **Do not re-run the suite** — the coordinator already verified claims via `noetron-verify`. But warnings or noise in recorded test output **are findings**: output must be impeccable.
- **Do not trust the report.** Every statement in it is an unverified claim, and a stated rationale ("kept it simple for YAGNI") never reduces a finding's severity — that is the implementer grading its own work.
- Findings carry `file:line`, what is wrong, why it matters, and how to fix. Recognize precisely what was done well before listing problems — accurate praise makes the rest of the feedback trusted.

## Severities

| Severity | Meaning | Destination |
|---|---|---|
| **Critical** | breaks correctness, security, or data | fix now |
| **Important** | the task cannot be trusted until this is fixed | fix loop |
| **Minor** | real, but nothing depends on it now | ledger as deferred — the final review is pointed at it (a roll-up nobody reads is a silent discard) |
| **⚠️ Cannot verify from diff** | the reviewer lacks cross-task context | does not block the review; the coordinator **must** resolve every ⚠️ before completing the task |

A **plan-mandated defect** is still a finding — reported as Important with the label: the plan's authorship does not grade its own work; the human decides.

**Fix-loop trigger:** spec verdict ❌, any Critical or Important, or a confirmed ⚠️. Loop mechanics (cap 5, fresh eyes at round 4, circuit breaker) live in `noetron-execute`.

## Pre-report gate

Before returning findings, re-check each one: would a senior engineer on this team actually change this? Is it inside this diff's scope? Does it have `file:line` and a named failure mode? Findings that fail the gate are dropped. Zero findings after the gate is reported as exactly that — never pad a review to look thorough, and never bury the verdict: the report starts with it.

## Final branch review — always, integral

Every execution closes with a review of the whole range (`merge-base..HEAD`), one reviewer, full package, explicitly pointed at the deferred Minors and parked adjudications from the ledger — integration defects between tasks are invisible to per-task reviews.

If it returns findings: **one fixer with the complete list** — never one fixer per finding (each rebuilds context and re-runs suites; that wave costs more than the tasks did). Then **exactly one scoped re-review**. There is no second fix wave: whatever remains goes to the user with the evidence.

## Standalone reviews

For a user-requested review of a working tree, branch, or PR: same two lenses. The spec lens reviews against whatever contract exists — spec, issue, request text. No contract → run the quality lens only, and say so in the verdict.

## Receiving review feedback

From humans, external reviewers, or bots — before implementing anything:

1. **READ** all of it. If **any** item is unclear: stop — clarify **all** unclear items before implementing **any** (items may be related; partial understanding produces wrong implementations).
2. **VERIFY** each item against the codebase (`noetron-explore`): external feedback may lack context this repository has.
3. **RESPOND** technically. Banned: "You're absolutely right!", "Great catch!", gratitude, or any performative agreement — state the fix ("Fixed in `<place>`") or push back with evidence. Actions over words.
4. **Push back** when the suggestion breaks functionality, lacks context, violates YAGNI (grep real usage before implementing "do it properly" — an unused endpoint gets removed, not hardened), or contradicts a decision the user ratified — that last one goes to the user, not to the reviewer.
5. **IMPLEMENT** in order — blockers, then simple, then complex — testing each individually.

## Red flags

- Reviewing your own implementation as a substitute for independent eyes.
- "Looks good" without having read the diff; feedback on code not actually read.
- A finding without `file:line`, or vague advice ("improve error handling").
- Nitpicks reported as Critical; severity softened because the report explained itself.
- Skipping the final branch review, or dispatching one fixer per finding.
- Implementing feedback while part of it is still unclear.
- Performative agreement in any form.

## Integration

- `noetron-execute` — dispatch mechanics, review package, and the fix loop live there.
- `noetron-verify` — findings are claims too: evidence before assertion, here as everywhere.
- `noetron-spec` — the contract reviewed against; Global constraints are the attention lens.
- `noetron-interview` — feedback that contradicts a ratified decision goes to the user.
- `noetron-explore` — read-only verification of out-of-diff risks and of external feedback.
- `noetron-debug` — a finding that reveals a deeper defect is investigated there.
- `noetron-finish` — the passed final review is its entry gate.
- `noetron-design` — reviews of frontend diffs delegate fidelity and craft-floor checks there.

---

**This skill is working if:** findings arrive with `file:line` and a named failure mode; zero-finding reviews occur and are trusted; fix loops shrink release over release; and no performative agreement appears in transcripts.
