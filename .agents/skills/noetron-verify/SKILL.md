---
name: noetron-verify
description: Use when about to claim that anything works, passes, is fixed, done, or complete — a step, a build, a fix, a whole task, or a delegated agent's result — before committing, integrating, reporting progress, or telling the user; also when accepting any subagent's report.
---

# Noetron Verify

**No claim of success without fresh evidence — and no evidence from an oracle that cannot say no.**
Every wording implying success is a claim, made only after its oracle ran and its output was read in
this same stretch of work; partial claims that skip verification accumulate into an unverified
whole. This skill is the runtime of the core's oracle doctrine: the oracle proves the action worked,
and this gate makes sure nobody speaks before it does.

## The gate

1. **IDENTIFY** — which oracle proves *this specific claim*? None exists **yet** → establish one
   before executing (the ladder below). None is possible → the claim cannot be made: say what was
   done and what remains unproven.
2. **FALSIFY** — name the output that would make this oracle reject. Cannot name one → it is a false
   oracle; repair it before running it.
3. **RUN** — complete and fresh. An earlier run does not count: the tree changed since.
4. **READ** — the whole output: exit code, failure counts, warnings. Skimming is not reading.
5. **COMPARE** — does the output actually support the claim? If not, the output *is* the report.
6. **CLAIM** — only now, quoting the evidence. Skipping a step is guessing with confidence.

## False oracles

An oracle that cannot reject is worse than no oracle: it manufactures confidence and closes the loop
on a broken system. The test is one question — **"what concrete output would make this oracle
fail?"** No answer, no oracle.

| False oracle | Why it cannot reject | Repair |
|---|---|---|
| `grep "ECONNREFUSED" out.log` | the command fails other ways too; each reads as pass | assert exit status first, then the specific message |
| exit code swallowed (`cmd \|\| true`, piped into a formatter, `set +e`) | the shell always returns 0 | assert the real status (`pipefail`, `PIPESTATUS`) |
| a test whose only failure mode is a crash | nothing meaningful is asserted | assert behavior against literal expected values |
| both sides computed by the same builder | true by construction | hand-checked literals (`noetron-testing`) |
| "the file contains this line" | proves the source is the source | run the artifact, assert its output or effect — unless the file *is* the artifact (below) |

Five oracles in one field execution certified failing systems for exactly these reasons. A false
oracle is a **Critical finding**, and repairing it re-opens every claim it "proved".

## The project has none — establish one

"A step without an oracle is invalid" ends the **step**, not the task. A legacy repository with no
suite, no lint, and no CI has no oracle *yet*, and reading that as a permanent verdict makes every
step invalid and the harness useless exactly where it is needed most. Walk down these rungs and stop
at the first that holds. **Never skip a rung to reach a softer one** — that is how a project with a
compiler ends up certified by a human squinting at a screen.

**1 — The command that already exists.** A repository with no tests usually still compiles, boots,
or prints. `.noetron/profile.md` names them per package: `build`, `typecheck`, `lint`, `run
locally`. Each of these can reject on its own: a build that fails, a type error, a linter exit code,
the program run on a fixed input with its output compared to a hand-checked literal, a
`--check`-style command that regenerates an artifact and compares it byte-for-byte, `git diff
--exit-code` after a generator. No test framework, no new dependency, and the loop still closes.
Pick the narrowest one that would reject **this** change — `build` passing says nothing about a
behavior `build` never runs.

**2 — The first test, proposed with its cost.** No existing command reaches the behavior → propose
writing the test **as part of this task**, and state the price in the same breath: a test runner,
its config, and a CI hook are a **new dependency**, which lifts the tier by `noetron-router`'s
classifier and re-opens G0. The user ratifies the dependency (`noetron-interview`); the harness does
not adopt one to make its own life easier. Shape and floor: `noetron-testing`.

**3 — The declared attestation oracle.** Neither rung reachable → declare, **before acting**, what a
human will observe: the exact steps, the exact observable result, and what a *fail* looks like.
It goes into `.noetron/verification-standard.md` through `noetron-evolve`, ratified, **before the
work starts** — the only moment writing to that file is not a correction softening its own standard.

**Declared attestation is a legitimate oracle, not an excuse.** What makes it one is never the
human: it is that the criterion was fixed **before** the action, is **observable** (someone can look
and say no), and is **written where the next claim will be judged against it**. What makes it an
excuse is any of — written after the output existed, phrased so nothing could fail ("looks right",
"works as expected", "renders correctly"), or chosen while rung 1 was sitting there. Its cost is
real: attestation cannot close a loop, so every step resting on it pauses. That is the argument for
climbing, never an argument for dressing it up as a machine oracle.

