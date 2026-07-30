# Routing

Noetron was built skill-first: every node below exists, so no route points at a ghost. This file is the harness's graph builder — it turns a request into a chain of nodes, each `{action, oracle, stop condition}`, each edge gated by the previous node's oracle.

## Direct routes (single-node situations)

| Situation | Route |
|---|---|
| `noetron/` missing or incomplete at the repository root | `noetron-setup` |
| Creating, editing, splitting, or retiring a domain skill; approved skills pending in `noetron/setup/domain-skills.md` | `noetron-create-skill` |
| A factual question about the repository/workspace; the user asks to explore, map, or survey the project | `noetron-explore` |
| A material decision is open; the user asks to be interviewed or to stress a design/plan | `noetron-interview` |
| About to claim anything works, passes, is fixed or done — including partial steps and subagent reports | `noetron-verify` |
| Work needs planning, or it is unclear which chain a task needs | `noetron-plan` |
| An approved plan (or ratified spec-only work) needs its executable spec | `noetron-spec` |
| A ready spec needs executing; an interrupted execution needs resuming | `noetron-execute` |
| A task/feature/branch needs review; review feedback arrived | `noetron-review` |
| A bug, test failure, incident, or unexpected behavior — before any fix | `noetron-debug` |
| Execution complete and the work needs a destination; closeout | `noetron-finish` |
| Frontend/UI work; design, redesign, or UI critique | `noetron-design` |

Every new harness skill adds its row and its edges **in the same change that creates it** — a route and its node are born together.

## Building the task graph

### 1. CLASSIFY

Gather the evidence (`noetron-explore` + `noetron/state.md` + `noetron/setup/`): an active task in the state means **resume** (trust the ledger — never restart silently). Otherwise classify by `noetron-plan`'s chain classifier — open decisions, oracle clarity, blast radius — and by surfaces: UI touched → `noetron-design` overlays; a domain covered by a `<repo-name>-*` skill → that skill overlays every node in its territory; a bug signal → the graph enters through `noetron-debug` triage.

### 2. ASSEMBLE

The four chains, as graphs (`══►` = edge gated by an attestation oracle; `──►` = sequential edge):

```text
read-only:  explore ──► answer                    (no artifacts, no state)

direct:     micro-plan (step → verify:) ──► execute inline ──► verify ──► finish

spec-only:  explore ──► spec ══► execute ══► final review ══► finish
                          ▲ stress (interview)

full:       explore ──► interview (discovery) ──► plan ══► spec ══► execute ══► final review ══► finish
                                                   ▲ stress          │
                                                                     ├── gap ────► interview (STOP)
bug:        debug (triage) ──► direct class: fix + regression        ├── bug ────► debug
                └── architectural (3-fix rule) ──► plan              └── per task: verify + review + fix loop (cap 5)
```

The gates on the `══►` edges:

| Edge | Gate (oracle that opens it) |
|---|---|
| plan → spec | plan `status: approved` (stressed + user ratified) |
| spec → execute | spec `status: ready` (self-review + integral stress + ratified) |
| task N → task N+1 | task N's oracles passed, review clean or adjudicated, ledger line written |
| execute → final review | all tasks complete + spec Validation green |
| final review → finish | review passed (one fixer + one re-review at most) |
| finish menu → integration | the user's ratified choice; merged result proven green |

Two standing guards are not sequential nodes — they fire anywhere: **`noetron-verify`** at every claim of success, **`noetron-interview`** at every material gap. And the parallelism rule holds at graph level: **write nodes serialize; read-only nodes fan out.**

### 3. RATIFY

Present the assembled route in one compact confirm — chain, mode (inline/subagents/team), branch, commit strategy — recommend-and-ratify, never self-applied. A direct-chain task reaches its first write with at most this one stop.

### 4. EXECUTE

Run the graph. `noetron/state.md` records phase transitions and task completions in real time — it is the crash-recovery point, and after compaction it outranks memory.

### 5. ADAPT

A failing oracle never gets pushed through:

- a failing **step** → its stop condition (attempts, then escalate) or `noetron-debug` when the cause is not evident;
- a failing **premise** (the plan's assumption proved wrong) → re-plan the remaining subgraph from the failed node — `noetron-spec` for translation errors, `noetron-plan` for design errors; never restart the whole graph, never improvise past the failure;
- a **gap** → `noetron-interview`, then resume exactly where the graph stopped.
