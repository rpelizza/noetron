---
name: noetron-design
description: Use when building or changing frontend interfaces — pages, components, dashboards, app shells, forms, empty states; when the user asks for UI design, redesign, polish, or critique; or when a task's diff touches templates, styles, or client-side components.
---

# Noetron Design

The design overlay for UI work. It exists to kill two failure modes: **generic AI convergence** (the same faces, the same gradient hero, the same card grid — measured: a model asked 16 times produced 30/35 identical concepts) and **vibe-only direction** ("modern and clean" is not a decision). The operating principle: **commitment beats refinement** — a decided direction executed firmly beats timid iteration every time.

## Scope first — what this task actually is

Name the mode in one line, beside the tier `noetron-router` already set, so the user can correct
both at once. **One mode per task.**

| Mode | The task | What runs |
|---|---|---|
| `text` | copy, label, string, a token swap | build rules only |
| `polish` | spacing, alignment, state, contrast on an existing screen | build rules + floors + rendered check |
| `audit` | critique or accessibility review of what exists | floors + fidelity matrix, read-only |
| `shape` | a new screen, component, or flow | everything the tier allows, contract included |
| `direct` | a new product surface with no brand to inherit | everything, sortition included |

**`audit` is asked for by name; `polish` is what a complaint means.** `audit` runs only when the
request asks to be *told* rather than *changed* — *review*, *critique*, *audit*, *assess*, *what is
wrong with this*. A request that names a defect without a verb — "the spacing is inconsistent and
the contrast looks low" — is `polish`: naming a flaw is asking for it to go. The read-only mode is
the one that must be named, because it is the one that surprises a user who expected a fix.

**A request that genuinely spans both runs them in series:** `audit` first, its findings ratified by
the user, then `polish` executing exactly that ratified list. Two agents on one screen, one
correcting and one describing, return two truths and a merge conflict.

**Ceremony precedence — the two axes are ANDed, and either exemption exempts.** The direction
contract is authored only when the **mode** calls for it (`shape`, `direct`) **and** the **tier** is
`standard` or `large`. A `polish` spanning three files is `standard` by size and still authors no
contract; a `shape` ruled `small` authors none either. Surviving every exemption: the craft floor,
the designed states, and the rendered check for any change with a visual result.

An exempt task still **cites** the direction it works against — the recorded contract when one
exists, else the design system, else the explicit line *"no recorded direction; this change is held
by the floor alone"*. The citation costs a sentence and gives the reviewer something to check.

A `text` change with no visual consequence needs no rendered check; one that reflows a layout does.

## Where the contract lives

**Home: `### Direction contract`, a block inside the plan's `## Decisions` —
`.noetron/plans/YYYY-MM-DD-<slug>.md#direction-contract`.** It is a set of ratified product
decisions, and that section is already their canonical, versioned home (`noetron-plan`, *one
decision, one home*); the ledger stays a cursor, and `.noetron/` grows no new file. **A contract is
required exactly where a plan already exists** — that follows from the precedence rule above rather
than by luck, so no chain can demand one and have nowhere to put it.

`.noetron/state.md` carries the pointer only: `direction contract → plans/<file>#direction-contract`.

**It travels as that path, never pasted.** When a dispatch's harness floor (element 3 of the
[dispatch contract](../noetron-execute/references/dispatch.md)) names this skill, it names the
anchor on the same line; the fresh-eyes reviewer receives the same anchor, and UI tasks reference it
from their `verify:` lines. An implementer told to execute a direction "with commitment" and never
handed its path executes its own taste instead — which is the convergence this skill exists to stop.

Declared exceptions to the craft floor live in that same block, one line each: the floor excepted,
the surface it applies to, and why.

## The direction contract — before any screen

Five blocks, each a **concrete choice**, written before building:

| Block | A decision looks like | Not a decision |
|---|---|---|
| 1. Concept | the one idea the interface embodies, named | "clean and professional" |
| 2. Typography | the actual faces, scale, weights | "a nice modern font" |
| 3. Color & material | the palette with roles — mood lives in the brand colors, not in tinted surfaces | "a fresh palette" |
| 4. Layout system | grid, density, spacing rhythm | "well spaced" |
| 5. Motion | what moves, when, how long — or deliberately static | "subtle animations" |

**The test: if a block reads as vibe, the direction was not decided — rewrite it as a choice.** Synthesis ≤150 words, ratified by the user (direction is a product decision; a contested block goes to `noetron-interview`). Once ratified, execute with commitment: mid-build aesthetic drift is a gap, not iteration.

### An existing design system covers block by block

Coverage is **discovered per block**, never assumed whole. `noetron-explore` maps the system's
tokens, components, and written rules onto the five blocks, and "the system covers this" is a claim
that cites a file. Tokens with no rule for their roles — a palette that never says which value is
primary and which is accent — cover the *values* and leave the *decision* open.

- **Covered block** — the system **is** the decision. Record it in the contract with its citation
  and follow it; no sortition, no alternatives, no improvement.
- **Uncovered block** — decided by **extension, not sortition**: 2–3 concrete options derived from
  the covered blocks' own logic, ratified by the user, recorded and marked
  `extended — no system coverage`. Sortition answers a direction that is open; a system that already
  fixed typography and color has ruled out most of what a roll would produce, and rolling anyway
  yields motion that fights its own palette.
- **No block covered** — that is `direct`, and sortition runs.

The mark is load-bearing downstream: the reviewer judges covered blocks against the system and
extended blocks against the ratified extension.

### When the system and the floor conflict — the ladder

**Accessibility Refuse lines > the project's design system > craft-floor defaults and bans > the
model's taste.**

