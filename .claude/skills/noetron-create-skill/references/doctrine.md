# Domain Skill Doctrine

The authoring rules every domain skill must follow. The creation loop in `SKILL.md` decides *when* to write; this file decides *how*.

## The description is the router

The frontmatter `description` is the only part of a skill the agent sees before deciding to read it. It carries the routing — nothing else.

- **Trigger conditions only.** State *when* to use the skill: situations, file paths, module names, domain terms, error messages, symptoms. Never summarize what the skill does or how its process works — a description that summarizes the workflow becomes a shortcut: the agent follows the description and never reads the body.
- Start with "Use when". Write in third person. Keep it under 500 characters.
- Include the concrete tokens a real task would contain: the paths (`src/billing/`), the domain words (`refund`, `talhão`), the symptoms ("totals off by one cent"). Triggering is string-level: if the task's words never appear in the description, the skill will not fire.
- Never overlap a sibling skill's triggers (see Graph rules in `SKILL.md`).

## Form matches the failure

Choose the skill's form from the gap classified in FRAME. The form that fixes one gap type backfires on another.

| Gap | Right form | Wrong form |
|---|---|---|
| Knowledge | Reference: tables, maps of the territory, worked examples. Plain clarity, no persuasion. | Imperatives and warnings around facts — noise that buries the content. |
| Technique | Numbered steps + one excellent worked example from this repo. | A pile of facts with no ordering, or prohibitions without the correct procedure. |
| Discipline | The rule stated absolutely, plus the specific rationalizations it forbids ("this case is simple", "just this once") and red flags for self-checking. | Soft guidance ("prefer…", "consider…") — it dissolves under pressure. |
| Output shape | A positive recipe: state what the output IS — its parts, in order. | A list of prohibitions; agents negotiate with "don't" when they have their own plan for the output. |

Two rules regardless of form:

- **No nuance clauses.** "…unless it matters" reopens the negotiation the rule existed to close. If the rule needs an exception, restructure it so the exception is outside the rule's reach.
- **State the positive.** Never write "don't X" without the "do Y instead" — a bare prohibition steers attention to X.

## Writing rules

- Imperative, second person, no hedging.
- **Anchor on a leading term.** Pick the domain's strongest word and repeat it exactly — never rotate synonyms. The repeated term is what binds invocation to execution.
- **One excellent example beats many.** Real code from this repository, commented for the *why*. No fill-in-the-blank templates, no invented scenarios.
- **Length is cost.** SKILL.md under ~200 lines; anything longer, or rarely needed, moves to `references/` and is linked with a one-line pointer saying *when* to load it.
- **Facts vs decisions.** Skills record what is decided. An open question belongs to the user — surface it; never resolve it with a silent default inside the skill.
- **Derive, don't enumerate.** Never hard-code counts or exhaustive lists that reality will outgrow ("the 7 services are…"); state where to look instead ("one service per directory under `services/`").
- Link `noetron/docs/`, ADRs, and sibling skills by relative path or exact name — never paste their content.

## Stack claims are version-anchored

When the skill covers a technology — a framework, library, SDK, or tool — external-technology facts follow `noetron-explore`'s rule at authoring time:

- Identify the **version actually in use** (manifest, lockfile) and cite it in the skill (e.g. `react 18.2.0 — package.json:6`).
- Every claim about the technology's behavior is confirmed against **context7 or official docs for that version** and carries that source — or it does not enter the skill. Conventions observed in the repository cite `file:line`; technology facts cite doc + version; **nothing cites memory**.
- context7 unreachable → official docs. Both unreachable → the claim is written as `(unconfirmed — verify against docs for <version>)` and the limitation is reported to the user. Silence about the limitation is the violation, not the limitation itself.

## Structure

Directory: `.claude/skills/<repo-name>-<skill-name>/` containing `SKILL.md`; add `references/` only for material over ~50 lines or rarely loaded.

Canonical sections, in order — omit any that would be empty:

1. **Purpose** — one or two lines.
2. **Territory** — the map: key paths and what lives where.
3. **Conventions** — how this domain does things.
4. **Invariants & traps** — what must always hold; what has bitten before.
5. **Verification** — how to prove work in this domain is correct (commands, checks).
6. **Related skills** — exact sibling names.
7. **Falsifiability footer** — close with `**This skill is working if:**` followed by two to four observable, second-order signals (properties of diffs, timing of questions, absence of the failure mode). Never first-order claims like "the agent reads the skill".

## Review checklist

Run before the trigger test; fix everything it catches.

- [ ] Description states triggers only — no workflow summary, no "what it does".
- [ ] Description contains the concrete tokens (paths, domain terms, symptoms) a real task would contain.
- [ ] Form matches the gap classified in FRAME.
- [ ] Every claim is grounded in the repository (EVIDENCE step) — no imagined conventions.
- [ ] No duplicated content from `noetron/docs/` or sibling skills — links instead.
- [ ] No nuance clauses; every "don't" has a "do instead".
- [ ] No hard-coded counts or lists that reality will outgrow.
- [ ] Related skills listed with exact names, each verified against `.claude/skills/`.
- [ ] No trigger overlap with any sibling description.
- [ ] SKILL.md under ~200 lines; overflow moved to `references/`.
- [ ] FRAME's failure mode is concrete — the skill names what goes wrong without it, not "general knowledge".
- [ ] If the skill covers a stack: the version in use is cited, and every technology claim carries a version-anchored source (context7/official docs) or an explicit `(unconfirmed)` mark — none from memory.
- [ ] Ends with the falsifiability footer: observable, second-order signals only.
