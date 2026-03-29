# Research: Taproot Distribution Channels

- **Last updated:** 2026-03-26
- **Topic:** How to distribute taproot beyond npm — VS Code extension, Homebrew, JetBrains, MCP, GitHub Actions

## Local sources
- `taproot/taproot-distribution/intent.md` — existing distribution intent scoped to npm + GitHub releases only; no editor plugins or alternative channels
- `research/agents/cursor.md` — Cursor is IDE-primary; no headless/scripting interface; adapter must be a Cursor Rule triggered on session start
- `research/agents/windsurf.md` — same pattern as Cursor; 5-agent parallelism cap; no scripting
- `research/agents/claude-code.md` — CLI-first (`claude -p`); VS Code extension exists as a thin subprocess wrapper
- `taproot/OVERVIEW.md` — `agent-integration` intent already covers adapters for multiple agents; `generate-agent-adapter` is implemented

## Web sources
- **VS Code Extension Publishing** (code.visualstudio.com/api/working-with-extensions/publishing-extension) — `vsce` tool; extension shells out to CLI binary; two registries: VS Marketplace + Open VSX (for VSCodium/Gitpod). One-click install for millions of VS Code users.
- **Multi-channel monorepo case study** (dev.to/yurukusa — "I Distributed My VS Code Extension as a GitHub Action, npm Library, and MCP Server") — single codebase producing npm CLI + VS Code extension + GitHub Action + MCP server as thin wrappers over shared core. Key pattern: shared npm package, thin platform-specific wrappers.
- **Homebrew tap** (docs.brew.sh/Taps + homebrew-npm-noob) — auto-generated from npm registry tarball; installs Node as dependency; macOS/Linux only; SHA must update each release. `homebrew-npm-noob` can generate the formula automatically.
- **JetBrains plugin** (plugins.jetbrains.com) — Kotlin/Java wrapper spawning CLI subprocess; covers 10+ JetBrains IDEs; review process days/weeks. Real-world precedents: Gemini CLI Companion, OpenCode Companion, Claude Code plugin.
- **npx vs global install consensus 2025** (blog.jim-nielsen.com, arpadt.com, oneuptime.com) — npx for on-demand/scaffolding; global install for daily-driver tools. Publish to npm regardless; users choose install mode.

## Key conclusions
- **npm is the foundation** — already done (`@imix-js/taproot` v0.4.0). Both `npx` and `npm -g` flows depend on it.
- **VS Code extension is highest-leverage next channel** — largest editor audience; thin wrapper shelling out to the CLI binary; Claude Code itself follows this exact pattern.
- **Open VSX must be published alongside VS Marketplace** — covers VSCodium, Gitpod, and other forks; same artifact, second publish target.
- **Homebrew tap is low-effort** — `homebrew-npm-noob` auto-generates the formula; SHA update on each release is the only ongoing maintenance. macOS/Linux only.
- **JetBrains plugin is the enterprise channel** — high reach (IntelliJ, PyCharm, GoLand, Rider) but requires Kotlin and a review cycle. Low urgency vs VS Code.
- **MCP server is an emerging distribution channel** — directly relevant to taproot's AI-agent audience; Claude Code marketplace, Cursor MCP support. Wrapping taproot CLI commands as MCP tools is architecturally clean.
- **GitHub Action is a CI/CD distribution channel** — wraps npm package; enables taproot hierarchy validation in PR pipelines. High value for team adoption.
- **taproot's existing `agent-integration` intent already models "adapters"** — a VS Code extension is architecturally similar; can be framed as a new adapter tier.

## Open questions
- Should the VS Code extension be a simple "open terminal + run slash command" wrapper, or should it provide native UI (tree view, inline spec previews, status bar item)?
- Is the npm package name (`@imix-js/taproot`) intended for long-term distribution, or will it be renamed to a more discoverable `taproot` or `@taproot/cli`?
- Should MCP server distribution be a separate intent, or folded into the existing `agent-integration` intent?
- Does a Homebrew tap require a separate public GitHub repo (per Homebrew convention `homebrew-taproot`), and is that acceptable overhead?

## References
- VS Code Publishing Docs — https://code.visualstudio.com/api/working-with-extensions/publishing-extension (accessed 2026-03-26)
- Complete Guide: Publishing VS Code Extensions to Both Marketplaces — https://dev.to/diana_tang/complete-guide-publishing-vs-code-extensions-to-both-marketplaces-4d58 (accessed 2026-03-26)
- Eclipse Open VSX — https://www.eclipse.org/community/eclipse_newsletter/2020/march/1.php (accessed 2026-03-26)
- Multi-channel distribution case study — https://dev.to/yurukusa/i-distributed-my-vs-code-extension-as-a-github-action-npm-library-and-mcp-server-all-in-one-1m88 (accessed 2026-03-26)
- Homebrew Taps Docs — https://docs.brew.sh/Taps (accessed 2026-03-26)
- Node for Formula Authors — https://docs.brew.sh/Node-for-Formula-Authors (accessed 2026-03-26)
- homebrew-npm-noob — https://github.com/zmwangx/homebrew-npm-noob (accessed 2026-03-26)
- JetBrains Marketplace — https://plugins.jetbrains.com/ (accessed 2026-03-26)
- Gemini CLI Companion Plugin — https://plugins.jetbrains.com/plugin/29336-gemini-cli-companion/ (accessed 2026-03-26)
- OpenCode Companion Plugin — https://plugins.jetbrains.com/plugin/30006-opencode-companion (accessed 2026-03-26)
- npx vs global install (freecodecamp) — https://www.freecodecamp.org/news/npm-vs-npx-whats-the-difference/ (accessed 2026-03-26)
- Local CLI Tools in Node Projects 2025 — https://blog.jim-nielsen.com/2025/local-cli-tools-in-node/ (accessed 2026-03-26)
