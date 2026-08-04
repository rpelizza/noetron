---
name: noetron-review
description: Use after each task during spec execution, when a feature or branch is complete, before integrating any delivery, when the user asks for a review of a working tree, branch, or PR — and when receiving review feedback from any source, before implementing it.
---

# Noetron Review

Independent eyes on the diff, both ways: reviewing the harness's work, and receiving feedback with
rigor, not performative agreement. **Zero findings is valid**; a fabricated finding is a defect.

## Scope by tier, and the two lenses

| Tier | Review | Where `noetron-router`'s chain calls it |
|---|---|---|
| `trivial` | none — the step's oracle is the whole proof | no `review` node in the chain |
| `small`, `bug` | one scoped review: the diff against the request, quality lens | `review(scoped)`, after `verify` |
| `standard`, `large` | both lenses per task — parallel, blind to each other — plus the final branch review of each delivery | per task inside `noetron-execute`'s loop, then `review ═G2═► finish`, which loops once per deliverable slice |
| standalone (user-asked) | both lenses against whatever contract exists — spec, issue, request text; none → quality lens only, and the verdict says so | no chain; entered directly |

| Lens | Sees | Judges |
|---|---|---|
| **Spec — blind** | the brief + the review package (diff). **Not** the report, not the implementer's rationale | compliance: **Missing / Extra / Misunderstood** against the brief, Global constraints as attention lens |
| **Quality** | brief + report + review package + Global constraints | separation of concerns, error and empty paths, tests that exercise real behavior, oracles that can actually reject, DRY without premature abstraction, evidence for every claim |

**Split is not a mode.** The two lenses are always two reviewers. There is no `combined` option at
any tier, G0 never offers one, and no user request converts one into the other — a single reviewer
holding both lenses has already read the report it is supposed to distrust, so it cannot be blind to
the spec while judging against it. A `review: split | combined` field surviving in any template,
ledger, or scaffold is the residue of a revoked option: **delete the field, not just the second
value** — a field with one legal value is a question nobody should be asked.

## What the reviewer must be given

Ceremony scales with tier; **the reviewer's floor does not.** Its dispatch carries **the same harness
floor as the implementer's** — element 3 of the [dispatch contract](../noetron-execute/references/dispatch.md),
in full: `noetron-preferences` without exception, plus `noetron-testing`, `noetron-security`, and
`noetron-design` as the diff's territory demands, the domain skills (`<prefix>-*`) the task named,
and the grounding rule. **A reviewer that never received the floor cannot hold it** — the quality
lens guards project-wide standards only when they ride its briefing, and under
`DELEGATED-AGENT-STOP` nothing is discovered.

## What comes back — 15 lines, and a file holds the rest