## When the artifact is not executable

A documentation, content, or configuration repository has no command in the usual sense — but
"no suite" is not "nothing is checkable", and a project where every step is attestation pauses at
every step, which is how a proportional harness becomes ceremony. Split the claim, and never let the
second half swallow the first:

| Property | Oracle | Examples |
|---|---|---|
| **Mechanical** — true or false by inspecting the artifact | machine; closes the loop | links resolve; the static site builds (exit 0); markdown or prose lint; required sections and front-matter fields present; a generated file still matches its source (`--check`); no unresolved placeholder; the schema validates |
| **Judgement** — whether the content is *right* | declared attestation | is the explanation correct, does the page answer the question it exists for |

This is the one place `"the file contains this line"` stops being a false oracle: in a content
repository the file **is** the artifact, so a structural assertion tests the deliverable instead of
using source text as a proxy for behavior. It still proves only structure.

**Mechanical checks run per step; the judgement row is declared once and presented at the end.**
Which end depends on the cadence in `.noetron/state.md`: under `per-slice` it is the **slice's** end
— its `### Slice validation` and the G2 that follows — so the human looks once per thing they
actually receive; under `single-delivery`, once per task or once per spec. Batching the human's
single look at the natural review point is what keeps the pause proportional to the work instead of
proportional to the step count. A document that
*instructs an agent* has a third option that outranks attestation: **the consuming agent's behavior
is the test** (`noetron-testing`) — run the trigger, assert what the agent did.

## The red needs an oracle too

For a behavior-bearing task, "the test failed before the fix" is the implementer's self-report, not
evidence. **The evidence of red is the runner's own output for the failing test, attached to the
report, showing it failed for the expected reason** — the asserted behavior, not an import error, a
typo, or a missing fixture. Without it the task is **not verifiable**: it does not reach `DONE`, and
the cycle is re-run, never re-asserted. A test that could not fail once entered the suite and
survived review; the commit that removed it was named "replace a test that could not fail".

Tasks declaring `cycle: none` (config, formatting, docs, pure moves) are exempt by declaration.
Reclassifying behavior as cosmetic to escape the red is a violation, not an exemption.

### Present, or reproduced

Pasted output is still the implementer's own text: **presence proves it was written, not that it is
reproducible.** Reproducing it costs one command — remove the fix, run **that one named test**, see
it fail on the expected assertion, restore — which is the red-green proof already in the claim table
below, aimed at a task instead of a bug. So the question is when it is worth paying, not whether it
can be done.

| The red is | When |
|---|---|
| **produced in view** — no separate step | `trivial` / `small` inline: the coordinator ran the red itself, this session |
| **presence is enough** — the runner output in the report | a delegated behavior task at `standard` / `large` over ordinary application code, with the assertion text visible in the output |
| **reproduced by the coordinator** | the `bug` chain, always — the pin *is* the deliverable; any diff touching auth, untrusted input, money, or data integrity; any criterion named in `.noetron/verification-standard.md`; and **one spot-check per deliverable slice**, chosen by risk, before that slice's review — once per spec under `single-delivery` |
| **reproduced, or the task is not done** | the output smells: no assertion text, a collection or import error, a test name that is not this task's, or a paste no runner would emit. Fails to reproduce → `noetron-debug`, never a re-ask |

Reproduction is one named test, never the suite, and the rows above are the whole list. Reproducing
every red turns a proof into a ritual and buys nothing the report already showed; reproducing none
of them leaves the only unreproduced link in the chain exactly where the cost of a false green is
highest. The spot-check counts per slice because the slice is what reaches the user: one spot-check
spread over a four-slice spec integrates three deliveries on self-report.

## The project's standard — read before judging

**`.noetron/verification-standard.md` is what *correct* means in this repository**, and a `task` or
`spec` claim is judged against it, not against a general sense of done. Read it before the COMPARE
step of any such claim: its **acceptance criteria** are the pass/fail list to walk one by one, its
**procedure** names the commands and how the artifact is exercised (reading the code is not
exercising it; a green suite is not a rendered screen), and its **baseline** holds the approved
numbers an unexplained difference is measured against. A claim judged without it is a claim judged
against memory.

Missing or empty → `noetron-evolve` creates it from its template; a cycle with no standard has
nothing to measure against, so this is a stop, not a note. A project whose criteria are attestations
still has a standard — that is where rung 3 wrote them, before the work, and where every later claim
finds them already fixed.

