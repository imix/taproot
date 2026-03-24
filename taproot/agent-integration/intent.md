# Intent: Agent Integration

## Goal
Enable any AI coding agent to participate fully in the taproot workflow — through skills, commands, adapters, or whatever invocation mechanism the agent supports — without being tied to a specific agent's ecosystem.

## Stakeholders
- **Agentic developer / orchestrator**: needs to invoke requirement workflows through whichever AI agent they work with, using that agent's native interaction style
- **AI coding agents**: need executable definitions of how to perform each workflow step (create intent, define behaviour, implement, trace, validate, refine)
- **Tool integrators**: need a thin, predictable adapter mechanism to surface taproot capabilities in a specific agent environment

## Success Criteria
- The full requirement lifecycle (discover → intent → behaviour → implement → trace → validate → refine) is available to any supported agent
- Adding a new agent adapter does not require changing any core workflow definition
- Skills, commands, and workflows are defined once and surfaced through each agent's native mechanism (slash commands, rules files, chat triggers, etc.)
- Bootstrapping taproot in a new or existing project is supported for any target agent

## Constraints
- Workflow definitions must be plain markdown — no agent-specific syntax in the canonical definitions
- Per-agent adapters are thin delivery wrappers only; all workflow logic lives in the portable definitions
- Agent-specific behaviour (e.g. Claude Code hooks, Cursor rules format) is isolated to the adapter layer

## Behaviours <!-- taproot-managed -->
- [Generate Agent Adapter](./generate-agent-adapter/usecase.md)
- [Update Adapters and Skills](./update-adapters-and-skills/usecase.md)
- [Agent Support Tiers](./agent-support-tiers/usecase.md)
- [Agent-Agnostic Language Standard](./agent-agnostic-language/usecase.md)
- [Parallel Agent Execution](./parallel-agent-execution/usecase.md)
- [Autonomous Agent Execution](./autonomous-execution/usecase.md)
- [Configuration Discoverability](./configuration-discoverability/usecase.md)


## Status
- **State:** active
- **Created:** 2026-03-19
