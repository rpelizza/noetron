# Routing

Noetron builds its router skill-first: flow skills are created before the graph that routes to them, so this table never contains an edge to a node that does not exist.

## Current routes

| Situation | Route |
|---|---|
| `noetron/` missing or incomplete at the repository root | `noetron-setup` |
| Creating, editing, splitting, or retiring a domain skill; approved skills pending in `noetron/setup/domain-skills.md` | `noetron-create-skill` |
| A factual question about the repository/workspace; the user asks to explore, map, or survey the project | `noetron-explore` |
| A material decision is open (requirement, contract, scope, UX, architecture, data, security, cost, acceptance); the user asks to be interviewed or to stress a design/plan | `noetron-interview` |
| About to claim anything works, passes, is fixed or done — including partial steps and subagent reports | `noetron-verify` |
| Work needs planning — greenfield, or a change with open decisions; or it is unclear whether a task needs a plan, a spec, or neither | `noetron-plan` |
| An approved plan (or ratified spec-only work) needs its executable spec; the user asks for a spec or task breakdown | `noetron-spec` |
| A ready spec needs executing; an interrupted execution needs resuming; the user asks to implement an approved plan/spec | `noetron-execute` |
| A task/feature/branch needs review; the user asks for a review; review feedback arrived and must be handled | `noetron-review` |
| A bug, test failure, incident, or unexpected behavior appeared — before proposing any fix | `noetron-debug` |
| Execution complete and the work needs a destination (merge/PR/keep); a finished branch or worktree needs closeout | `noetron-finish` |
| Frontend/UI work — building or changing pages, components, styles; the user asks for design, redesign, or UI critique | `noetron-design` |
| A task inside a domain covered by a `<repo-name>-*` skill | that domain skill, alongside whatever else applies |
| Anything else | No specialized route yet: proceed under the doctrines in `SKILL.md` (oracle + execution), interacting per `noetron/setup/preferences.md` |

Every new harness skill adds its row here **in the same change that creates it** — a route and its node are born together, and a route without a node is a broken edge.

## The dynamic graph (planned)

When the flow skill set is complete, this file becomes the per-task graph builder:

1. **Classify** the task — size, risk, domain, project type (from `noetron/state.md` and `noetron/setup/`).
2. **Assemble** the chain of skills as a graph of nodes, each node `{action, oracle, stop condition}`, each edge gated by the previous node's oracle.
3. **Execute** the graph, updating `noetron/state.md` at every phase change.
4. **Adapt** — a failing oracle re-plans the remaining subgraph instead of pushing through.
