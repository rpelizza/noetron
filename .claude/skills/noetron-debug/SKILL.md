---
name: noetron-debug
description: Use when encountering any bug, test failure, incident, or unexpected behavior — including "it doesn't work", "strange behavior", a test breaking mid-task, or damage happening in production — before proposing any fix.
---

# Noetron Debug

No fix without the failure reproduced in front of you. **The red command is the entry ticket**: the exact invocation, executed, with its failing output pasted. If you cannot show the failure, you are not debugging — you are guessing.

## Triage: four classes

Classify first; rigor is proportional to the class, and the class is declared, not assumed.

| Class | Signal | Process |
|---|---|---|
| **Direct cause** | the error names the file and line, and the fix is evident | surgical fix + red-green regression — no further ceremony. If the "obvious" fix fails once, the bug leaves this class immediately. |
| **Deterministic, cause unknown** | reproducible, but *why* is open | the full investigation loop below |
| **Flaky / distributed** | non-deterministic, timing- or environment-dependent | statistical reproduction: measure the failure **rate** (run it N times — a rate is a valid red command), instrument, replace arbitrary timeouts with condition-based waiting |
| **Incident — active damage** | users or data being harmed right now | **CONTAIN first, reversibly** — flag off, rollback, block traffic; reversible moves only. Containment is not the fix: investigate on the contained system. |

## The red gate

Before any theory, hypothesis, or fix: a **red command executed with output pasted**. Then **tighten the loop** — shrink the repro to the smallest, fastest command that still fails (single test over suite, local over CI). The tightened repro is itself a deliverable of the investigation.

## The investigation loop

For the deterministic class (flaky uses it with statistical oracles):

1. **READ** the error completely — it often contains the answer.
2. **REPRODUCE** (red command) and tighten.
3. **EVIDENCE** — via `noetron-explore`: recent changes (`git log`, diff), working examples in the same codebase compared **completely** ("this difference can't matter" is not allowed — list every one). In multi-component systems, **instrument the boundaries** first: log what enters and leaves each component, run once, learn *where* it breaks before hypothesizing about *what*.
4. **HYPOTHESIZE** — exactly **one falsifiable hypothesis at a time, written down**: "I think X is the root cause because Y; if true, Z will show it." Test with the smallest change, one variable. Refuted → write a new hypothesis; never stack a second fix on an untested first. Don't know → say "I don't understand X" and instrument more; never pretend.
5. **FIX** — the root cause, never the symptom. Regression test first (red), then the fix (green), then the red-green proof per `noetron-verify`: fix reverted → test fails; restored → passes. **One fix** — no improvements "while you're here". Then **defense in depth**: name the other layers that should also have caught this (input validation, business rule, environment guard) and propose them — the user decides the scope.
6. **The 3-fix rule** — count your attempted fixes. A third failed fix is not a signal to try a fourth: **STOP** — each fix revealing new coupling somewhere else means the architecture is suspect. Take it to the user (`noetron-interview`): *this is not a failed hypothesis; this is the wrong architecture.*

## Human redirects are telemetry

The user's own phrases are process signals, not conversation. "That's not what's happening" → you assumed without verifying. "Stop guessing" → you proposed fixes without red evidence. "Are we stuck?" → the approach is failing; go back to triage. Each one counts as a red flag fired.

## "No root cause found"

Legitimate only after the investigation is documented — and 95% of the time it means the investigation is incomplete. When genuinely environmental or external: record what was ruled out, implement proportionate handling (retry, timeout, clear error) as a decision ratified via `noetron-interview`, and add monitoring so the next occurrence carries evidence.

Any fix that requires a product decision — behavior change, contract change, accepted risk — stops at `noetron-interview` gap mode first. A bug fix is not the place to decide product.

## Red flags

- Proposing fixes in the first message; "it's probably X, let me fix it".
- A theory without a red command behind it.
- Stacking a second fix on an untested first.
- Fixing the symptom — a `catch` that swallows the error is the canonical case.
- "Improving" adjacent code mid-fix.
- Closing without the red-green regression proof, "because it was trivial".
- A fourth fix attempt.
- Declaring "flaky" without a measured rate.
- Investigating an incident before containing it.

## Integration

- `noetron-verify` — the red-green proof and every claim about the bug's state.
- `noetron-explore` — evidence gathering, instrumentation reading, working-example comparison.
- `noetron-interview` — the 3-fix architecture escalation and every product decision a fix touches.
- `noetron-execute` — a failing oracle whose cause is not evident routes here before more attempts.
- `noetron-review` — a review finding that reveals a deeper defect is investigated here.
- `noetron-plan` — an architecture questioned by the 3-fix rule re-enters planning.
- `noetron-testing` — regression tests must pass its mutation check against the bug they pin.
- `noetron-branch` — the direct-class fix still gets its branch before the first write.

---

**This skill is working if:** no fix appears before its red command; every closed bug leaves a regression test that fails when the fix is reverted; the same bug does not return; and third failed fixes turn into architecture conversations, never fourth attempts.
