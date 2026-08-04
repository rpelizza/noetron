<!-- noetron:source-repo — marks the harness's own repository. Read by noetron-setup (step 0)
     to refuse a consumer bootstrap here. Never copy this file into a project. -->

# Noetron

A skill-driven engineering harness for AI coding agents. It is markdown and nothing else: **no
hooks, no daemons, no runtime, no build step**. The skills *are* the product — 21 of them under
`.claude/skills/`, deciding how a request is classified, what must be proven before anyone claims it
works, and where the human decides instead of the model.

Noetron is stack-agnostic by construction. It carries no language, package manager, or test runner
of its own; it reads your repository for the commands and versions that actually exist and records
them. Python, Go, Rust, TypeScript, a monorepo, a content repo — the harness is the same markdown
either way.

---

## The two ideas

**Graph engineering.** Skills are nodes and the routes between them are named, not improvised.
`noetron-core` is the door — it checks whether the harness is installed, decides whether the request
is a task at all, and hands off. `noetron-router` is the map — it classifies the tier, assembles the
chain, and holds the first gate. Every node label in a chain resolves to a row in the router's route
tables, and a route is added in the same change that creates the skill it points at, so no edge ever
points at a skill that does not exist — the sync script fails the build if one does. Write nodes
serialize; read-only nodes fan out. When an oracle fails, the remaining subgraph is re-planned from
the failed node — never pushed through, never restarted from scratch.

**Loop engineering.** Every unit of work carries the same three-part contract:

| Part | Meaning |
|---|---|
| **Action** | what is done |
| **Oracle** | what proves it worked — a **machine oracle** (test, build, lint, command output, diff invariant) closes the loop by itself; an **attestation oracle** (a human judging evidence) cannot close a loop, so the evidence is presented and the loop pauses |
| **Stop condition** | declared *before* the loop starts — an iteration cap and what happens at the cap |

A step with no oracle is invalid: it is sent back to get one, not executed. And the rule the whole
harness turns on — **autonomy is a function of oracle strength, never a setting.** To gain autonomy,
strengthen the oracle; never loosen the gate. Every unit runs INVESTIGATE → PLAN → IMPLEMENT →
VERIFY → ITERATE ON ERROR.

---

## Routing: tiers, chains, gates

**The tier classifier.** `noetron-router` scores the request on three signals, takes the highest tier
any one of them reaches, and states it in one line so you can override it. Classification happens
there and once: `noetron-plan` and `noetron-execute` take the tier as given, because two classifiers
produce two answers and one argument.

| Tier | Files touched | New dependency or contract | Open decisions |
|---|---|---|---|
| `trivial` | one, a few lines | none | none — the change is obvious |
| `small` | one file or function | none | resolved by reading the code |
| `standard` | 2–5 | a new internal module | one real choice to make |
| `large` | many, cross-cutting | external dependency, public API, or new stack | several still open |

Tie-breakers: a diff touching a security surface or a public contract is at least `standard`; a
greenfield product is `large`; a request whose tier is unclear is `standard`, with the doubt stated
in the same line.

**The six chains.** Four are the tier ladder above. `read-only` and `bug` are selected by the shape
of the request — a question that writes nothing, and a defect with a failure to reproduce.

```text
read-only   explore ──► answer                                    (no artifacts, no state)

trivial     G0 ──► branch ──► execute ──► verify ──► finish

small       G0 ──► branch ──► execute ──► verify ──► review(scoped) ──► finish

standard    G0 ──► explore ──► branch ──► plan ═G1═► spec ═G1═► ┌► execute ──► review ═G2═► finish ─┐
                                                                └───────── next slice ◄─────────────┘

large       G0 ──► explore ──► branch ──► interview ──► plan ═G1═► spec ═G1═► ┌► execute ──► review ═G2═► finish ─┐
                                                                              └───────── next slice ◄─────────────┘

bug         G0 ──► debug(triage) ──► branch ──► execute(red → fix) ──► verify ──► review(scoped) ──► finish
                        ├── size ≥ standard (sensitive surface, contract, open decision) ──► re-enter as standard
                        └── architectural (3-fix rule) ──────────────────────────────────► re-enter as standard
```

