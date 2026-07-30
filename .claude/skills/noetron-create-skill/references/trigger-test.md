# Trigger Test

The VERIFY gate that proves a domain skill actually fires and shapes behavior. A skill that never triggers is dead weight in the catalog — this test is not optional.

## Protocol

1. **Write the probe task.** A realistic, small task in the skill's domain — a bug fix, a small feature, a question — phrased the way the project's users actually phrase requests. The probe must **not** name the skill, and should naturally contain some of the tokens the description relies on (that is what makes it realistic, and what makes the test honest).
2. **Dispatch a fresh subagent.** Use the harness's subagent mechanism with a clean context: the probe task, the repository, and nothing from this conversation. The subagent must discover the skill through normal routing, not because it was told about it.
3. **Judge the result** against both pass criteria:
   - **Triggered:** the subagent invoked/read the skill before substantive work on the task.
   - **Followed:** at least one of the skill's rules visibly shaped the output (a convention followed, a trap avoided, the verification run).

Both criteria met → the test passes; proceed to REGISTER.

## Failure diagnosis

| Symptom | Likely cause | Fix |
|---|---|---|
| Skill never invoked | Description lacks the concrete tokens present in real tasks | Add the paths, domain terms, and symptoms from the probe to the description |
| Skill invoked, rules ignored | Description summarizes the workflow (agent thinks it already knows), or the key rule is buried deep in the body | Cut the summary from the description; raise the rule to the top of its section |
| A different skill invoked | Trigger overlap between siblings | Sharpen both descriptions until the probe has one obvious owner |
| Subagent invents conventions instead | Body is abstract — no real examples to anchor on | Replace abstractions with the worked example from EVIDENCE |

## Round budget

Each failed test consumes one round: diagnose, adjust, dispatch a **new** fresh subagent (never reuse one that has seen the skill discussed). **After 3 failed rounds, stop.** Escalate to the user with: the probe task, the three diagnoses, and what was changed each round. Three failures usually mean the skill is mis-scoped (wrong granularity, wrong domain boundary) — that is a framing decision, and framing decisions belong to the user.
