---
name: noetron-evolve
description: Use when the user asks to review, update, or evolve the project's domain skills; when noetron-finish's closeout finds ten or more completed tasks since the last review marker; or when a skill's falsifiability signals show it is not working.
---

# Noetron Evolve

The harness's self-improvement loop: **weakness mining → minimal proposal → regression validation → ratified adoption**. Autonomy lives in the mining and the validation; the human holds the adoption gate — to gain autonomy, strengthen the oracle, never loosen the gate.

## Scope

- **Domain skills (`<prefix>-*`)**: the full loop — mine, propose, validate, and (once ratified) edit through `noetron-create-skill`'s edit path.
- **Harness skills (`noetron-*`)**: mine and **propose only**. The proposal is recorded for the user to carry to the harness source repository — never edit a `noetron-*` skill inside a consumer project.

## Cadence

- `noetron-finish` offers this skill at closeout when **ten tasks** have completed since the last review marker (history entries after the marker in `noetron/setup/domain-skills.md`). The offer never blocks.
- On demand, any time the user asks.

## The loop

### 1. MINE — weaknesses from evidence, never from vibes

All sources read via `noetron-explore`:

- `noetron/history/` entries since the marker: rework, corrections of corrections, decisions that had to be made twice, recorded deviations.
- Git since the marker: reverts, "fix the fix" commits, files touched repeatedly for the same reason.
- **Falsifiability footers as sensors**: every domain skill declares *"this skill is working if"* — check each signal against what actually happened. A skill whose signals did not move (or moved backwards) is a candidate. A skill whose territory saw no activity is quiet, not defective.

Every weakness cites the history entry, commit, or signal that shows it.

### 2. PROPOSE — minimal, tied to the failure

- One proposal per weakness: the **smallest edit** that addresses it — a sharpened trigger, a new trap line, a corrected convention. Never a blind refresh; never a rewrite because "it could be better".
- New territory found without a skill → propose creation (create-skill's normal loop).
- A skill whose failure mode stopped existing → propose retirement.
- A weakness in a `noetron-*` skill → a written proposal addressed to the source repo, nothing more.

### 3. VALIDATE — regression before presentation

Every proposed domain-skill edit is validated **before the user sees it**: run the trigger test (create-skill's protocol) against the edited draft — red-green where the weakness allows it (the old failure scenario now handled; the triggers still fire). A proposal that fails its own validation is reworked or dropped, never presented.

### 4. ADOPT — ratified, never autonomous

Present the proposals with their evidence and validation results, one decision at a time where they depend on each other (interview cadence). Ratified → apply via create-skill's edit path, update the catalog, **advance the marker**. Declined → record the decline: a declined proposal that keeps resurfacing is itself a signal worth surfacing.

## The marker

`noetron/setup/domain-skills.md` carries a `## Last review` section: the date and the most recent history entry considered. The counter `noetron-finish` checks is the number of history entries after it.

## Red flags

- A proposal not tied to a named weakness with evidence.
- Refreshing a skill "to keep it current" with no failure behind it.
- Editing a `noetron-*` skill inside a consumer project.
- Presenting a proposal that was never validated.
- Adopting anything without ratification.
- Treating quiet territory as a defect.

## Integration

- `noetron-finish` — offers the cadence at closeout.
- `noetron-explore` — every piece of mining evidence.
- `noetron-create-skill` — the edit, creation, and retirement mechanics, and the trigger test.
- `noetron-interview` — ratification of each adoption; recurring declined proposals are decisions to revisit.
- `noetron-verify` — validation results are claims and carry their evidence.

---

**This skill is working if:** domain skills change only in response to evidenced weaknesses; the same rework pattern stops appearing twice in `noetron/history/`; every adopted edit arrived pre-validated; and the review marker advances roughly every ten closed tasks instead of never.
