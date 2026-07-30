# Dispatch Contract

The file-handoff protocol between coordinator and delegated agents. Everything pasted into a dispatch prompt — and everything an agent prints back — stays resident in the coordinator's context for the rest of the session. Artifacts travel as files; prompts carry pointers.

## The brief

Extract task N's text **verbatim** from the spec (code blocks, exact values, `verify:` lines included) to `noetron/work/<slug>/task-N-brief.md`. Exact values appear only in the brief — never retyped into the prompt.

## The dispatch prompt — exactly five elements

1. One line of project context: where this task fits.
2. The brief's path, presented as: "read this first — it is your requirements, with the exact values to use verbatim."
3. Interfaces and decisions from earlier tasks that the brief cannot know (the `Consumes` reality as built).
4. Your resolution of any ambiguity you noticed in the brief.
5. The report path (`work/<slug>/task-N-report.md`) and the report contract below.

Prohibited in a dispatch: the whole spec or plan; accumulated session history; "state after Tasks 1–3" narrations; instructions that pre-judge review outcomes.

## The report contract

Full detail goes in the report **file**: what was done, the command and output of every `verify:` run, deviations from the brief, concerns. Back to the coordinator, **at most 15 lines**: status, commits, one-line test summary, concerns, report path.

| Status | Meaning |
|---|---|
| `DONE` | every `verify:` passed; evidence is in the report |
| `DONE_WITH_CONCERNS` | done, with named concerns for the reviewer |
| `NEEDS_CONTEXT` | a material gap: named in one sentence, with 2–3 real options and a recommendation — never self-resolved (this is `noetron-interview` gap-mode material for the coordinator) |
| `BLOCKED` | cannot proceed; what was tried and why it failed |

## The review package

Write `work/<slug>/review-N-<base7>..<head7>.diff`: the commit list, `--stat`, and `git diff -U10` for the task's range. The reviewer's dispatch carries **three paths** — brief, report, review package — plus the spec's **Global constraints** verbatim (the reviewer's attention lens). The reviewer treats the report as unverified claims, reads the diff once, stays read-only, and returns severities with `file:line`. A stated rationale in the report never reduces a finding's severity.

## Fix and re-review dispatches

- **Fix (rounds 1–3):** resume the original implementer; the findings verbatim, nothing else — its context is intact.
- **Fix (rounds 4–5):** fresh implementer; frame: "a previous implementer tried this task 3 times; it is yours now — read the report for what was tried." Brief + report + findings paths.
- **Re-review (after every fix):** scoped to the findings list + the fix's diff (a fresh review package covering only the fix range). Verdict per finding: `ADDRESSED / NOT ADDRESSED`, plus new breakage **in the fix diff only**. Out-of-scope observations return in a separate section and go to the ledger as deferred — they never extend the loop.
