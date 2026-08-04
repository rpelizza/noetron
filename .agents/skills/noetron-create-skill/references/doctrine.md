# Domain Skill Doctrine

The authoring rules every domain skill must follow. The creation loop in `SKILL.md` decides *when* to write; this file decides *how*.

## The description is the router

The frontmatter `description` is everything the agent has when it decides whether to open the file. It carries routing and nothing else.

- **Conditions, not contents.** Say *when* the skill applies: situations, paths, module names, domain terms, error messages, symptoms. A description that summarizes the workflow becomes a substitute for it — the agent reads the summary, concludes it already knows the answer, and never opens the body. The summary that saved a read cost the whole skill.
- Open with "Use when". Third person. Under 500 characters.
- Load it with the tokens a real request actually carries: paths (`src/billing/`), domain words (`refund`, `talhão`), symptoms ("totals off by one cent"). Matching happens at the string level — words that never appear here never fire the skill.
- Keep the trigger surface disjoint from every sibling (see Graph rules in `SKILL.md`).

## Form follows the gap

FRAME classified what is missing; that classification picks the shape. A form that repairs one gap makes another one worse.

| Gap | Write it as | What fails instead |
|---|---|---|
| Knowledge | A reference the reader consults: tables, a map of the territory, worked examples. Flat, quiet prose. | Facts wrapped in urgency. The warnings crowd out the content the reader came for. |
| Technique | Ordered steps, plus one worked example taken from this repository and annotated for *why*. | Unordered facts, or a prohibition with no procedure to replace it — the reader is stopped without being redirected. |
| Discipline | The rule with no escape hatch, followed by the exact excuses that precede breaking it and the red flags for catching yourself. | "Prefer", "consider", "where appropriate". Under deadline pressure, soft verbs read as optional, because they are. |
| Output shape | A recipe stated positively: what the output *is*, part by part, in order. | A list of things not to do. An agent with its own plan for the output treats every "don't" as a boundary to route around. |

Two rules survive every form:

- **No nuance clauses.** "…unless it matters" hands the rule back for negotiation, which is what the rule was written to end. A rule that genuinely needs an exception is restructured so the exception falls outside its scope, never softened in place.
- **Every prohibition ships with its replacement.** "Don't X" alone leaves X as the only concrete thing in the reader's head; "do Y instead of X" leaves Y.

## Writing rules

- Imperative, second person, no hedging.
- **Fix the vocabulary.** Choose the domain's strongest term and reuse that exact string everywhere. Rotating synonyms for variety breaks the thread between the description that fired and the rule that has to be applied.
- **One example, chosen well.** Real code from this repository, annotated for the reasoning rather than the syntax. A second example rarely teaches what the first one missed; a placeholder template teaches nothing.
- **Length is a cost the reader pays.** SKILL.md under ~200 lines. Anything longer, or needed only occasionally, moves to `references/` behind a one-line pointer that says *when* to open it.
- **Record decisions; surface questions.** A skill states what has been settled. An unsettled question belongs to the user — name it and route it, because a default written into a skill is read as ratified by everyone downstream.
- **Point at the source, don't copy it.** Counts and inventories go stale the week after they are written ("the 7 services are…"); say where to look instead ("one service per directory under `services/`").
- Link the project's `docs/`, its ADRs, and sibling skills by relative path or exact name — never paste their content. The harness keeps no product documentation of its own; a skill that copies a doc creates the second source of truth `.noetron/` exists to avoid.

## Stack claims are version-anchored

When the skill covers a technology — a framework, library, SDK, or tool — external-technology facts follow `noetron-explore`'s rule at authoring time:

- Identify the **version actually in use** (manifest, lockfile) and cite it in the skill (e.g. `react 18.2.0 — package.json:6`).
- Every claim about the technology's behavior is confirmed against **context7 or official docs for that version** and carries that source — or it does not enter the skill. Conventions observed in the repository cite `file:line`; technology facts cite doc + version; **nothing cites memory**.
- context7 unreachable → official docs. Both unreachable → the claim is written as `(unconfirmed — verify against docs for <version>)` and the limitation is reported to the user. Silence about the limitation is the violation, not the limitation itself.

**In a greenfield skill there is no repository column.** Every line is either version-anchored or a plan decision cited as `plans/<file>#decisions` — those are the only two sources ([greenfield.md](./greenfield.md)). An `(unconfirmed)` line has nothing holding it up there, so it is dropped and the gap reported rather than marked. The skill also carries its `doc-grounded` line under the title, so the next reader knows what the claims rest on.

## Structure

Directory: `.claude/skills/<prefix>-<skill-name>/` containing `SKILL.md`; add `references/` only for material over ~50 lines or rarely loaded. The prefix comes from `.noetron/domain-skills.md`, never from the directory name.

Canonical sections, in order — omit any that would be empty:

0. **Grounding line** — greenfield skills only: the `doc-grounded` blockquote, directly under the title, before Purpose.
1. **Purpose** — one or two lines.
2. **Territory** — the map: key paths and what lives where. Greenfield marks each row `(planned)`.
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
- [ ] No content duplicated from the project's `docs/`, its ADRs, or a sibling skill — links instead.
- [ ] No nuance clauses; every "don't" has a "do instead".
- [ ] No hard-coded counts or lists that reality will outgrow.
- [ ] Related skills listed with exact names, each verified against `.claude/skills/`.
- [ ] No trigger overlap with any sibling description.
- [ ] SKILL.md under ~200 lines; overflow moved to `references/`.
- [ ] FRAME's failure mode is concrete — the skill names what goes wrong without it, not "general knowledge".
- [ ] If the skill covers a stack: the version in use is cited, and every technology claim carries a version-anchored source (context7/official docs) or an explicit `(unconfirmed)` mark — none from memory.
- [ ] Ends with the falsifiability footer: observable, second-order signals only.

For a **greenfield** skill, three instead of the repository-grounding item:

- [ ] Each rule names a wrong default and the pinned version's answer to it — no plain documentation.
- [ ] Nothing is prescribed that the plan has not ratified; ratified items cite `plans/<file>#decisions`.
- [ ] The `doc-grounded` line sits under the title and the catalog row matches it.

For an **edit**, three more, before it lands:

- [ ] The current file was read in full, and everything outside the named weakness survives verbatim — project-added rules, local examples, adjusted paths.
- [ ] The diff (real old and new lines, not a summary) was shown and approved for **this** skill alone.
- [ ] The catalog matches an actual listing of `.claude/skills/`, and `node scripts/sync-noetron.mjs --check` is clean.
