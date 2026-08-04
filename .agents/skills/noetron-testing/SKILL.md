---
name: noetron-testing
description: Use when writing or changing tests, when reviewing test code, or when a suite is green but the behavior still feels unproven — before trusting any green.
---

# Noetron Testing

The test-quality doctrine: **this skill decides what a test must prove.** A green suite full of
tautologies is the most expensive kind of red.

## Ownership — who does what in the cycle

Four skills touch the red-green cycle, each with one job, and none of them defers in a circle:

| Skill | Its one job |
|---|---|
| `noetron-spec` | **declares** the cycle — every behavior-bearing task carries it as a field |
| `noetron-execute` | **runs** it — the implementer writes the failing test first and captures the output |
| `noetron-verify` | **holds the bar** — the red is proven by runner output, or the task is unverifiable |
| **this skill** | **sets the standard the test must meet** — declared, run, and evidenced still leaves room for a tautology |
| `noetron-debug` | applies this same doctrine to the regression test that pins a bug |

## Travelling in the dispatch

This skill is **element 3 of the [dispatch contract](../noetron-execute/references/dispatch.md)
whenever a task writes or changes test code** — implementer and reviewer alike. A delegated agent
runs under `DELEGATED-AGENT-STOP` and discovers nothing on its own: leave this out of the briefing
and it writes change-detectors and mock assertions, because nothing in its world said otherwise.

## Principle 1 — Name the break

Before writing a test's body, answer: **which production change should make this test fail — and is
that change a bug or a decision?** No answer → no test yet.

- **Derive expectations independently.** Assert against literals and hand-checked fixtures. A mirror
  assertion — the same builder computing both sides — is always true and proves nothing.
  Table-driven cases with literal `want` values are the preferred form.
- **No change-detectors.** `expect(MAX_RETRIES).toBe(5)` fires on redesign and sleeps through bugs.
  Test the behavior: "a failing call is retried 5 times and the 6th never happens."
- **Behavior, not text.** Asserting that a file contains a line proves only that the source is the
  source — run the artifact and assert outputs, effects, exit codes. Documents that instruct agents
  are tested by the consuming agent's behavior; prose for humans gets no test at all.
- **Your code, not the framework.** Test the contract at your boundaries. Asserting that the router
  calls a registered handler tests the framework.

## Principle 2 — Exercise the real thing

- **Mocks never get assertions.** A mock assertion passes when the mock is present and fails when it
  is absent — it says nothing about the component. Assert on outcomes.
- **Mock at the right level.** Learn every side effect of the real thing before substituting it;
  mock the slow or external operation and keep real everything the test depends on.
- **Mirror real data completely.** Partial mocks fail silently when downstream code reads an omitted
  field.
- **Production classes carry only production methods.** Cleanup only tests need lives in test
  utilities, never as a `destroy()` on the production class.
- **Prefer real components** when the mock setup outgrows the test's logic.

## The first test in a project

A repository with no suite arrives here from `noetron-verify`'s second rung: no existing command
reaches the behavior, so the task proposes the test. Three things are different about the first one.

- **It is a dependency decision before it is a test decision.** A runner, its config, and a CI hook
  are new dependencies — the user ratifies them (`noetron-interview`) and the tier moves with them.
  Announcing "I'll add a test" without naming that cost decides a product question for the user.
- **One runner, no plugins, no scaffold suite.** Pin the single behavior this task changes. A
  starter set of smoke tests written to look thorough is the padding the valve below forbids, and it
  lands in a project with nobody to maintain it.
- **It passes the mutation check on its first day.** Every later test in that repository is copied
  from this one; a tautology here is inherited, and a suite founded on a change-detector produces
  greens nobody can spend.

An **existing** command — build, typecheck, lint, the program run on fixed input — outranks a new
test whenever it would reject the change. Adding a framework to prove something the compiler already
proves buys a dependency and no information.

## The mutation check

Before finishing, mentally mutate the production code — wrong constant, flipped branch, missing side
effect, empty return, missing validation for zero/empty/nil/unauthorized/malformed — and ask, per
realistic mutation: **which test fails?** A mutation nothing catches marks the behavior as
unprotected, or the test as tautological. Fix whichever it is.

## Warning signs

- Setup and assertion share the same object or builder.
- The test can only fail by crashing (no meaningful assertion).
- Expectations hidden behind loops, builders, or helpers.
- The test greps the source text.
- Mock setup is more than half the test.
- "Mocking it just to be safe."
- The failure message would not tell you what broke.

## The anti-ritual valve

Ship the tests the behavior needs — **and only those**. Trivial code and human prose get none; a
test written to satisfy process costs maintenance forever and proves nothing. This valve never
waives the cycle for behavior-bearing tasks: it prevents padding, not proof.

## Integration

- `noetron-spec` — the test code inside every task is written to this doctrine.
- `noetron-execute` — implementers apply it; it rides element 3 of their dispatch.
- `noetron-review` — the quality lens judges test code by this skill, with the same briefing.
- `noetron-verify` — a test that cannot fail is a false oracle there; this skill is how it got real.
  Its ladder decides *whether* a project needs its first test; this skill decides what that test is.
- `noetron-interview` — ratifies the runner a first test brings in, before it is added.
- `noetron-debug` — regression tests pass this mutation check against the bug they pin.

---

**This skill is working if:** reverting a fix always turns something red; redesigns stop breaking
tests that assert constants; mock assertions disappear from the codebase; a project's first test
pins the behavior its task changed instead of scaffolding a suite, and its runner was ratified
before it landed; and "the suite is green" starts implying "the behavior is proven".