The full review is a **file** — `.noetron/work/<slug>/review-N-<lens>.md`, where `<lens>` is `spec`
or `quality` and **the dispatch that created the file wrote it** (`noetron-execute` § Which lenses
are dispatched, which also names the variants the short chains and a delivery's final review use).
A file still carrying the literal `<lens>` is a verdict nobody can attribute to a lens. It sits
under the same 150-line ceiling the implementer's report has. **Back to the coordinator: at most 15
lines** — the verdict,
one line per Critical and Important (`severity · file:line · failure mode`), the Minor count, and
the file's path.

Same number as the implementer's cap, for a sharper reason. Everything printed back stays resident
in the coordinator's context for the rest of the session, and the review return is the **most
multiplied text in the harness**: two lenses per task, times the tasks, plus one re-review after
every fix, up to five. The implementer prints once per task; the reviewer prints roughly a dozen
times over the same spec. Uncapped, the reviews crowd out the context that still has to run the next
task — and a coordinator reading full review prose starts fixing findings itself.

Those 15 lines are a routing surface, not the content: the fix dispatch carries the **findings
verbatim from the file** (`noetron-execute`), so keeping them out of the transcript loses nothing.
Minors never travel individually — they go from the file to the ledger as deferred. Findings that
cannot fit are themselves a finding: say so in the verdict line, because a task failing in eight
places is failing as a whole, and the fix loop is the wrong instrument for it.

## Rules both lenses obey

- **Read-only.** Never edit, never move HEAD; a working copy, if needed, is a temporary worktree.
- **The diff is read once**, and its context lines ARE the changed files. Look outside it only for a
  **nameable concrete risk** — lock ordering, API contract, shared mutable state — named as such.
- **Do not trust the report.** Every statement is an unverified claim, and a stated rationale ("kept
  it simple for YAGNI") never lowers a severity: that is the implementer grading its own work.
- **Recorded output is judged.** Warnings and noise are findings; so is an oracle that cannot reject,
  and a behavior-bearing task with no runner output for its red (`noetron-verify`).
- **Pre-report gate.** Each finding carries `file:line`, the failure mode, and the fix, and survives
  one question: would a senior engineer here change this, in scope? What fails is dropped, precise
  praise comes before the problems, and the verdict opens the report.

## The suite runs after every fix

The reviewer does not run the suite; **the fix loop does, after every fix, before the re-review.**
Division of labor: **the scoped re-review judges the findings; the suite judges collateral
regression.** A fix that turns the suite red is not addressed, however clean the scoped review reads.

This closes a measured hole: a re-review scoped to "findings plus the fix diff" with no suite between
rounds let a fix break something outside its diff and surface rounds later — fix, break, fix again.

## Severities

| Severity | Meaning | Destination |
|---|---|---|
| **Critical** | breaks correctness, security, or data — a false oracle belongs here | fix now |
| **Important** | the task cannot be trusted until fixed; a plan-mandated defect lands here, labelled — the plan does not grade its own work | fix loop |
| **Minor** | real, but nothing depends on it now | ledger as deferred; its delivery's final review is pointed at it, before that delivery's G2 |
| **⚠️ Cannot verify from diff** | the reviewer lacks cross-task context | does not block; the coordinator **must** resolve every ⚠️ before completing the task |

**Fix-loop trigger:** spec verdict ❌, any Critical or Important, or a confirmed ⚠️. Loop mechanics
(cap 5, fresh eyes at round 4, circuit breaker) live in `noetron-execute`.

## Final branch review

Every `standard` and `large` **delivery** closes with a review of the whole range
(`merge-base..HEAD`), one reviewer, full package, pointed at the ledger's deferred Minors and parked
adjudications — integration defects between tasks are invisible to per-task reviews. Findings → **one
fixer with the whole list**, never one fixer per finding → **suite** → one scoped re-review; what
remains goes to the user with the evidence.

**A delivery is one delivery unit under `cadence: per-slice` — the deliverable slice plus every
`deliverable: no` slice that lands with it — and the whole spec under `single-delivery`.** With slices this runs once per slice, immediately before that slice's G2: the
range is the slice's branch against the base its predecessor landed in, and the Minors it collects
are the current `## Ledger — slice <k>` section's, which resets when the slice closes. The last
slice's review **is** the spec's — nothing waits for an extra whole-spec pass afterwards, and no
earlier slice reaches a destination without one of its own.

## Receiving feedback

1. **READ** all of it — human, external reviewer, or bot. Any item unclear → clarify **all** unclear
   ones first: items relate, and partial understanding produces wrong fixes.
2. **VERIFY** each against the codebase (`noetron-explore`): external feedback may lack context.
3. **RESPOND** technically. Banned: "You're absolutely right!", "Great catch!", gratitude, any
   performative agreement — state the fix ("Fixed in `<place>`") or push back with evidence.
4. **PUSH BACK** when it breaks functionality, lacks context, violates YAGNI (grep real usage — an
   unused endpoint gets removed, not hardened), or contradicts a ratification — that goes to the user.
5. **IMPLEMENT** in order — blockers, simple, complex — testing each individually.

## Red flags

- Dispatching a reviewer without element 3, then claiming the quality lens holds the global floor.
- Closing a fix round without a suite run; judging collateral regression by a scoped re-review.
- A finding without `file:line`; vague advice ("improve error handling"); nitpicks as Critical.
- Returning the whole review as prose to the coordinator instead of a file plus 15 lines; sending
  Minors back one by one.
- Offering, recording, or honouring a `combined` review — including a leftover field that still
  lists it as a choice.
- Reviewing your own implementation; skipping the final branch review, or holding it back to the end
  of the spec when the cadence ratified one per slice; one fixer per finding; performative agreement
  in any form.

## Integration

- `noetron-execute` — dispatch mechanics, the review package, and the fix loop live there.
- `noetron-verify` — findings are claims too; false oracles and missing red evidence are findings.
- `noetron-spec` — the contract reviewed against; Global constraints are the attention lens.
- `noetron-preferences` — the floor the quality lens holds, and only because it rides element 3.
- `noetron-testing`, `noetron-security`, `noetron-design` — lenses composed by the diff's territory.
- `noetron-debug` — a finding revealing a deeper defect is investigated there, under its own cap.
- `noetron-finish` — its entry gate; feedback contradicting a ratification goes to `noetron-interview`.

---

**This skill is working if:** findings arrive with `file:line` and a named failure mode; a fix that
breaks something outside its own diff is caught in the round it happened, not at final validation;
reviewers cite the project's own standards unprompted; every review return to the coordinator fits
in 15 lines with the detail left in its file; no reviewer anywhere holds both lenses at once; no
delivery reaches G2 without a review of its own range; and zero-finding reviews occur and are
trusted.
