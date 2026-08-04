---
name: noetron-preferences
description: Use when writing or changing anything a project will keep — code, tests, configuration, commit messages, logs, or user-facing text — and when the user states a lasting preference about how work should be done.
---

# Noetron Preferences

The global behavior floor beneath every task that produces content. It ships with the harness; the project's own record (`.noetron/profile.md`) captures what this user decided — and **project preferences prevail over this floor** wherever they conflict. A lasting preference stated mid-task gets recorded there (propose-confirm), never just obeyed once and forgotten.

## Code & interface hygiene

- **No emojis or emoticons** in code, comments, commit messages, logs, or interface text — unless the product itself uses them by explicit user decision recorded in the project's preferences.
- No commented-out code left behind: delete it (git remembers). Pre-existing commented-out code follows the orphan rule — report, don't touch.
- Naming follows the repository's existing idiom — consistency beats personal preference (the surgical doctrine, applied to names).

## DRY with judgment

- Extract on the second or third real duplication of **knowledge** — a rule, a contract, a constant's meaning — never on superficial text similarity.
- Never abstract ahead of need: an abstraction for single-use code is the failure mode, not the virtue (`noetron-plan`'s YAGNI check governs the other half of this rule).
- When two copies must intentionally stay in sync and extraction doesn't fit, leave a constraint comment naming the twin — silent duplication is a future bug.

## Production-ready by default

- Configuration, dependencies, and integrations are set up as they would ship: versions pinned, real settings, correct permissions and connections — no dev-only shortcuts that will need redoing later.
- A new dependency needs a pinned version and a present need that justifies it (and `noetron-security`'s dependency check when it applies).
- When speed and production robustness genuinely trade off, surface the trade-off and recommend the production-ready side — the user decides.

## Portability

- Scripts and commands work on the platforms the project actually targets — never assume a POSIX shell in a Windows repo or vice versa. When a command differs per platform, write the portable form, or both forms, explicitly.
- No user-specific absolute paths in committed files.

## Documentation & user-facing text

- Docstrings are welcome on public APIs: what it does, parameters, returns, errors.
- Comments state constraints the code cannot show — never narrate what the next line does or how the code came to be.
- User-facing text (UI, errors, CLI output) is written in the product's language (`.noetron/profile.md`); error messages are actionable — what failed and what to do about it.
- Logs carry no sensitive data (`noetron-security`), no emojis, and stay grep-able.

## Precedence

1. The user's explicit instruction in the conversation.
2. The project's recorded preferences (`.noetron/profile.md`).
3. Domain skills' conventions, inside their territory.
4. This floor.

A material conflict between levels is surfaced (`noetron-interview`), never silently resolved.

## Red flags

- An emoji in a diff, a commit message, or a log line.
- A helper extracted for its single caller.
- "Works on my machine" configuration committed.
- A comment explaining what the next line does.
- Obeying a stated lasting preference once, without proposing to record it.

## Integration

- `noetron-setup` — records the project preferences that override this floor.
- `noetron-interview` — material preference conflicts are decisions.
- `noetron-review` — the quality lens holds this floor on every diff.
- `noetron-plan` — YAGNI governs the abstraction half of DRY.
- `noetron-security` — the data rules behind the logging floor.

---

**This skill is working if:** diffs stop containing emojis and commented-out code; abstractions appear at the second real duplication instead of the first anticipation; committed configuration runs in production unchanged; and stated preferences turn up recorded in `.noetron/profile.md` instead of being re-stated by the user.