`═G═►` is an edge only a human opens; `──►` is opened by the previous node's oracle. **Every node
label names its skill** — `noetron-<label>` — and a parenthetical names a mode inside that skill,
never a second node. `branch` precedes every node that writes, including `plan` and `spec`, because
their artifacts are files and `git worktree add` carries no uncommitted work. Every chain ends at
`finish` — and a per-slice chain ends there once per slice.

**The tail loops; the head never does.** When the approved plan declares two or more independently
deliverable slices and G1 ratifies `cadence: per-slice`, the segment `execute ──► review ═G2═►
finish` runs **once per deliverable slice**: slice 1 on the task branch `<type>/<slug>`, each later
one on `<type>/<slug>-s<N>` cut from the ratified base once its predecessor landed — or continuing
on the same branch when it did not land, an open PR included. Everything
before the spec's G1 runs exactly once for the whole task — tier, scope, plan, spec, the
domain-skill gate — because re-opening any of it per slice would multiply the ceremony by N, which
is the cost this loop exists to avoid. `cadence: single-delivery` collapses the tail to a single
pass: the old shape, now chosen explicitly instead of by default.

The principle underneath it: **a chain that stops at slice 3 of 5 leaves two integrated, usable
deliveries behind — not a branch.** That is why the destination gate sits inside the loop instead
of at the end of it.

**The three gates.** Ceremony scales with tier; the gates do not.

| Gate | When | What you ratify |
|---|---|---|
| **G0 — Kickoff** | before the first write | tier, branch and base, isolation (branch or worktree), execution mode (inline · subagents · team), commit strategy |
| **G1 — Artifact** | before execution | the plan **and its delivery cadence**, then the spec — `standard` and `large` only |
| **G2 — Destination** | after each delivery is proven | merge locally, open a PR, or keep the branch — `noetron-finish` offers exactly these three |

At `trivial` and `small`, G0 is a **single line** naming every item at once; one "ok" ratifies all of
it, and a named override adjusts only that item. At `standard` and `large`, G0 is **sequential — one
decision per turn**, each carrying a recommendation and its reason. A recommendation is not an
answer: the gate opens only when you reply. Squashing commits happens only if you ask.

**G2 closes a delivery, not necessarily the whole spec.** Under `per-slice` it fires once per
deliverable slice: the full menu at slice 1, then a one-line confirm that *this* result goes where
the previous slice went — read from `## Delivered`, with all three options still reachable by naming
one. The cadence says how often you are asked, never where the code lands. The cadence is
ratified at G1 rather than G0 because G0 fires before the plan exists, so the slices it would decide
between are not yet known.

**Two standing guards** fire anywhere in any chain: `noetron-verify` at every claim of success, and
`noetron-interview` at every material gap — the model never fills a decision of yours with a silent
default. **Overlays** apply to every node in their territory and travel inside delegation briefings:
`noetron-preferences` (everything the project keeps), `noetron-testing` (all test code),
`noetron-security` (sensitive surfaces), `noetron-design` (UI), `noetron-reasoning` (material
uncertainty), and your project's own domain skills.

---

## Installation

### 1. Copy two paths, and only two

```
git clone <this-repo> noetron-src
```

From the clone, copy into the root of your project:

