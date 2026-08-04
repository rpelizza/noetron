---
name: noetron-evolve
description: Use when a failure recurs and a standing rule might prevent it; when a confirmed defect's fix outgrows the task that found it; when a domain skill's falsifiability signals show it is not working; when a better path found mid-task must be proposed instead of adopted; when the verification standard or the learnings file is missing or over budget; or at closeout when the review marker is due.
---

# Noetron Evolve

The self-optimization cycle: two files, two channels, one rule.

<EXTREMELY-IMPORTANT>
**Self-improvement is a side effect of fixing a real, observed failure — never a reason to go
looking for something to change.** No sweep, no refresh, no "while I'm here". Nothing enters this
cycle that cannot name the failure that produced it.
</EXTREMELY-IMPORTANT>

## The two artifacts

| File | Holds | Read by, and when | Written by, and when |
|---|---|---|---|
| `.noetron/verification-standard.md` | what *correct* means here | `noetron-verify` before judging a task or spec claim · `noetron-spec` when drafting Validation and the task oracles · `noetron-finish` at the closeout proof | `noetron-setup` at install · here, in its own ratified change — **never during a correction** |
| `.noetron/learnings.md` | what execution already learned | `noetron-plan` before proposing approaches · `noetron-explore` when mining evidence | `noetron-finish` at closeout, **only when the task produced a confirmed defect** · here, on promotion and retirement |

Either one missing → create it from [templates/](templates/verification-standard.md). A cycle with no
standard has nothing to measure against, and a learnings file nobody reads before designing is a log.

**Neither file has one owner doing both halves.** That is deliberate: the node that observes a
failure is not the node that would be tempted to soften the standard, and the node that designs is
not the one that decides what counts as a lesson. Every column above names a skill — a file with a
writer and no reader is dead weight, and the reverse is a file nobody keeps current.

### `verification-standard.md` — three parts

1. **Acceptance criteria: pass/fail, never a 0–5 score.** Concrete, objective, observable.
   "Submitting an empty email shows *Enter your email*" passes or fails; "UX quality: 4/5" is an
   opinion wearing a number, and a number can be argued down until the output passes.
2. **The procedure.** **Reading the code is not exercising the artifact** — review proves intent,
   execution proves behavior. Name the command and the output that proves each criterion; for a web
   app, drive it in a browser the way a user would and observe the rendered result.
3. **The baseline** — the outputs already approved, as approved, with their numbers. Without it,
   "it still works" is memory and a regression has nothing to be measured against.

**Read-only during any correction.** If an output fails, fix the **output**. Editing a criterion, the
procedure, or the baseline so a failing output passes is the `CLAUDE.md` guardrail violation under a
friendlier name. The standard changes only in a deliberate, ratified change of its own.

**Budget: 150 lines, hard — Baseline at most 25 rows.** This file is read at every claim of success,
so it is paid more often than any other artifact here, and it was the one growing without a valve
while its sibling `learnings.md` had 200 lines.

The valve is not trimming, it is the definition: **a baseline is the latest known-good state per
surface, not a log of approvals.** One row per surface — an endpoint, a screen, a command, a bundle,
a suite — and a new approval of that surface **replaces its row**, carrying the new numbers and the
new evidence pointer. The superseded numbers are not lost: they are in the history entry of the task
that changed them, which is where "when did p95 move, and which delivery moved it?" is actually
answered. Appending instead would put the answer to "what should this look like now?" behind twenty
stale rows, and a regression check reading the wrong one passes a real regression.

A surface a task retired takes its row out in the same ratified change. Past 25 rows, the criteria
are describing more surfaces than one standard can hold — split the standard per package before
dropping a row to make space.

### `learnings.md` — two parts

**Active rules** (semantic): short imperatives applied on every task in their scope — the reason the
file is read at task start. **Incident log** (episodic): what happened, once each, newest first.

Every entry carries **trigger** (the observable event) · **root cause** (not the symptom) ·
**smallest durable fix** (`file:line`) · **rule learned**, or explicitly `n/a — one-off` · **scope**
(a rule without one fires everywhere) · **revert** (one line) · **status**
`candidate → promoted → retired`.

**Promotion:** a learning becomes a standing rule only after it **recurred 2–3 times**. The first
occurrence is an incident (`candidate`); the repeat is the evidence — promote it into Active rules,
and up into the project's `CLAUDE.md` when it must hold before any skill loads.

**Who fires it, and who performs it.** `noetron-finish` counts: writing a closeout entry, it checks
whether that root cause is already in the log, and a match is the trigger — it names the recurrence
and routes here. The promotion itself happens here and is ratified by the user: flip the entries to
`promoted`, write the one-line imperative into **Active rules** with its scope, and propose the
`CLAUDE.md` edit only when the rule must hold before any skill loads. A promotion nobody is assigned
to trigger is a rule that stays buried in an incident log, which is how a project keeps paying for a
lesson it already wrote down.

**Budget ~200 lines, hard.** Retire before adding: an entry whose failure mode can no longer happen
(code gone, dependency dropped, rule absorbed by a domain skill or a linter) goes `retired` and out.
A file too long to read at task start is a file nobody reads.

## The two channels

| Channel | What it is | What you may do | Gate |
|---|---|---|---|
| **Defect** | an observed failure | fix it, inside the guardrails | none, once confirmed |
| **Opportunity** | a better path noticed mid-task | measure it, propose it | human adoption, always |

**Defect — confirm before fixing.** Reproduce it: real and repeatable. An anomaly that does not
reproduce is **logged, not fixed** — a fix for a phantom is a change with no oracle. Confirmed → run
the loop: smallest durable change, then the *full* standard, not only the part that broke.

