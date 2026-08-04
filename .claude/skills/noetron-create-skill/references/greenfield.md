# Greenfield Mode

How to write a domain skill for a repository whose domain code does not exist yet. Reached from
`noetron-plan`'s COVER step (step 9), which approves candidates from the stack the plan just ratified —
before the first line of that code is written.

Everything in `SKILL.md` still holds: grounding, one approval per skill, the read-in-full lock on edits,
the diff before writing, the trigger test, the sync. **Only the source of evidence moves.** The default
loop demands a `file:line` and a repository trap; in an empty tree that demand cannot be met, and the
loop deadlocks exactly where it is most useful.

## What changes, step by step

| Step | Existing repository | Greenfield |
|---|---|---|
| FRAME's concrete instance | a wrong assumption in this code, an inconsistency that exists, a trap that bit | a **default this pinned version overrules** — name the wrong move and the doc that rejects it |
| EVIDENCE | `file:line`, swept through `noetron-explore` | the **stack ratified in the plan**, at the version the plan pins, read through context7 for that version |
| Content | this project's conventions, as observed | the conventions **the stack imposes**, plus decisions the plan already ratified — nothing else |
| Territory | real paths | the paths the plan's slices will create, marked `(planned)` |
| Trigger test probe | a realistic task over existing paths | the plan's **first vertical slice**, phrased as the task about to be handed out |
| Catalog status | `active` | `doc-grounded`, until the first real diff re-grounds it |

## The admission rule gets stricter, not looser

A greenfield skill is not a tutorial for the framework. "React has hooks" and "Go has goroutines" are
documentation: they teach nothing an agent would get wrong, and they date faster than the lockfile.

What earns a greenfield skill is a **named wrong default**: the move an agent reaches for out of habit
that this exact version rejects, renamed, deprecated, or made a footgun. Write it as a pair —

> **Wrong by default:** `<what an agent would write>` · **In `<lib>@<version>`:** `<what the docs
> require>` — `<doc reference>`

If no such pair can be produced for a candidate, there is no skill yet. Put it under `## Pending` in
`.noetron/domain-skills.md` with the failure it is waiting for, and let the first real code produce the
evidence. A candidate parked with a reason is a debt; a skill written from memory is a liability that
routes.

## Invent nothing the project has not chosen

File layout, module boundaries, naming schemes, error conventions, test organization — these are
**decisions**, and until the plan ratifies them they belong to the user. A greenfield skill that
prescribes an unratified convention fills a user decision with a default, which the standing contract
names a violation, and does it in the one artifact every later task will read as settled.

Two sources are legitimate, and only two:

1. **The pinned version's documentation** — cite library, version, and doc reference.
2. **The plan's ratified decisions** — cite `plans/<file>#decisions`, never re-argued here.

Anything else is deferred. "Where the repository layer goes" with no ratified answer is a question for
`noetron-interview`, not a line in a skill.

## The trigger test, with a probe that can exist

The probe comes from the plan's **first vertical slice** — the walking skeleton — written as the task it
will be handed: the package, the framework, the endpoint or screen it produces, in the words this
project's users would use. That slice is chosen precisely because it runs first, so the probe measures
the routing that is about to happen rather than a hypothetical.

- **Fresh and read-only, unchanged.** The subagent reports what it *would* do; a proposed diff is the
  expected output when there is nothing to read.
- **Triggered** is judged as always: the skill was invoked before the substantive work.
- **Followed** is judged on the proposal: the doc-grounded rule visibly shaped the approach — the wrong
  default is absent, or the correct API appears where habit would have put the deprecated one.
- A probe answerable only by opening files that do not exist is not a probe. Rewrite it from the slice.

The three-round budget and its diagnoses are unchanged. One extra diagnosis applies here: *the probe
produced a generic answer that the skill would not have changed* → the skill is teaching documentation,
not a wrong default. Go back to the admission rule.

## Born marked, re-grounded on contact

The skill carries this line directly under its title, and its catalog row reads `doc-grounded`:

```markdown
> **Doc-grounded** — written <YYYY-MM-DD> from `<lib>@<version>` documentation, before any code
> existed in this territory. Re-ground at the first diff that lands here.
```

**Re-grounding is triggered, never swept.** `noetron-evolve` rejects refresh passes, and this is not
one: the marker is a debt with a named trigger, and the trigger is the first task that writes real code
in the territory. At that point EVIDENCE runs again against the repository, and each doc-grounded claim
resolves one of three ways:

| Outcome | Action |
|---|---|
| the code matches the claim | attach the `file:line`, drop the marker, catalog row → `active` |
| the code contradicts the claim | **stop and surface it** — the code and the plan disagree, and which one is wrong is the user's call, not an edit |
| the territory turned out different | the skill is mis-scoped; split or retire it through the normal path |

A skill still marked `doc-grounded` after its territory has real diffs is the failure this mode exists
to avoid on the other end: doc-shaped rules outliving the code that was supposed to confirm them.
