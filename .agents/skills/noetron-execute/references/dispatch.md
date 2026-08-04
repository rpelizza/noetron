# Dispatch Contract

The file-handoff protocol between coordinator and delegated agents. Everything pasted into a
dispatch prompt — and everything an agent prints back — stays resident in the coordinator's context
for the rest of the session. Artifacts travel as files; prompts carry pointers.

## The brief

Requirements reach the implementer as a **file**, never as prose in the prompt. Which file depends
on whether the chain has a spec — the protocol below does not change either way.

**With a spec (`standard`, `large`).** Extract task N's text **verbatim** from the spec (contract,
exact values, oracle) to `.noetron/work/<slug>/task-N-brief.md`. Exact values appear only in the
brief — never retyped into the prompt.

`N` is the spec's own task number, which **runs continuously across slices** (`noetron-spec` §
Slices): slice 2 opens at task 5, so its first brief is `task-5-brief.md`. That is what keeps these
filenames collision-free without a slice ordinal in them — numbering that restarted per slice would
have slice 2 overwrite slice 1's briefs, reports, and review packages inside a `work/<slug>/` that is
deliberately kept across slices.

**Without a spec (`trivial`, `small`, `bug`).** The request *is* the contract, so the coordinator
writes it down first — `.noetron/work/<slug>/brief.md`, built at step 1 of the short cycle
(`noetron-execute`):

| Field | Content |
|---|---|
| Request | the user's own words, **quoted verbatim** — a paraphrase is the coordinator's opinion of the task, and the implementer cannot tell the two apart |
| Ratified line | the G0 line from `.noetron/state.md`: the tier — with its size, in the `bug` chain — scope, isolation, commit strategy |
| Acceptance | one sentence: what is true when this is done |
| Oracle | the exact command, and the output that proves it passed |
| Files | the paths in play from `noetron-explore` — or `unknown: locate them` when that is the honest answer |
| Domain skills | the `<prefix>-*` names from `.noetron/domain-skills.md` covering this territory; `none` is an answer, blank is not |
| Red (`bug` only) | the triage class plus the red command with its **pasted failing output**, from `noetron-debug` |

The file exists even when the mode is `inline` and nobody is dispatched: it is what the reviewer
reads the diff against, and what a resumed session finds after a compaction.

Without it there is nothing for element 2 to point at, so the task travels as prose in the prompt —
which is how the requirements land back in the coordinator's context one paraphrase at a time, and
how the harness floor stops travelling at all. The prompt's shape is unchanged: element 2 names
`brief.md` instead of `task-N-brief.md`, and element 4 reads `none — single change`.

## The dispatch prompt — eight elements

1. One line of project context: where this task fits.
2. The brief's path, presented as: "read this first — it is your requirements, with the exact
   values to use verbatim."
3. **The harness floor.** The delegated agent runs under `DELEGATED-AGENT-STOP` and **will never
   discover any of this on its own** — if it is not here, it does not reach the code:
   - `noetron-preferences` — always, in every dispatch, without exception. This is the floor for
     everything the project keeps: comment discipline, no dead code, naming, commit text.
   - `noetron-verify` — always, alongside preferences, and for the same reason. It defines what
     counts as evidence, why the failing-test output must be the runner's rather than the agent's
     word for it, and that no success is claimed before its oracle ran. An agent asked for red
     evidence without the skill that defines red evidence returns a sentence where an output belongs.
   - `noetron-testing` — whenever the task writes or changes test code.
   - `noetron-security` — whenever the task's territory touches a sensitive surface.
   - `noetron-design` — whenever the diff touches templates, styles, or client-side components.
   - The domain skills (`<prefix>-*`) the brief names — the spec task's **Domain skills to apply**
     field, or the request brief's **Domain skills** row.
   - The grounding rule, stated inline: *facts about an external library or API come from
     documentation for the version actually in use — never from memory.*
4. Interfaces and decisions from earlier tasks that the brief cannot know (the `Consumes` reality
   as built).
