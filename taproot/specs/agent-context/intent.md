# Intent: Agent Context

## Goal
Give AI coding agents a live, navigable map of the codebase — what is implemented where, and why — so they can reason about code in the context of the requirements it fulfils.

## Stakeholders
- **AI coding agents**: need to locate relevant source files, understand the intent behind code, and avoid implementing things that already exist
- **Agentic developer / orchestrator**: needs agents to operate with full situational awareness rather than treating the codebase as an undifferentiated blob of code

## Success Criteria
- An agent can navigate from a business intent down to the source files that implement it
- An agent can navigate from a source file up to the behaviour and intent it belongs to (via `/tr-trace`)
- The context is machine-readable and stays current as the codebase evolves

## Constraints
- Context must be derivable from the hierarchy itself — no manual curation step
- Must work with any AI agent that can read files (not Claude-specific)
- Bottom-up navigation (source file → intent) is supported by the `/tr-trace` skill; OVERVIEW.md and CONTEXT.md provide top-down orientation only

## Behaviours <!-- taproot-managed -->
- [Generate Agent Context File](./generate-context/usecase.md)
- [Generate Project Overview](./generate-overview/usecase.md)
- [Trace Requirement Hierarchy](./trace-hierarchy/usecase.md)


## Status
- **State:** active
- **Created:** 2026-03-19
