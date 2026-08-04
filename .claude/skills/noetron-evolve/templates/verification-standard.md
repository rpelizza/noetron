# Template: .noetron/verification-standard.md

Copy this into `.noetron/verification-standard.md` and fill every `<placeholder>` from the project.
Criteria are pass/fail — if a line cannot be observed running, it does not belong here.
Budget: 150 lines, Baseline at most 25 rows — one per surface, replaced rather than appended.

````markdown
# Verification standard

What "correct" means in this project. Read by `noetron-verify` before any task or spec claim is
judged, by `noetron-spec` when drafting Validation and the task oracles, and by `noetron-finish` at
the closeout proof.

**Read-only during a correction.** A failing output is fixed by changing the output — never by
changing this file. This file changes only in its own ratified change.

## Acceptance criteria — pass/fail

No scores, no 0–5, no "quality". Each line is concrete, objective, and observable.

| # | Criterion (pass/fail) | How it is observed |
|---|---|---|
| 1 | <the exact observable behavior> | <command, screen, or output that shows it> |
| 2 | <…> | <…> |

## Verification procedure

Reading the code is not exercising the artifact. Run it.

1. **Static** — `<lint/typecheck/build command>` → expected: `<exact output>`
2. **Tests** — `<test command>` → expected: `<exact output, incl. coverage floor if any>`
3. **Exercise the artifact as its user does**
   - Web app: open `<url>`, perform `<the user flow>`, observe `<the rendered result>`.
     A green suite is not a rendered screen.
   - CLI / API: run `<command or request>`, observe `<output / status / payload>`.
4. **Manual checks no command covers** — `<check>` → a pass looks like `<…>`.

## Baseline — latest known-good, one row per surface

The current approved state of each surface, not a log of approvals. A regression is an unexplained
difference from this table.

**A new approval of a surface REPLACES its row** — same key, new date, new numbers, new evidence
pointer. The superseded numbers live in the history entry of the delivery that changed them. Max 25
rows; a surface that no longer exists is removed in the same ratified change that retired it.

| Surface (the key) | Approved | Evidence (path, output, screenshot) | Numbers to hold |
|---|---|---|---|
| `<endpoint / screen / command / bundle / suite>` | <YYYY-MM-DD> — `<slug>` | <where the evidence lives> | <p95, bundle size, count — or n/a> |
````