**The standard is READ-ONLY for the whole duration of any correction.** A failing output is fixed by
changing the **output**. Editing a criterion, the procedure, or the baseline so a failing output
passes is the `CLAUDE.md` guardrail violation under a friendlier name — and it destroys the only
record of what was already approved. It changes in a deliberate, ratified change of its own.

## Claim scope

The claim's scope sets the evidence's scope — never a bigger claim on smaller evidence:

- a **step** claim runs that step's own oracle (the focused test, the single command);
- a **task** claim runs that task's own oracle — and, at the last task of a delivery unit, that
  unit's `### Slice validation`; the spec's full `## Validation` belongs to the **spec** claim, runs
  once at the last unit, and is red by construction anywhere earlier, because it asserts criteria
  the plan mapped to slices that do not exist yet;
- a **spec** claim checks every acceptance criterion one by one — a green suite is not the list;
- an **integration** claim runs the suite on the merged result: a green branch proves the branch.

| Claim | Requires | Never sufficient |
|---|---|---|
| "Tests pass" | this run's output: 0 failures | an earlier run; "should pass" |
| "Build works" | build exit code 0, this run | linter passing; logs looking fine |
| "Bug fixed" | the original symptom re-executed: gone | code changed; assumed fixed |
| "Regression test in place" | red-green: fix reverted → red; restored → green | the test passing once |
| "Step done" | that step's oracle passing, with its output | the code "looking right" |
| "Agent finished" | the diff and artifacts inspected | the report saying success |
| "Requirements met" | acceptance criteria checked one by one | tests passing |

## Delegated results

A report is a set of claims; **the diff is the truth**. Inspect it before accepting any `DONE`, and
confirm the red evidence is present for every behavior-bearing task — reproduced, where the table
above says presence is not enough. When the oracle is attestation
— a human judging evidence — presenting it and pausing **is** the correct move, not a claim.

## Tripwires

"should work", "probably passes", "looks good", "seems fine", "Done!", "Fixed!", "Perfect!" — and
every synonym: satisfaction expressed before evidence is still a claim. Catching yourself writing
one before the oracle ran means stop, run it, or rephrase to the real status.

| Excuse | Reality |
|---|---|
| "It worked earlier this session" | The tree changed. Run it fresh. |
| "I'm confident" | Confidence is not evidence. |
| "The linter passed" | The linter is not the compiler, nor the tests. |
| "The agent reported success" | Reports are claims. Inspect the diff. |
| "It's the last step, I'm wrapping up" | The last step is where unverified claims get committed. |
| "That criterion in the standard is unrealistic" | Then open a ratified change to the standard. Never inside the correction it would rescue. |
| "The standard is out of date, I'll judge by the tests" | The tests are one procedure step. Walk the criteria, or say the claim is unproven. |

When an oracle fails, the real status with the real output **is** the correct report — never
softened ("mostly passing", "just one flaky test"). A failure reported honestly is this skill
working; a success claimed without evidence is the only violation.

## Integration

- `noetron-router` — a standing guard: this skill fires in every chain at every claim, and no tier
  removes it.
- `noetron-evolve` — owns `.noetron/verification-standard.md`; a criterion that must change goes
  there, in its own ratified change, never during a correction.
- `noetron-spec` — writes the oracles and the embedded cycle whose red this skill holds to evidence.
- `noetron-setup` — `.noetron/profile.md`, the per-package command list rung 1 searches first.
- `noetron-testing` — the shape of rung 2's first test, and the consuming-agent trigger test that
  outranks attestation for agent-facing documents.
- `noetron-interview` — ratifies the dependency rung 2 costs and the criterion rung 3 declares.
- `noetron-execute` — every step, every report, and the final Validation land here.
- `noetron-review` — findings are claims too; a false oracle in a diff is a Critical finding.
- `noetron-debug` — a red that cannot be produced, and every defect a repaired oracle exposes.
- `noetron-finish` — the fresh proof at its entry and the merged-result proof before cleanup; in the
  `trivial` chain this skill's green **is** the whole proof, and the chain hands off there directly.

---

**This skill is working if:** no success claim precedes its evidence; every behavior-bearing task
carries the runner output of its failing test; no `task` or `spec` claim is judged without
`.noetron/verification-standard.md` open and its criteria walked one by one; oracles that cannot
reject are caught and repaired before they certify anything; agent reports are cross-checked against
diffs before acceptance; a repository arriving with no suite, no lint, and no CI still executes its
first task under a named oracle from the ladder instead of stalling or waiving the gate; every
attestation criterion in the project's standard is dated before the work it judges; a non-code
repository pauses once per delivery rather than once per step; and the reds the table marks for
reproduction are reproduced while the others are not — one spot-check per slice, not one per spec.
