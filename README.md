# agent-state-sync

`agent-state-sync` is a local-first CLI foundation for syncing agent work state
across tools. The long-term goal is to ingest state from configured sources,
normalize it into a canonical local store, compare or merge changes, and produce
handoff bundles that can move between agents.

## Phase 1 status

Phase 1 is the project foundation. The repository currently includes the
TypeScript package setup, schema and configuration building blocks, SQLite client
plumbing, tests, and CLI command names.

The `agent-sync` CLI can parse arguments, print help, recognize the current
commands, and dispatch to command handlers when they are wired in by callers.
The shipped commands are not fully implemented yet: recognized commands without
handlers return not-implemented behavior until later phases.

Current command names:

- `pull`
- `status`
- `diff`
- `bundle`
- `apply`

Adapter integrations, merge behavior, source freshness reporting, and bundle
workflows are planned for later phases.

## Local development

Use Node.js 24 with npm.

Install dependencies:

```sh
npm install
```

Run local validation:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Build and smoke-test CLI help:

```sh
npm run build
node dist/cli.js --help
```

## Branch flow

Use `develop` as the integration branch for Phase 1 work. Promote completed
phase baselines to `main` when they are ready to serve as the stable reference
for the project.
