---
name: noetron-explore
description: Use when a task needs facts about the repository or workspace — where something lives, how a flow works, which patterns exist, what a change would touch — before asking the user anything or proposing any approach; also when the user asks to explore, map, or survey the project.
---

# Noetron Explore

The harness's facts engine. Questions of fact are never sent to the user and never answered from memory: they are answered here, from the repository, with evidence.

## Facts, inferences, decisions

- A **fact** is verifiable in the repository (code, tests, manifests, lockfiles, git history, the `noetron/` workspace) or in official documentation for the version actually in use. Facts are discovered, never asked.
- An **inference** is a conclusion the evidence does not directly state. Label it as an inference; when it is material, confirm it — with more evidence, or with the user.
- A **decision** changes product, scope, UX, architecture, data, security, cost, or acceptance. Decisions are never made here — they go to `noetron-interview`.

## Modes

| Mode | Trigger | Output |
|---|---|---|
| Question | a specific factual question blocks the current work | the answer, with evidence |
| Survey | a task needs the lay of the land — a new area, planning, a multi-project workspace | a structured report of the territory |

## Evidence contract

Every fact carries its source: `file:line`, a command plus its actual output, or a doc reference with the version. Output separates **Facts / Inferences / Unknowns**. Unknowns that are decisions route to `noetron-interview`; unknowns that are investigable become tasks in the flow, not questions to the user.

## How to explore

1. Start from what already summarizes: the `noetron/` workspace (state, setup, docs, adr, history), domain skills (`<repo-name>-*` — read the ones covering the territory first), manifests, READMEs. Then code and tests.
2. Read targeted, not wholesale: follow the task's own tokens — names, paths, error messages.
3. For external technology facts, identify the version actually in use first (manifest, lockfile), then consult context7 or official docs **for that version**. Never answer library questions from memory.
4. For heavy sweeps, dispatch a read-only subagent when the harness offers one — it keeps the coordinator's context clean; explore inline otherwise.
5. Read-only, always: exploring never creates, edits, or deletes anything.

## Stop condition

Stop when the blocking question is answered with evidence, or when additional reading stops changing the answer. Do not build a full map when one fact was needed — and do not answer "probably" when one more read would make it certain.

## Related skills

- `noetron-interview` — where unknowns that are decisions go.
- `noetron-create-skill` — its EVIDENCE step runs through this skill.
- `noetron-plan` — its EXPLORE step and chain classifier run here.

---

**This skill is working if:** factual questions stop reaching the user; answers cite `file:line` or command output instead of "probably"; and interviews end up containing only decisions.
