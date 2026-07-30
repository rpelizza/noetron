# Directory Layout

The `noetron/` directory, located at the repository root, is Noetron's workspace: the durable, versioned memory of the harness. Everything Noetron knows about the project that is not source code — documentation, task history, architectural decisions, plans, specs, configuration, and live task state — lives here.

## First-run detection

At the start of a session, check whether `noetron/` exists at the repository root:

- **It does not exist** → this is the first time Noetron is used in this repository. Run the setup flow and scaffold the layout below.
- **It exists but entries are missing** → treat it as an existing installation: create only the missing directories/files. Never overwrite existing content.
- **It exists and is complete** → setup is not needed; proceed normally.

## Layout

Create the structure exactly as follows:

```
noetron/
├── docs/       # Documentation for every feature in the project
├── history/    # Record of every task ever executed
├── adr/        # Architecture Decision Records
├── plans/      # Plans built together with the human
├── specs/      # Executable specifications derived from approved plans
├── setup/      # Harness configuration for this project
└── state.md    # Live state of the current task
```

## docs/

Stores the documentation of every feature that exists in the project, so any agent can understand a feature without re-reading the entire codebase.
See [Docs](./docs.md) for details.

## history/

Stores the record of every task ever executed — features, fixes, improvements, refactors, and so on — providing an audit trail of what was done and why.
See [History](./history.md) for details.

## adr/

Stores the Architecture Decision Records: every architectural decision, its context, and its consequences.
See [ADR](./adr.md) for details.

## plans/

Stores every plan produced together with the human. A plan captures the outcome of a planning conversation, before any execution starts.
See [Plans](./plans.md) for details.

## specs/

Stores the specifications that turn a previously discussed plan into an executable description of a task. A spec is what an agent picks up to actually do the work.
See [Specs](./specs.md) for details.

## setup/

Stores the project-level configuration of the harness: MCP servers, domain skills, the language the user communicates in, and any other project settings.
See [Setup](./setup.md) for details.

## state.md

Holds the live state of the task currently in progress: branch slug, branch, execution phase, isolation mode (inline, subagents, or agent team), commit strategy, the active plan and spec, project type (workspace, simple project, fullstack, frontend, backend, …), review strategy, and more.

Noetron updates this file in real time while the harness runs.
See [State](./state.md) for details.
