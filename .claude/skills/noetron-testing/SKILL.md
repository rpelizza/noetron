---
name: noetron-testing
description: Use when writing or changing tests, when reviewing test code, or when a suite is green but the behavior still feels unproven — before trusting any green.
---

# Noetron Testing

The test-quality doctrine. The TDD cycle (`noetron-spec`'s embedded cycle, `noetron-debug`'s regression proof) guarantees tests **exist** — this skill guarantees they **prove something**. A green suite full of tautologies is the most expensive kind of red.

## Principle 1 — Name the break

Before writing a test's body, answer: **which production change should make this test fail — and is that change a bug or a decision?** No answer → no test yet.

- **Derive expectations independently.** Assert against literals and hand-checked fixtures. A mirror assertion — where the same builder computes both sides — is always true and proves nothing. Table-driven cases with literal `want` values are the preferred form.
- **No change-detectors.** `expect(MAX_RETRIES).toBe(5)` fires on redesign and sleeps through bugs. Test the behavior: "a failing call is retried 5 times and the 6th never happens."
- **Behavior, not text.** Asserting that a file contains a line proves only that the source is the source — run the artifact and assert outputs, effects, exit codes. Documents that instruct agents are tested by the consuming agent's behavior; prose for humans gets no test at all.
- **Your code, not the framework.** Test the contract at your boundaries. Asserting that the router calls a registered handler tests the framework.

## Principle 2 — Exercise the real thing

- **Mocks never get assertions.** A mock assertion passes when the mock is present and fails when it is absent — it says nothing about the component. Assert on outcomes.
- **Mock at the right level.** Learn every side effect of the real thing before substituting it; mock the slow or external operation and keep real everything the test depends on.
- **Mirror real data completely.** Partial mocks fail silently when downstream code reads an omitted field.
- **Production classes carry only production methods.** Cleanup only tests need lives in test utilities, never as a `destroy()` on the production class.
- **Prefer real components** when the mock setup outgrows the test's logic.

## The mutation check

Before finishing, mentally mutate the production code — wrong constant, flipped branch, missing side effect, empty return, missing validation for zero/empty/nil/unauthorized/malformed — and ask, per realistic mutation: **which test fails?** A mutation nothing catches marks the behavior as unprotected, or the test as tautological. Fix whichever it is.

## Warning signs

- Setup and assertion share the same object or builder.
- The test can only fail by crashing (no meaningful assertion).
- Expectations hidden behind loops, builders, or helpers.
- The test greps the source text.
- Mock setup is more than half the test.
- "Mocking it just to be safe."
- The failure message would not tell you what broke.

## The anti-ritual valve

Ship the tests the behavior needs — **and only those**. Trivial code and human prose get none; a test written to satisfy process costs maintenance forever and proves nothing. This valve never waives the embedded cycle for behavior-bearing tasks — it prevents padding, not proof.

## Integration

- `noetron-spec` — the test code inside every task is written to this doctrine.
- `noetron-execute` — implementers apply it; reviewers hold it.
- `noetron-review` — the quality lens judges tests by this skill ("tests verify real behavior, not mocks" is operationalized here).
- `noetron-debug` — regression tests must pass the mutation check against the bug they pin.
- `noetron-verify` — red-green proof mechanics live there; this skill makes the red mean something.

---

**This skill is working if:** reverting a fix always turns something red; redesigns stop breaking tests that assert constants; mock assertions disappear from the codebase; and "the suite is green" starts implying "the behavior is proven".