**Opportunity — proposal-only, never autonomous.** Finish on the path that already works. Then treat
the gain as a hypothesis: state it in one line, validate the alternative against the **complete**
standard (an improvement that breaks a criterion it never mentioned is a regression), **measure it
against the baseline** with the numbers named, and propose. Adoption is the user's. An opportunity
that cannot be measured against the baseline is an opinion — present it as one.

## The worth-it gate

Escalate from a local fix to a structural change only when **both** hold: the defect **recurred** (it
is in the log at least twice), and a local fix demonstrably does not prevent the next one. Otherwise
fix locally, log, move on.

Every change is **reversible**, its revert line written before it lands. **Nothing structural,
shared, or irreversible lands without explicit human approval** — including the verification
standard, `CLAUDE.md`, shared config, and anything another project consumes.

## Domain skills, subordinated

A domain skill that is not working is an **observed defect**; it enters here with evidence, never as
a speculative sweep.

- **Evidence** (through `noetron-explore`): the skill's falsifiability signals against what actually
  happened; **`.noetron/history/INDEX.md` since the marker — the index, never the directory** —
  opening only the entries its signal column flags `defect` or `rework`; git since the marker
  (reverts, "fix the fix", the same file touched for the same reason). Quiet territory is quiet, not
  defective, and it costs one index line to establish that.
- **One proposal per named weakness** — the smallest edit that addresses it. Uncovered territory →
  propose creation. A failure mode that stopped existing → propose retirement.
- **Validate before presenting**: run `noetron-create-skill`'s trigger test on the edited draft — the
  old failure handled, the triggers still firing. A proposal that fails its own validation is
  reworked or dropped, never shown.
- **Adopt one at a time**, ratified, through `noetron-create-skill`'s edit path — which owns the
  diff, the anti-overwrite lock, and the sync.
- **`noetron-*` harness skills: proposal only**, addressed to the Noetron source repository. Never
  edited inside a consumer project.

## Cadence and the marker

`.noetron/domain-skills.md` carries `## Last review` — the date and the most recent **index line**
considered. `noetron-finish` offers this skill at closeout once **ten or more distinct task slugs**
appear among the index lines after the marker; four slices of one task are one task's worth of
evidence, not four. The offer never blocks. An adoption or a clean pass advances the marker; a
decline is recorded, and a proposal declined repeatedly is itself evidence.

That file also carries `## Pending`, capped at five with each entry expiring once **two distinct task
slugs have closed** since its approval — counting closeouts expires a skill approved at the G1 of a
three-slice task before that same task finishes. An expiring entry arrives here as evidence like any
other: a skill approved and never written across two tasks is either territory that turned out not to
need it, or a queue nobody drains. Ask which, in one question, and record the answer — dropping it
silently loses the second reading.

## Budgets — what this cycle keeps under a ceiling

Both artifacts are start-of-task reads, so both are capped, and the caps are enforced **here**
because this is the only node that edits them deliberately. The numbers live in
[`noetron-setup/references/directory-layout.md`](../noetron-setup/references/directory-layout.md);
the mechanics are the two rules above — **retire before adding** in `learnings.md`, **replace, never
append** in the standard's Baseline. A file over budget is not a formatting problem: it is a file
that has stopped being read, and everything downstream that assumed it was read is now wrong.

## Red flags

- A change with no named, observed failure behind it; "fixing" an anomaly nobody reproduced.
- Touching the standard, a criterion, or the baseline while a correction is open.
- Adopting an opportunity because it is obviously better, or proposing one with no measurement.
- Promoting a learning on its first occurrence — or leaving a second occurrence unpromoted because
  nobody claimed the edit.
- Refreshing a skill "to keep it current"; treating quiet territory as a defect.
- `learnings.md` past its budget with nothing retired; a Baseline row appended for a surface that
  already had one; reading `.noetron/history/` as a directory instead of its index.
- A `## Pending` skill carried past its second closeout without being written or dropped in writing.

## Integration

- `noetron-debug` — confirms a defect is real and repeatable before it reaches here.
- `noetron-verify` — runs the standard; every validation result is a claim carrying its evidence.
- `noetron-spec` — turns the standard's criteria into the Validation section and the task oracles.
- `noetron-plan` — reads the Active rules before approaches exist, which is the only moment a rule
  can still change a design.
- `noetron-explore` — every piece of mining evidence.
- `noetron-setup` — seeds both artifacts at install; from then on they belong to this cycle.
- `noetron-create-skill` — edit, creation, retirement, the trigger test, and the sync.
- `noetron-interview` — one ratification per adoption.
- `noetron-finish` — writes the incident entry at closeout, counts recurrences, triggers promotion,
  and carries the closeout cadence and the marker.
- `noetron-preferences` — a lasting user preference is recorded there, not as a learning here.

---

**This skill is working if:** every entry in `.noetron/learnings.md` names the failure that produced
it and arrived from a closeout, never from a sweep; no root cause sits in the log twice without a
`promoted` rule above it; both artifacts show reads by the skills named in the table, not only
writes; a rule reaches `CLAUDE.md` only after its incident appears at least twice; the git history of
`.noetron/verification-standard.md` shows no edit inside a correction; opportunities arrive as
measured proposals instead of merged diffs; and the same rework pattern stops appearing twice in
`.noetron/history/`; both artifacts stay under their ceilings after a hundred closed deliveries, with
the Baseline holding one row per surface rather than one per approval; and a skills review reads the
history index plus the flagged entries, never the whole directory.