5. Your resolution of any ambiguity you noticed in the brief.
6. The two deliverables: **the commit** this task must leave — created after the task's own oracle
   **and** the verification set of element 8 are both green, message in the repository's idiom,
   nothing from `.noetron/` in it, never `--no-verify`
   (`noetron-execute` § The code commit) — and the report path
   (`.noetron/work/<slug>/task-N-report.md`), written against the report contract below.
7. The volume ceiling: **the report stays under 150 lines**. Evidence is command output, not
   narration; a failed attempt is one line, not a retelling.
8. **The verification set — the exact commands, pasted.** "Suite green" names no suite: in a
   workspace the set is the ratified `scope` plus everything `profile.md`'s dependency edges say
   consumes it, which is the same set `noetron-branch` proved as the baseline and `noetron-verify`
   re-runs at every claim. Copy the commands and the directory each runs from; **never describe the
   set**. The premise is element 3's: under `DELEGATED-AGENT-STOP` the agent does not open
   `.noetron/profile.md`, does not know which packages were ratified, and does not know that `web`
   imports `api` — so an implementer told "suite green" runs the command it can see, which is the
   one for the package it edited, and the break the edges predicted surfaces at the closeout instead.

Prohibited in a dispatch: the whole spec or plan; accumulated session history; "state after Tasks
1–3" narrations; instructions that pre-judge review outcomes.

**Element 3 is not optional and not summarizable.** Passing only domain skills was a measured
defect: implementers wrote code with no comment discipline, no test doctrine, and no security
floor, because nothing in their world mentioned those rules existed. `noetron-verify` was the same
hole one layer down — the agent responsible for producing the evidence of red never carried the
skill that says what evidence is.

## The report contract

Full detail goes in the report **file**, under the volume ceiling: what was done, the command and
output of every oracle run, the failing-test output that opened the cycle, deviations, concerns.
Back to the coordinator, **at most 15 lines**: status, **the commit SHAs this task produced**, a
one-line test summary, concerns, report path. The SHAs are what the coordinator checks against
`git log` and what the review package's range is cut from; a `DONE` with no SHA is a claim with no
history behind it.

| Status | Meaning |
|---|---|
| `DONE` | every oracle passed; evidence is in the report |
| `DONE_WITH_CONCERNS` | done, with named concerns for the reviewer |
| `NEEDS_CONTEXT` | a material gap: one sentence, 2–3 real options, a recommendation — never self-resolved |
| `BLOCKED` | cannot proceed; what was tried and why it failed |

Reports are **rewritten, not appended**. An attempt that produced no file is one line in a
`Attempts` list, never a re-narration of the context.

## The review package

Write `.noetron/work/<slug>/review-N-<base7>..<head7>.diff`: the commit list, `--stat`, and
`git diff -U10` for the task's range. In the short chains, where there is one change and no task
number, the file is `review-<base7>..<head7>.diff` and the range is the branch's own; for a
delivery's final review it is `review-final[-s<k>]-<base7>..<head7>.diff` and the range is the whole
delivery's.

### How many reviewers, and what each one may see

**A per-task review at `standard` / `large` is two dispatches, never one** — the lens table in
`noetron-review` is a rule about reviewers, not about sections in one report, and
`noetron-execute` § Which lenses are dispatched is where the count lives. The **packages are not the
same**, and that is the whole mechanism:

| Lens | `<lens>` | Paths in the prompt | Contract text |
|---|---|---|---|
| **spec — blind** | `spec` | **two:** the brief, the review package | the spec's **Global constraints** verbatim, as an attention lens |
| **quality** | `quality` | **three:** the brief, the report, the review package | the same Global constraints |

The scoped review of `small` and `bug`, and every delivery's final review, are **one dispatch each,
the quality lens**, with the three paths — the brief's Acceptance and Ratified line standing in for
Global constraints where no spec exists.

