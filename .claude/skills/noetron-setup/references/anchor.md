# Anchoring the contract

`CLAUDE.md` and `AGENTS.md` at the repository root are the harness's only guaranteed load point. The
harness ships neither file, so setup writes them — and because a user's own instructions may already
be there, the rule is append, never rewrite.

## What gets injected

The block in [`../assets/contract.md`](../assets/contract.md), **byte for byte, markers included**:
`<!-- noetron:contract -->` … `<!-- /noetron:contract -->`.

That asset is the harness contract that travels with `.claude/skills/`. In the Noetron source
repository the root `CLAUDE.md` holds the same block between the same markers; keeping the two
byte-identical is a sync job, and `diff` is its oracle.

Copy it with a file read, never by retyping. Three properties depend on byte equality: drift detection
in later sessions, a clean `diff` when the contract is revised, and the guarantee that no session
silently runs on a paraphrase of the rules.

## Why the whole contract, and not a pointer

The block carries the 1% rule, the authority boundary, the three gates, the unit of work, the
guardrails, and the untrusted-content rule. It is what replaces a bootstrap hook: a harness with no
executable runtime has exactly one place that is certain to be read every session, and this is it. A
three-line pointer saying "read the skills" only works if the model already decided to route — which
is the behavior the contract is there to cause.

## Idempotency, per file

Handle `CLAUDE.md` and `AGENTS.md` independently; either may exist without the other.

| Condition | Action |
|---|---|
| file absent | create it containing the block and nothing else |
| present, no `<!-- noetron:contract -->` | append the block at the end, preceded by one blank line |
| marker present, block identical to the asset | skip — nothing to do |
| marker present, block differs | report the drift and offer to replace **only** the marked block, leaving every other line untouched |
| legacy `<!-- noetron -->` … `<!-- /noetron -->` present | show the old block and the new one, and replace only on the user's word |

Never reorder, reformat, or reflow the rest of the file. Never merge the two files or make one a
symlink to the other: `AGENTS.md` exists precisely for runtimes that do not read `CLAUDE.md`.

## Re-sync later

A harness upgrade changes the contract. Any session may compare the marked block against the shipped
asset; a mismatch is reported to the user with the diff, and the replacement is a decision, not a
repair — the block is inside a file the user owns.

## The `H1` question

The block opens with `# Noetron`, which may become a second `H1` in a file that already has one. It
stays as shipped: any transformation, however cosmetic, breaks byte equality and turns drift detection
into a judgment call.

---

**This anchor is working if:** the marked block in any consumer matches `assets/contract.md` under
`diff`; re-running setup on an anchored repository changes no bytes; and no user-authored line in
`CLAUDE.md` was ever lost to an installation.
