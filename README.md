# dsh-subagent-panel

Render every subagent as a clickable card in the DSH Web conversation that opens
the child as an ordinary session — OpenCode-style subagent visibility, without
re-rendering the shell's session view.

## What you get

**1. Inline card** — the generic `subagent` / `subagent_fork` tool row becomes a
card showing the delegated task, a live status badge (running / idle), the child
id, elapsed time, and whether the child spawned nested subagents. Click it to
navigate to that subagent's session.

**2. Sidebar trigger** — a floating pill (bottom-right) counting this session's
subagents, with a dot while any are running. Click to list them all; click a row
to navigate to that session.

Opening a subagent calls `sessions.openSubagent(address)` — the same navigation
the session header's subagent catalog uses — so the child renders in the shell's
own conversation view. This plugin draws no transcript of its own: the shell
already renders a session better than a plugin can.

## Install

```bash
dsh plugin --profile web add link:/path/to/dsh-subagent-panel
dsh web
```

`link:` keeps the install pointing at the source tree, so edits take effect after
a rebuild and a page refresh.

You can also install straight from git:

```bash
dsh plugin --profile web add github:BiKing567/dsh-subagent-panel
```

## Requirements

- DSH with the Web client (developed against `dsh` `0.1.0-rc.6`).
- The client packages are **optional** peer dependencies — they are injected by
  the harness at runtime, not installed into this package. The plugin needs:
  - `@deepseek-ai/dsh-client-runtime` — for `ctx.sessions` and the subagent catalog
  - `@deepseek-ai/dsh-client-locale` — for the bilingual dictionaries
  - `@deepseek-ai/dsh-client-ui-tool` — for the `tool.call.toolview` slot
- The APIs used (`sessions.openSubagent`, `subagentsByParent`,
  `SubagentAddress`) exist from `@deepseek-ai/dsh-client-runtime` `0.0.1-rc.1`
  onward. The peer range is intentionally `*` because 0.x `^` ranges do not span
  minor versions, so a pinned `^0.1.0-rc.6` would fail to resolve against any
  other release line.

## Build

```bash
npm run build     # src/client -> lib/client.js
```

The host half (`lib/index.js`) is plain ESM and needs no build.

## Configuration

In the cordis row:

```yaml
- id: dsh-subagent-panel
  name: 'dsh-subagent-panel'
  config:
    maxMessages: 500      # max rows rendered by the /subagents command
```

## How it works

- **Inline card** registers into `tool.call.toolview` keyed by wire tool name.
  The slot is keyed and `subagent` / `subagent_fork` are unclaimed, so this
  plugin owns those rows instead of shadowing anything.
- **Trigger** registers into `shell.overlay`, the additive frame-wide floating
  layer.
- **Data** comes from the catalog `ctx.sessions` already projects
  (`subagentsByParent`). The plugin defines no custom RPC and parses no session
  logs — the `subagents` service stays the single authority for parent/child
  association.
- **Card → child identity**: once the call settles, the rendered text carries the
  id (`started subagent <id>`), which is matched against the catalog to find the
  entry (and its `mode`, which `openSubagent` validates). While the call is still
  running there is no catalog entry yet, so the card shows the task description
  and stays inert rather than guessing which child this call started.

## Host command

`/subagents` lists the current session's direct children with status, mode, and
label.
