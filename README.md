# agent-memory-layer

> Local-first project memory for AI agents. Git-aware, MCP-native, zero-config.

## Problem

AI agents forget everything between sessions. You type the same context reminders every time. `context.md` files drift out of sync. Beads hit 22k⭐ in days proving massive demand.

## Solution

`agent-memory-layer` gives AI coding agents persistent, company-grounded memory that lives **in the repo, alongside the code**. No cloud dependency, no RAG complexity, no manual context management.

## Features

- 🗂️ **Local-first** — memory stored as `.agent-memory/index.json` + `.agent-memory/memory.md` in the repo
- 🔗 **Git-aware** — extract decision context from commit history
- 🔌 **MCP-native** — works with Claude Code, Cursor, Windsurf via the MCP protocol
- ⚡ **Zero-config init** — `agent-memory init` in any repo

## Install

```bash
npm install -g agent-memory-layer
```

## Quick Start

```bash
# Initialize in any project
agent-memory init

# Start MCP server (for Claude Code / Cursor / Windsurf)
agent-memory start
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `get_memory` | Retrieve all conventions, decisions, patterns |
| `add_convention` | Add a naming rule, style, or architectural pattern |
| `add_decision` | Record an architectural decision or trade-off |
| `add_pattern` | Add a reusable solution template |
| `get_commits` | Get recent Git commits for context extraction |

## Architecture

```
.agent-memory/
├── index.json   # Structured memory (conventions, decisions, patterns)
└── memory.md    # Human-readable markdown log
```

## Tech Stack

- TypeScript / Node.js
- MCP SDK
- simple-git
- commander.js

## Status

MVP — 30-day scope. Works with Claude Code, Cursor, and Windsurf via MCP.

---

MIT License
