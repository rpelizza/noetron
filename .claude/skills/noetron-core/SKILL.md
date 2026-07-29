---
name: noetron-core
description: Use when starting any conversation — establishes how to discover, evaluate, and use skills, requiring the correct applicable skill or combination of skills to be invoked before ANY response, including clarifying questions.
---

<DELEGATED-AGENT-STOP>
If you are a subagent assigned to execute a specific task or an agent within a team assigned to execute a specific task **IGNORE THIS SKILL**.

This exception applies ONLY to agents that received a task delegated by another agent (subagents or members of an agent team). If you are executing work inline — without a task having been delegated to you by another agent — this exception is discarded and you MUST follow this skill in full.
</DELEGATED-AGENT-STOP>

<EXTREMELY-IMPORTANT>
If there is any plausible possibility—even the slightest—that one or more skills may be relevant, applicable, or beneficial to the task you are performing, you **MUST immediately invoke and read the appropriate skill or skills before proceeding**.

When a skill applies, its use is mandatory. You have **no discretion** to ignore it, postpone it, replace it with your own judgment, or apply only the parts you prefer.

You MUST NOT skip skill invocation because:

- The task appears simple, obvious, familiar, or urgent.
- You believe you already know what the skill contains.
- You have successfully completed similar tasks before.
- Invoking the skill seems unnecessary, repetitive, or inefficient.
- You believe your own reasoning or experience is sufficient.
- You want to ask a clarifying question first.
- You intend to consult the skill later.

The applicable skill or skills must be invoked **before any substantive task-related action**, including:

- Responding to the user.
- Asking clarifying questions.
- Creating a plan.
- Making decisions or assumptions.
- Using tools.
- Reading or modifying code or files.
- Delegating work to another agent.
- Producing partial or final output.

If multiple skills may apply, you MUST invoke all relevant skills and follow them in the appropriate order.

If you are uncertain whether a skill applies, that uncertainty is itself sufficient reason to invoke it. **When in doubt, invoke the skill.**

After invoking a skill, you MUST follow its instructions precisely and completely. Merely reading or mentioning the skill does not satisfy this requirement.

This rule is absolute and non-negotiable. You may not invent exceptions, minimize applicability, or rationalize your way around it. Do not proceed until every applicable skill has been invoked and its instructions have been incorporated into your execution.

The only exception is when a higher-priority instruction or the skill’s explicit scope states that it must not be used.
</EXTREMELY-IMPORTANT>
