# Taproot for Cursor

AI-driven specs, enforced at commit time. Code without traceability doesn't merge.

## What this plugin provides

- **26 skills** — each taproot workflow available as a `/tr-<name>` slash command
- **Rules** — taproot conventions injected as agent context when taproot files are open
- **Commands** — common actions available without knowing skill names

## Skills

All skills are thin launchers — invoking `/tr-<name>` directs Cursor's agent to load the full skill definition from `taproot/agent/skills/<name>.md` in your workspace. The skill file is the single source of truth; this plugin never duplicates content.

## Commands

| Command | Purpose |
|---------|---------|
| Initialize | Start the taproot onboarding walkthrough |
| Status | Show coverage dashboard |
| Route Requirement | Route a natural language requirement to the hierarchy |
| Report Bug | Diagnose a defect through root cause analysis |
| Build Plan | Build a prioritised implementation plan |

## Prerequisites

- Node.js installed
- Taproot CLI: `npm install -g @imix-js/taproot` or use via `npx`
- A taproot hierarchy in your project (`taproot init` to create one)

## Source

Plugin generated from [taproot](https://github.com/imix/taproot) via `scripts/build-cursor-plugin.ts`.
Re-run the build script after upgrading taproot to pick up new or renamed skills.
