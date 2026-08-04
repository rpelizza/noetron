# Template: .noetron/learnings.md

Copy this into `.noetron/learnings.md`. Read by `noetron-plan` before it proposes approaches;
written by `noetron-finish` at closeout, and only when the task produced a confirmed defect.
Budget ~200 lines — retire an entry before adding one.

````markdown
# Learnings

Execution memory. **Active rules** are applied every time; the **incident log** is the evidence
behind them. A rule is promoted only after its incident recurred 2–3 times.

## Active rules

- **<rule, one imperative>** — scope: `<path / stack / surface>` — from: `<incident date-slug>`

## Incident log

Newest first. One entry per confirmed defect. An anomaly that did not reproduce is still logged —
with `Rule: n/a — one-off` — and is not fixed.

### <YYYY-MM-DD> — <slug> — `candidate`

- **Trigger:** <the observable event: failing command, wrong output, review finding>
- **Root cause:** <what was actually wrong — not the symptom>
- **Smallest durable fix:** <what changed, `file:line`>
- **Rule:** <one imperative for next time> | `n/a — one-off`
- **Scope:** <where the rule applies>
- **Revert:** <one line: how to undo the fix>
- **Status:** `candidate` → `promoted` (recurred 2–3×) → `retired` (failure mode can no longer happen)
````