**Handing the spec lens the report is the defect this table exists to stop.** It is one path too many
in a prompt that otherwise looks correct, it cannot be undone once read, and what it produces is a
second quality reviewer whose verdict the ledger records as compliance. `<lens>` is written by the
dispatch, from the two values above; a filename that reaches `work/` still saying `<lens>` is a
verdict attributable to nobody.

Both dispatches carry **the implementer's own element shape** — with element 6's deliverable being
the review file instead of a commit, since a reviewer is read-only — and **element 3 in full**. A reviewer without
`noetron-preferences` cannot hold the floor it is supposed to hold; one without `noetron-verify`
cannot name a false oracle or a missing red, and those are the two findings only this floor
produces. Element 8 travels too — a reviewer that cannot name the suite cannot judge a claim that it
was green.

**The reviewer is a fresh context in every mode, `inline` included.** When no delegation capability
exists at all, the quality lens still reads the diff from this file rather than from memory and
declares itself per `noetron-execute` § Mode names who implements — and the spec lens is recorded as
not run, because the only context available has already read the report.

**The reviewer returns under the same two ceilings as the implementer** — the contract is symmetric
or it is not a contract. Detail goes to `.noetron/work/<slug>/review-N-<lens>.md`, **under 150
lines** (`review-<lens>.md` in the short chains, which have no task number;
`review-final[-s<k>]-quality.md` for a delivery's final review): the verdict, the precise
praise, then each finding with its `file:line`, failure mode, and fix. Back to the coordinator, **at most 15 lines**: the verdict, the count by severity, the
`file:line` of anything Critical or Important, the ⚠️ items, and the report path. A field run put a
1,337-line review into the coordinator's context, where it stayed for the rest of the session:
findings are read from the file, and what returns is the routing information the fix loop needs.

The quality lens treats the report as unverified claims; the spec lens never sees one. Both read the
diff once, stay read-only, and return severities with `file:line`. A stated rationale in the report
never reduces a finding's severity.

## Fix and re-review dispatches

- **Before each round, the ledger line.** Write `Task N: fix round <k>/5` in `.noetron/state.md`,
  replacing that unit's previous round line (`Task N: debug fix <k>/3` under the debug cap). It goes
  in **before the dispatch leaves**, not after the fix returns: the round that never comes back is
  precisely the one whose count would otherwise be lost. `noetron-recovery` reads this line and
  resumes at `k+1`; nothing reconstructs it from `work/`, where reports are rewritten under fixed
  names and counting them returns 1 in every round.
- **The subject is whatever is being fixed, and two of the three have no `Task N`.** `Task N` for a
  spec task, `Change` for the single change of a short chain, `Slice <k> review` for a delivery's
  final review (`Spec review` under `single-delivery`) — `noetron-execute` § The task loop holds the
  table. Written with only the first form available, the other two routes skip the line entirely and
  the cap stops existing exactly where the loop is longest.
- **The line is replaced by the loop's outcome, never left behind** — `complete` at COMPLETE,
  `BLOCKED` at the circuit breaker. `fix round 5/5` surviving a `BLOCKED` is read on resume as a
  request for round 6.
- **Fix (rounds 1–3):** resume the original implementer; the findings verbatim, nothing else — its
  context is intact.
- **Fix (rounds 4–5):** fresh implementer; frame: "a previous implementer tried this task 3 times;
  it is yours now — read the report for what was tried." Brief + report + findings paths.
- **Re-review (after every fix):** **one dispatch, and it carries no lens** — it does not re-judge
  the task, it answers the findings. Scoped to the findings list plus the fix's diff, verdict per
  finding: `ADDRESSED / NOT ADDRESSED`. Out-of-scope observations return in a separate section and
  go to the ledger as deferred — they never extend the loop.
- **After every fix, the suite runs.** The scoped re-review judges the findings; the suite judges
  whether the fix broke something outside its own diff. A fix that turns the suite red is not
  addressed, however clean the scoped review reads.