| Path | What it is |
|---|---|
| `.claude/skills/` | the harness skills — all of them, and nothing else is the harness |
| `scripts/` | the optional sync script (see [Node is optional](#node-is-optional)) |

### 2. Do not copy anything else

**Never copy `CLAUDE.md` or `AGENTS.md` over your project's own.**

Those two files are yours. In your repository they may already carry your house rules or another
tool's block, and Noetron's guarantee is **append, never rewrite**. The harness ships neither file:
`noetron-setup` writes them for you, appending its contract between `<!-- noetron:contract -->`
markers and leaving every other line untouched. Overwriting them by hand destroys exactly what that
guarantee protects. Also skip `.agents/` and `.cursor/` (generated — see below) and this `README.md`
(your project has its own, and copying this one would make `noetron-setup` mistake your repository
for the harness's source).

### 3. Open a conversation in your project

The first use triggers `noetron-setup`, which **proposes before it creates anything**. It names what
it found, lists every path it would create or append to, and waits. Approved, it:

- scaffolds `.noetron/` (below) and appends `.noetron/work/` to your `.gitignore`;
- appends the contract block to `CLAUDE.md` and `AGENTS.md` — byte-identical in both, so a later
  session can detect drift with a plain `diff`;
- checks for the recommended MCP servers and offers to add them at the scope you pick;
- fills `.noetron/profile.md` from evidence — the lockfile for the package manager and pinned
  versions, the scripts block or Makefile or CI workflow for the commands that actually run — and
  **confirms that list with you**, because a `test` script nobody runs is worse than an empty entry;
- records your existing decision-record convention if you have one, and proposes `docs/adr/` only if
  you do not. ADRs live with the project, never inside `.noetron/`;
- surveys your codebase and proposes **domain skills** — `<prefix>-*` entries in `.claude/skills/`
  that teach the harness your project's own conventions, invariants, and traps. On a greenfield
  repository the survey has nothing to find, so setup arms the gate instead and `noetron-plan` fires
  it at the design edge, before the first line of domain code.

Nothing on that list happens without your confirmation, and existing content is only ever appended
to.

---

## Node is optional

The harness executes nothing. No agent needs Node to read markdown, and every chain above works on a
machine that has never installed it.

`scripts/sync-noetron.mjs` (Node 18+, zero dependencies) exists for one narrow job: keeping copies
honest for runtimes that do **not** read `.claude/skills/`.

```
node scripts/sync-noetron.mjs           regenerate the mirrors
node scripts/sync-noetron.mjs --check   verify they match — exit 1 if stale (use this in CI)
node scripts/oracles.test.mjs           prove the structural checks can still fail
```

It does three things and five checks:

1. mirrors `.claude/skills/` byte-for-byte into `.agents/skills/`, deleting anything stale there;
2. splices into `AGENTS.md`, marker to marker, the contract block taken from `CLAUDE.md` plus an
   index of the skill names — replacing the marked block if present, appending it if not, and
   leaving every other line in the file alone;
3. writes `.cursor/rules/noetron.mdc` with the same contract;
4. fails if `CLAUDE.md` and `.claude/skills/noetron-setup/assets/contract.md` have drifted apart —
   `noetron-setup` anchors every consumer from the asset, so the two must stay byte-identical;
5. fails on any `noetron-*` name mentioned anywhere in the skills that has no matching directory — a
   route pointing at a skill that does not exist is worse than no route, because the agent follows
   it and lands nowhere.

The last three checks come from `scripts/noetron-oracles.mjs` and answer the opposite question — not
"does this route point at something real?" but **"does anything actually execute this promise?"**:

6. **writer symmetry** — every row of the writer table in
   [state.md](.claude/skills/noetron-setup/references/state.md) names a skill that mentions the field
   it is said to write. A field with readers and no writer looks finished and is dead;
7. **graph integrity** — every node label in the router's chain diagram resolves to a skill, every
   skill has exactly one route row, and every edge the graph draws is named by the node it leaves;
8. **skill documentation** — every skill under `.claude/skills/` has a row in the table below. Source
   repository only, keyed to the marker at the top of this file.

These exist because the same defect recurred seven times across three rounds and was never once
caught by whoever wrote it: `commits` ratified at G0 with no node executing it, `review: combined`
ratified and unimplemented, `learnings.md` and `verification-standard.md` declared with readers and
no writer, `status: active` read by `noetron-core` and written by nobody, `phase:` never advanced,
and a `branch` node drawn outside the slice loop whose absence would have put a second slice's
commits on `main`. Prose asking for vigilance had already failed at that; a check that can say no
had not been tried.

`scripts/oracles.test.mjs` is what keeps them able to say no. It copies the harness to a temporary
directory, reintroduces each of those defects one at a time, and asserts the check names it — 7
mutations, seconds to run, no dependencies. It was not written for symmetry: the first draft of the
writer matcher built a regex that matched nearly anything, went green on a field no skill wrote, and
was caught by this file rather than by review.

**Doing it by hand.** If you have no Node, or you only use a tool that reads `.claude/skills/`
natively, skip the script and lose nothing. When you do want the mirrors:

- Copy the whole `.claude/skills/` tree to `.agents/skills/` — same files, same relative paths — and
  delete anything under `.agents/skills/` that no longer exists at the source.
- Open `CLAUDE.md`, take the text between `<!-- noetron:contract -->` and `<!-- /noetron:contract -->`
  (markers included), and put it in `AGENTS.md`: replacing the block between the same two markers if
  they are already there, appended at the end after one blank line if they are not. Change no other
  line of that file.
- For Cursor, put the same block in `.cursor/rules/noetron.mdc` under a front matter of
  `description: Noetron harness contract` and `alwaysApply: true`.

Repeat whenever a skill or the contract changes. `.claude/skills/` is always the source; the other
three are copies.

---

## The workspace

Everything the harness learns about your project lives in `.noetron/` at the repository root —
hidden like `.github/`, versioned like it, and committed: a state file that exists on one machine
cannot be a recovery point.

```
.noetron/
├── state.md                  cursor of the active task, plus `## Delivered` — the crash-recovery point
├── profile.md                real commands, package manager, stack baseline, language, MCP record
├── domain-skills.md          catalog of <prefix>-* skills, the prefix authority, pending list
├── verification-standard.md  what "correct" means in this project
├── learnings.md              execution memory that outlives one task
├── history/                  one block per closed task — versioned, immutable
├── plans/                    on demand — noetron-plan
├── specs/                    on demand — noetron-spec
└── work/                     ephemeral, git-ignored, deleted at closeout
```

What never goes there: product documentation (that is your `docs/`), architecture decisions (`docs/adr/`,
the adr-tools/MADR convention every reviewer already knows), secrets, and anything a command can
regenerate.

---

## The 21 skills

| Skill | What it owns |
|---|---|
| `noetron-core` | The door. Read before the first substantive move of any conversation: is the harness installed, is this a task at all, and how a skill is used here. It draws no graph and hands off. |
| `noetron-router` | The graph. Every task-bearing request leaves here with a tier, a chain, and — for anything that writes — a ratified G0. Also owns the re-route when an oracle fails, a premise breaks, or the tier is proved wrong by evidence. |
| `noetron-setup` | Installs and repairs the harness in a repository: `.noetron/`, the contract appended to `CLAUDE.md` and `AGENTS.md`, the MCP check, the domain-skill catalog, and the legacy `noetron/` migration. Proposes before creating. |
| `noetron-recovery` | Reconciles the harness's record with the repository when a session resumes after a compaction, crash, or interruption. Read-only sweep first, conclusion second; the ledger is corrected to match git, never git rewritten to match the ledger. Uncommitted work is preserved by proposal, never by reflex, and the fix-loop counters it persists are what keep a cap a cap. |
| `noetron-explore` | The facts engine. Questions of fact are never asked of you and never answered from memory — they are answered from the repository, every fact carrying `file:line`, a command with its output, or a versioned doc reference. |
| `noetron-interview` | The decisions engine and a standing guard: it fires the moment a decision that belongs to you is about to be filled by something else. One question per turn, real options, a recommendation, no facades. |
| `noetron-plan` | The `standard`/`large` planning loop: explore, ground each external dependency in docs for the version actually in use, 2–3 genuinely different approaches, thin vertical slices ordered by risk — each saying whether it reaches a destination on its own and how it is safe to integrate — a mandatory stress pass, then G1, which ratifies the plan and the **delivery cadence** together. It takes the tier as given and never re-derives it. |
| `noetron-spec` | Turns an approved plan into tasks an implementer can run without guessing — **contracts, not function bodies**: signatures, types, invariants, named edge cases, an oracle per task, the red-green cycle, and a Validation section that proves the whole spec. |
| `noetron-branch` | Isolation before the first write: unborn-repository handling, the protected-branch guard, base resolution, and a proven green baseline. |
| `noetron-execute` | The loop engine for every mutating chain — inline, subagents, or an agent team. Per-task cycle, advancing through the plan's slice table one deliverable slice at a time under `per-slice`; handoff by file, a ledger that outranks memory after compaction, and a fix loop capped at 5 rounds with a circuit breaker that adjudicates in writing. |
| `noetron-review` | Independent eyes, two lenses that never merge: a **spec lens blind to the implementer's report** and a **quality lens**. Scoped by tier — and, under `per-slice`, to that slice's own diff. Also governs receiving feedback from any source — rigor, not performative agreement. Zero findings is a valid verdict; a fabricated finding is a defect. |
| `noetron-verify` | The claims gate: IDENTIFY → FALSIFY → RUN → READ → COMPARE → CLAIM. No claim of success without fresh evidence, and no evidence from an oracle that cannot say no. |
| `noetron-debug` | No fix without the failure reproduced: the red command, executed, with its output pasted, is the entry ticket. Four-class triage, loop tightening, and the 3-fix rule that sends an architectural bug back as a `standard` task. |
| `noetron-finish` | Closeout, and under `per-slice` it runs once per deliverable slice: re-prove the chain's own oracle where the work will actually live, hold gate G2, write the history entry, migrate the ledger, advance the cursor to the next slice — resetting it to idle only at the last — and clean only what the harness created. |
| `noetron-testing` | Sets the bar a test must clear — name the break, exercise the real thing, survive a mutation check — so that "the suite is green" means something. Travels in every briefing that writes test code. |
| `noetron-security` | The OWASP pass applied **to the diff**, on triggered surfaces only, version-first, before the final review — never deferred to closeout. |
| `noetron-design` | The UI overlay: mode scoping, a ratified direction contract, anti-convergence sortition, numeric craft floors, designed states, and rendered verification of any visual change. |
| `noetron-reasoning` | Technique selection for material uncertainty — evidence triangulation, weighted trade-off, assumption tracking, falsifiable hypothesis chain, completeness sweep, OODA convergence check. It produces evidence and options; it never ratifies. |
| `noetron-preferences` | The global behavior floor under everything a project keeps: no emojis in code or interface text, DRY with judgment, production-ready defaults, portable commands. Your project's recorded preferences override it. |
| `noetron-create-skill` | Authors the **domain** skills of a consumer repository — FRAME → EVIDENCE → DRAFT → VERIFY → REGISTER, with a trigger test as the gate and a 3-round cap. Harness skills are authored only in this repository. |
| `noetron-evolve` | Self-improvement as a side effect of a real, observed failure — never a sweep. Owns `verification-standard.md` and `learnings.md`, mines weaknesses from history and git since the last marker, and proposes reversible edits you adopt or decline. |

Every skill ends with a falsifiability footer — *"This skill is working if:"* — listing observable
signals, so the harness's own maintenance is measurable instead of opinionated.

---

## Recommended MCP servers (optional)

`noetron-setup` detects these and offers to add them at the scope you choose. Both are optional; each
unlocks something specific.

| Server | What it unlocks |
|---|---|
| **context7** | Documentation for the version actually in your lockfile. It is the mechanism behind the rule that facts come from docs for the version in use: `noetron-plan` grounds its options, `noetron-spec` grounds signatures and pinned versions, `noetron-security` grounds mitigations, `noetron-create-skill` grounds conventions. Without it they fall back to memory — which is how a wrong-major API enters a spec. |
| **playwright** | A real browser, which turns a claim about a rendered screen into evidence. `noetron-design` and `noetron-verify` have no other way to check UI. |

Declines are recorded in `.noetron/profile.md` too, so the next session does not re-ask.

---

## What Noetron does not do

- **It does not run itself.** No hooks, no scheduler, no background process. Every skill runs because
  an agent read it. The contract appended to `CLAUDE.md` and `AGENTS.md` is the only text guaranteed
  loaded in every session — that block is what stands in for a bootstrap hook.
- **It does not decide what your product does.** Requirements, scope, UX, architecture, data,
  security posture, cost, accepted risk, acceptance criteria, and — at every kickoff — isolation,
  mode, and commit strategy are yours. Filling one with a default is a violation, even when the
  default is obviously safe.
- **It does not bring its own toolchain.** It uses the commands your repository already has, after
  confirming with you which ones actually run.
- **It does not weaken a check to make an output pass.** If an output fails, the output gets fixed,
  never the standard.
- **It does not write product documentation.** `docs/` and `docs/adr/` belong to your project; a
  harness keeping its own copy produces two sources of truth about one feature.

---

## Working on the harness itself

This repository is the source of the harness, not a consumer of it.

- `.claude/skills/` is the **only** place a `noetron-*` skill is edited. `.agents/skills/`,
  `AGENTS.md`, and `.cursor/rules/noetron.mdc` are generated — never edit them by hand.
- The root `CLAUDE.md` is the origin of the contract and stays byte-identical to
  `.claude/skills/noetron-setup/assets/contract.md`; `diff` is the oracle.
- `noetron-setup` recognizes this repository by the marker at the top of this README and **stops**
  instead of bootstrapping a consumer workspace here — a bootstrap would scaffold `.noetron/` and
  propose domain skills under a prefix colliding with the harness's own namespace.
- Run `node scripts/sync-noetron.mjs --check` before every commit; it is the build.