A system whose token pair fails contrast loses that one line: report the finding to the user and
ship the compliant pair. Everywhere else the system wins — **including the kicker/eyebrow ban, which
binds invention and not inheritance.** That ban exists because the pattern marks converged model
output, and a house pattern a human wrote is not that: follow it on the surfaces the system already
uses it on, record it in the contract as an inherited exception with its citation, and introduce it
nowhere else.

**Visual questions get visual answers.** During direction and build, a genuinely visual question is answered with disposable mockups: quick HTML rendered in the browser or preview, showing 2–3 **structurally different** variants — slightly adjusted grids are wallpaper, not variants. Mockups are scratch (`.noetron/work/` or temp), never committed as product code.

## Anti-convergence sortition

When the direction is open (no brand imposed, no covering system):

1. **Generate 6–10 candidate directions, genuinely different** — different concept + typography + color + layout, not one grid with ten accents.
2. **Derive a deterministic index from project facts** — sum the character codes of the task slug; `index = 3 + (sum mod (N − 2))`. The index **never lands on candidates 1 or 2**: the model's first instincts are the convergent ones, and the external seed is what the model cannot fake.
3. Present the selected candidate with the full list. The user **ratifies or re-rolls** — a re-roll generates new candidates; it never quietly picks the discarded firsts.

## Build rules

- Follow the [Craft Floor](references/craft-floor.md) — pass/fail lines in Verify/Refuse format, plus a separately marked guidance section that never fails a review. Floors are **category defaults, not bans**: deviating is legitimate only as a declared exception in the direction contract, never silently.
- Real content over lorem whenever it exists — lorem hides layout failures that real strings expose.
- **Every state is designed**: loading, empty, error, disabled. Empty states are design, not leftovers.
- Accessibility floors are the exception to "defaults, not bans": those are Refuse lines, and they top the ladder above.

## Verification — the design oracle

UI claims are verified rendered, never from source reading alone:

- **Machine-checkable floors** (contrast ratios, tap targets, page overflow at 375px, focus visibility, reduced-motion) are measured in a **real rendered page**, in this order of preference:
  1. **The IDE's own browser**, when the runtime exposes one (a preview pane, an embedded browser tool). It is already attached to the running project, costs no setup, and needs no MCP.
  2. **playwright MCP**, when installed.
  3. **Computed from the tokens**, for the floors that arithmetic settles — contrast is a WCAG relative-luminance calculation over two declared colors and needs no browser at all. State that the value was computed, not observed.
  4. **Declared unverified.** Name the floor, say no rendering surface was available, and hand it to the user as an attestation. Never claim a floor passed because it probably did.

  The first three are machine oracles: iterate freely until they pass. Reaching step 4 is a gap in the environment, not a licence to skip the floor.
- **Aesthetic judgment** is an attestation oracle: screenshots or a live preview presented against the direction contract; the user judges. Presenting evidence is not claiming success (`noetron-verify`).

## Fresh-eyes design review

**Substantial — the trigger, any one of:** a route or full page added or restructured · **three or
more** components with rendered output changed · any change to design tokens or a shared layout
primitive · any `direct` delivery. The third clause is blast radius rather than diff size: one file
can repaint the whole product, and a one-line token edit is the most substantial delivery there is.

At the trigger, dispatch a fresh-context, read-only reviewer carrying the contract anchor, the screenshots/preview, and the craft floor. It returns a **fidelity matrix** — per contract block: followed / drifted, with evidence, typography and color/material lines mandatory — plus floor violations with **measured values**. The coordinator cannot soften the verdict — the same anti-pre-judging rule as `noetron-review`.

Below the trigger, the coordinator runs the floor and state checks itself and reports them in one line **with the values it measured**.

## Red flags

- Building a `shape` or `direct` task before the contract is ratified, or a contract block that
  reads as vibe.
- A ratified contract with no anchor anyone can open, or a dispatch naming this skill without it.
- Reading a UI complaint as `audit` and returning a description where a fix was wanted; running
  `audit` and `polish` on one screen at the same time.
- Authoring a contract for a `polish` because its size reached `standard`, or skipping the floor on
  a `shape` because its tier is `small`.
- Sortition on a block the design system already covers, or "improving" an inherited pattern the
  system fixed.
- Shipping candidate 1 or 2 of a sortition.
- "Improving" the direction mid-build — drift dressed as iteration.
- Lorem-only screens presented as done; states missing.
- Claiming visual quality without a rendered check, or a floor reported without its measured value.
- Softening the design reviewer's fidelity matrix.

## Integration

- `noetron-router` — tier and mode are stated together; the tier half of the precedence rule is its classification, taken as given.
- `noetron-plan` — UI-bearing plans build the contract during DESIGN and hold it in `## Decisions`.
- `noetron-spec` — UI tasks carry floor checks and the contract anchor in their `verify:` lines.
- `noetron-execute` — frontend tasks load this skill, and its dispatch carries the anchor.
- `noetron-review` — reviews of frontend diffs delegate fidelity and floor checks here.
- `noetron-verify` — rendered evidence before any visual claim.
- `noetron-interview` — direction is a product decision; contested blocks land there.
- `noetron-explore` — discovery of an existing design system, its tokens, and its block coverage.

---

**This skill is working if:** every ratified direction contract has a path an implementer can open, and every dispatch that names this skill carries it; interfaces stop resembling the model's first instinct (candidates 1–2 never ship); a request naming a UI defect comes back fixed rather than described; floor violations arrive as measured values with the procedure that produced them; and loading, empty, error, and no-data states are designed before delivery instead of found in review.
