# Template: noetron/setup/

Project-level configuration of the harness — one file per subject, so future skills read only what they need.

## Scaffold

`noetron-setup` creates the four files below. Fill them with the real outcomes of the setup conversation — never with placeholders.

### noetron/setup/README.md

```markdown
# Setup

Project-level harness configuration, one file per subject:

- `preferences.md` — user language and stated preferences
- `mcp.md` — MCP server decisions
- `domain-skills.md` — domain-skill catalog and pending creations
```

### noetron/setup/preferences.md

```markdown
# Preferences

**Language:** <language the user communicates in>

## Stated preferences
- <project-level preference the user stated during setup or later tasks>

Project preferences recorded here override the harness floor (`noetron-preferences`).
```

### noetron/setup/mcp.md

```markdown
# MCP servers

| Server | Status | Scope | Date |
|---|---|---|---|
| context7 | installed / already present / declined | project / user / — | YYYY-MM-DD |
| playwright | installed / already present / declined | project / user / — | YYYY-MM-DD |

Notes: <e.g. API key configured for context7 (never record the key itself); reason a
server was declined>
```

### noetron/setup/domain-skills.md

```markdown
# Domain skills

Prefix: `<prefix>` — derived from the project's manifest name at setup and confirmed by the
user. All domain skills are named `<prefix>-<skill-name>` in `.claude/skills/`. This file is
the authority for the prefix; it is never re-derived from the directory name.

## Catalog
| Skill | Domain | Status |
|---|---|---|
| <repo>-<name> | <what it covers> | active |

## Pending
Approved by the user, awaiting `noetron-create-skill`:
- <repo>-<name> — <domain it will cover>
```

## Rules

- Update these files whenever the corresponding decision changes: a new MCP server, a domain skill created or retired, a language change.
- Never store secrets here (API keys, tokens) — record only that they are configured, and where.
