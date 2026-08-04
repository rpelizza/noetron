# Trigger Test

The VERIFY gate that proves a domain skill actually fires and actually changes what an agent does. A
skill nothing routes to is weight in the catalog and nothing else; a skill that routes and leaves the
output unchanged is ornament. The test is mandatory on creation and again on every edit — one reworded
description is enough to break routing without touching a rule.

## Protocol

### 1. Write the probe

A small, realistic task in the skill's territory — a bug, a small feature, a question — worded the way
this project's users actually word requests.

- **Never name the skill**, its file, or the existence of skills at all. "Use the billing skill to fix
  the refund total" measures obedience to the prompt, not routing.
- Carry the tokens a genuine request would carry: paths, domain words, symptoms. Those tokens are what
  the description bet on, so they are what the test has to put on the table.
- Build in one right way and one tempting wrong way — the wrong way being what the skill exists to
  prevent. With no wrong way available, *followed* has nothing to measure and every run passes.

### 2. Dispatch a fresh, read-only subagent

- **Fresh:** clean context — the probe and the repository, nothing carried over from this
  conversation. The agent has to find the skill the way a real session would. An agent that already
  watched the skill being written can only confirm what it read; its verdict measures nothing.
- **Read-only:** it investigates, decides, and reports what it *would* do — a proposed diff is the
  right output. It writes nothing, because the test measures routing and shaping rather than
  implementation, and a probe that edits files dirties the tree the skill is being authored in.

### 3. Judge against both criteria

| Criterion | Passes when | Evidence |
|---|---|---|
| **Triggered** | the subagent invoked and read the skill **before** substantive work | the invocation appears in its transcript, ahead of the analysis |
| **Followed** | at least one rule **visibly shaped** the output | a convention applied, a trap sidestepped, the verification recipe named — pointed at in the output |

**Both, or the test failed.** Triggered-but-not-followed is not half a pass: it has its own diagnosis
and its own fix, and shipping on it puts a skill in the catalog that costs a read and buys nothing.
Nor does quoting the skill count as followed — the output has to be something an agent without the
skill would not have produced.

## Failure diagnosis

| Symptom | Likely cause | Fix |
|---|---|---|
| Skill never invoked | the description is missing the tokens real tasks carry | move the probe's paths, domain terms, and symptoms into the description |
| Invoked, rules ignored | the description summarized the workflow, so the agent stopped there — or the decisive rule is buried mid-section | strip the summary out of the description; lift the rule to the top of its section |
| A sibling fired instead | the two trigger surfaces overlap | sharpen both descriptions until this probe has exactly one plausible owner |
| Conventions invented on the spot | the body is abstract, offering nothing to copy | swap the abstraction for the worked example collected in EVIDENCE |
| One probe passes, the next fails | the skill straddles two domains | split it, and frame each half on its own failure mode |
| A greenfield probe gets a generic answer | the skill teaches documentation, not a wrong default | return to the admission rule in [greenfield.md](./greenfield.md) |

## Batch creation

Several skills in one pass: **write all of them, then probe**. Sibling overlap does not exist until
both siblings do, and the classic batch defect — two descriptions competing for one task — is
invisible while only one is on disk. Each skill still earns its own probe and its own verdict.

## Greenfield probes

With no code to point at, the probe comes from the plan's **first vertical slice**, written as the
task about to be handed out. Everything else is unchanged — fresh, read-only, both criteria, three
rounds — and *followed* is read off the proposed approach: the deprecated call absent, the pinned
version's API where habit would have put the old one. A probe that can only be answered by reading
files that do not exist yet is not a probe; rewrite it from the slice. Details in
[greenfield.md](./greenfield.md).

## Round budget

One failure, one round: diagnose, adjust, dispatch a **new** fresh subagent. **Three failed rounds
end the loop** — escalate through `noetron-interview` with the probe, the three diagnoses, and what
changed between them. Failing three times usually means the granularity or the domain boundary is
wrong, and that is a framing decision the user owns; a fourth iteration is just a slower way to reach
the same conversation.
