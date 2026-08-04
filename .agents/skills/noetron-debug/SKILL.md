---
name: noetron-debug
description: Use when encountering any bug, test failure, incident, or unexpected behavior — including "it doesn't work", "strange behavior", a test breaking mid-task, or damage happening in production — before proposing any fix.
---

# Noetron Debug

No fix without the failure reproduced. **The red command is the entry ticket**: the exact invocation,
executed, with its failing output pasted. Cannot show the failure → you are guessing, not debugging.

## Triage: four classes

Classify first; rigor is proportional to the class, and the class is declared, not assumed.

| Class | Signal | Process |
|---|---|---|
| **Direct cause** | the error names file and line, and the fix is evident | surgical fix + red-green regression, no further ceremony. If the "obvious" fix fails once, the bug leaves this class immediately |
| **Deterministic, cause unknown** | reproducible, but *why* is open | the full investigation loop below |
| **Flaky / distributed** | non-deterministic, timing- or environment-dependent | statistical reproduction: measure the failure **rate** (run it N times — a rate is a valid red command), instrument, replace arbitrary timeouts with condition-based waiting |
| **Incident — active damage** | users or data being harmed right now | **CONTAIN first, reversibly** — flag off, rollback, block traffic. It changes production, so G0 does not cover it and the agent never takes it on its own authority: put it to the user as its own one-line question, **immediately**, ahead of any gate (`noetron-router` § 3, the incident class), and record what was done. Containment is not the fix: investigate on the contained system |

## The red gate

Before any theory, hypothesis, or fix: a **red command executed with output pasted**. Then **tighten
the loop** — the smallest, fastest command that still fails (single test over suite, local over CI);
the tightened repro is itself a deliverable.

## When the red cannot be produced

The gate is absolute; **a repro you cannot run is a material gap, never a dead end.** A missing
server, credential, production dataset, device, or account is not a fact `noetron-explore` can settle
— it goes to `noetron-interview`, one sentence, 2–3 real options. The human supplies it, or decides:

- **narrow the repro** — a smaller reachable case that exhibits the same failure mode;
- **instrument and wait** — ratified logging that captures the next occurrence *with* evidence;
- **proportionate handling** (retry, timeout, clear error), residual risk named and accepted.

Never guess a fix because the repro was inconvenient, and never stall silently in front of a shut
gate — an unreachable environment nobody was asked about is exactly the deadlock this breaks.

## The investigation loop

For the deterministic class (flaky uses it with statistical oracles):

1. **READ** the error completely — it often contains the answer.
2. **REPRODUCE** (red command) and tighten.
3. **EVIDENCE** — via `noetron-explore`: recent changes (`git log`, diff), and working examples in
   the same codebase compared **completely** ("this difference can't matter" is not allowed — list
   every one). In multi-component systems, **instrument the boundaries** first: learn *where* it
   breaks before hypothesizing about *what*.
4. **HYPOTHESIZE** — exactly **one falsifiable hypothesis at a time, written down**: "I think X is
   the root cause because Y; if true, Z will show it." Test with the smallest change, one variable.
   Refuted → write a new one. Don't know → say "I don't understand X" and instrument; never pretend.
5. **FIX** — the root cause, never the symptom. Regression test first (red), then the fix (green),
   then the red-green proof per `noetron-verify`: fix reverted → test fails; restored → passes.
   **One fix** — no improvements "while you're here". Then **defense in depth**: name the other
   layers that should also have caught this and propose them; the user decides the scope.
6. **The 3-fix rule** — count them. A third failed fix is not a signal to try a fourth: **STOP**.
   Each fix revealing new coupling elsewhere means the architecture is suspect — take it to the user
   (`noetron-interview`): *not a failed hypothesis, the wrong architecture.* Re-enter as `standard`.

## Which cap governs

While this skill is the active node, **its cap is the one that counts: three fixes.** A failing
oracle, or one repaired because it could not reject, routes here from `noetron-execute` — and the
review fix loop's cap of 5 does not extend this one. Two caps in one loop means neither is a cap.

## The chain does not end at the fix

`debug(triage) → branch → RED regression → fix → verify → review(scoped) → finish`. The fix is the
middle: `noetron-verify` proves the red-green, a scoped review reads the diff, `noetron-finish` gives
the work a destination. A bug left in a dirty tree is an open task wearing a closed task's report.

## Human redirects are telemetry

The user's own phrases are process signals, not conversation. "That's not what's happening" → you
assumed without verifying. "Stop guessing" → fixes proposed without red evidence. "Are we stuck?" →
the approach is failing; back to triage. Each counts as a red flag fired.

## "No root cause found"

Legitimate only after the investigation is documented — 95% of the time it means the investigation
is incomplete. Genuinely environmental or external: record what was ruled out, ratify proportionate
handling via `noetron-interview`, add monitoring so the next occurrence carries evidence. Any fix
requiring a product decision — behavior, contract, accepted risk — stops at gap mode first.

## Red flags

- Proposing fixes in the first message; a theory with no red command behind it.
- Treating an unreproducible bug as a dead end instead of taking the gap to the human.
- Stacking a second fix on an untested first; a fourth fix attempt; "flaky" without a measured rate.
- Fixing the symptom — a `catch` that swallows the error — or "improving" adjacent code mid-fix.
- Closing without the red-green proof "because it was trivial"; stopping short of verify and finish.
- Investigating an incident before containing it — or containing it without the explicit approval a
  production change requires, which is the same guardrail read from the other side.

## Integration

- `noetron-verify` — the red-green proof, and every claim about the bug's state.
- `noetron-interview` — an unreproducible failure, the 3-fix escalation, any product decision.
- `noetron-explore` — evidence gathering, instrumentation reading, working-example comparison.
- `noetron-execute` — a failing oracle routes here, and this skill's cap governs while it runs.
- `noetron-review` — the scoped review of the fix diff; a finding hiding a deeper defect returns.
- `noetron-testing` — regression tests must pass its mutation check against the bug they pin;
  `noetron-branch` and `noetron-finish` close the chain: isolation first, destination last.

---

**This skill is working if:** no fix appears before its red command; an unreproducible bug produces a
question to the human rather than a guess; every closed bug leaves a regression test that fails when
the fix is reverted; and third failed fixes become architecture conversations, never fourth attempts.
