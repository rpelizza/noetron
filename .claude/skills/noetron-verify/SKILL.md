---
name: noetron-verify
description: Use when about to claim that anything works, passes, is fixed, done, or complete — a step, a build, a fix, a whole task, or a delegated agent's result — before committing, integrating, reporting progress, or telling the user; also when accepting any subagent's report.
---

# Noetron Verify

**No claim of success without fresh evidence.** Every wording that implies success — of a step, a build, a fix, a task, an agent's work — is a claim, and a claim is only made after its oracle ran and its output was read, in this same stretch of work. This applies to every claim, not just task completion: partial claims that skip verification accumulate into an unverified whole.

This skill is the runtime of the core's oracle doctrine: the oracle proves the action worked; this gate makes sure nobody speaks before the oracle does.

## The gate

Before any claim of success:

1. **IDENTIFY** — which oracle proves *this specific claim*? (If none exists, the claim cannot be made — say what was done and what remains unproven.)
2. **RUN** — execute the oracle, complete and fresh. A run from earlier does not count: the tree has changed since.
3. **READ** — the full output: exit code, failure counts, warnings. Skimming is not reading.
4. **COMPARE** — does the output actually support the claim? If not, the real status is the report.
5. **CLAIM** — only now, quoting the evidence.

Skipping any step is not verifying — it is guessing with confidence.

## Claim table

| Claim | Requires | Never sufficient |
|---|---|---|
| "Tests pass" | test command output, this run: 0 failures | an earlier run; "should pass" |
| "Build works" | build exit code 0, this run | linter passing; logs looking fine |
| "Bug fixed" | the original symptom re-executed: gone | code changed; assumed fixed |
| "Regression test in place" | red-green verified: fix reverted → test fails; restored → passes | test passing once |
| "Step done" | that step's oracle (from the spec) passing | the code "looking right" |
| "Agent finished" | the diff/artifact inspected | the agent's report saying success |
| "Requirements met" | acceptance criteria checked one by one | tests passing |

## Proportionality

The claim's scope sets the evidence's scope — never a bigger claim on smaller evidence:

- A **step** claim runs the step's oracle (the focused test, the single command).
- A **task** claim runs the spec's full Validation section.
- An **integration** claim runs the suite on the merged result — a green branch proves the branch, not the merge.

## Delegated results

An agent's report is a set of claims, not evidence. The diff and the artifacts are the truth: inspect them before accepting any `DONE`. When the oracle is attestation (a human judging evidence), presenting the evidence and pausing **is** the correct move — presenting evidence is not claiming success.

## Language tripwires

These phrases are claims. Catching yourself about to write one before the oracle ran means: stop, run it, or rephrase to the real status.

- "should work", "probably passes", "looks good", "seems fine"
- "Done!", "Fixed!", "Perfect!", "Great!" — satisfaction expressed before evidence is a claim too
- any paraphrase or synonym implying success — different words do not exempt the rule

## Rationalizations

| Excuse | Reality |
|---|---|
| "It worked earlier this session" | The tree changed since. Run it fresh. |
| "I'm confident" | Confidence is not evidence. |
| "The linter passed" | The linter is not the compiler, nor the tests. |
| "The agent reported success" | Reports are claims. Inspect the diff. |
| "It's the last step, I'm wrapping up" | The last step is where unverified claims get committed. |
| "The change was trivial" | Trivial changes break builds every day. The oracle is cheap; run it. |

## Failure honesty

When the oracle fails, the real status with the real output **is** the correct report — never soften it ("mostly passing", "just one flaky test"), never claim the part the evidence does not show. A failure reported honestly is this skill working; a success claimed without evidence is the only violation.

## Integration

- `noetron-core` — the oracle doctrine this skill enforces at speech time.
- `noetron-explore` — gathers evidence when the oracle is a fact to establish.
- `noetron-plan` — claims about current system behavior made during planning land here.
- `noetron-spec` — the oracles this skill runs at claim time are born there.
- `noetron-execute` — every step, report, and the final Validation end here.
- `noetron-review` — findings are claims and need evidence too.
- Planned edge, activated when the skill is born: `noetron-finish` (the last gate before integration).

---

**This skill is working if:** no success claim in a transcript precedes its evidence; agent reports are always cross-checked against diffs before acceptance; and the history shows fewer "fix the fix" commits correcting the immediately previous one.
