# UseCase: Extract Next Implementable Slice

## Actor
Agentic developer / orchestrator (human who asks the agent to plan the next work item)

## Preconditions
- The taproot hierarchy has at least one intent with one or more behaviours defined via `usecase.md`
- At least one behaviour has no corresponding `impl.md` (unimplemented) or has an `impl.md` with `state: in-progress`
- The developer wants to know what to implement next

## Main Flow
1. Developer asks the agent to identify the next thing to implement (e.g. "what should I work on next?") or explicitly invokes `/tr-implement` on a specific behaviour
2. Agent scans the hierarchy (via `taproot coverage --format json`) to identify unimplemented and in-progress behaviours
3. Agent classifies each candidate as:
   - **AFK** (agent can proceed without human input): spec is unambiguous, no design decisions required, tests can be written from the spec alone
   - **HITL** (human-in-the-loop required): spec has open questions, design decisions are needed, or external dependencies must be confirmed
4. Agent infers likely dependencies between candidate slices based on shared domain concepts and data structures (no formal dependency graph exists in the hierarchy — this relies on agent reasoning)
5. Agent presents the recommended next slice: the highest-priority unimplemented behaviour with no unresolved dependencies
6. Developer confirms or selects a different slice
7. Agent proceeds to implement the selected slice using `/tr-implement`

## Alternate Flows
- **Multiple candidates at the same priority**: Agent presents a short-list and asks the developer to choose
- **All behaviours implemented**: Agent reports complete coverage and suggests `/tr-review-all` for semantic review
- **Developer specifies a path**: Agent skips discovery and proceeds directly to implement the named behaviour

## Error Conditions
- **No behaviours defined**: Agent reports no implementable work items found; suggests `/tr-behaviour` or `/tr-decompose` first
- **Spec too ambiguous for AFK**: Agent flags the behaviour as HITL and asks for clarification before implementing

## Postconditions
- The developer has a clear, scoped unit of work with explicit acceptance criteria
- The selected behaviour is being implemented as a vertical slice — touching all layers needed for that behaviour to function end-to-end
- On completion, the behaviour has a passing test and a traceable `impl.md`

## Implementations <!-- taproot-managed -->
- [Agent Skill — /tr-next](./agent-skill/impl.md)
- [CLI Command — taproot plan](./cli-command/impl.md)


## Acceptance Criteria

**AC-1: Identifies unimplemented specified behaviour as AFK candidate**
- Given a hierarchy with a behaviour in `specified` state and no implementations
- When `taproot plan` runs
- Then that behaviour appears in the candidate list with classification `afk`

**AC-2: Identifies unimplemented proposed behaviour as HITL candidate**
- Given a hierarchy with a behaviour in `proposed` state and no implementations
- When `taproot plan` runs
- Then that behaviour appears in the candidate list with classification `hitl`

**AC-3: In-progress impl appears as AFK candidate with inProgressImpls count**
- Given a behaviour with an `impl.md` in `in-progress` state
- When `taproot plan` runs
- Then that behaviour is an `afk` candidate with `inProgressImpls: 1`

**AC-4: Does not include fully-implemented behaviours**
- Given a hierarchy where all behaviours have complete implementations
- When `taproot plan` runs
- Then `allImplemented` is true and `candidates` is empty

**AC-5: Includes intent goal on each candidate**
- Given a candidate behaviour under an intent with a known goal
- When `taproot plan` runs
- Then each candidate's `intentGoal` field contains text from that intent's goal

**AC-6: AFK candidates sort before HITL candidates**
- Given a hierarchy with both AFK and HITL candidates
- When `taproot plan` runs
- Then all AFK candidates appear before any HITL candidate in the list

**AC-7: Tree format shows AFK and HITL sections with /tr-implement hint**
- Given a hierarchy with both AFK and HITL candidates
- When `taproot plan --format tree` runs
- Then the output contains `AFK`, `HITL`, and `/tr-implement`

**AC-8: Tree format shows all-implemented message when no candidates**
- Given a fully-implemented hierarchy
- When `taproot plan --format tree` runs
- Then the output contains "All behaviours are implemented"

**AC-9: JSON format is valid with candidates array and classification field**
- Given a hierarchy with at least one candidate
- When `taproot plan --format json` runs
- Then the output is valid JSON with a `candidates` array where each entry has a `classification` field

## Status
- **State:** implemented
- **Created:** 2026-03-19

## Notes
- This behaviour is currently fulfilled through agent skills (`/tr-implement`, `/tr-decompose`) rather than a dedicated CLI command. A `taproot plan` command to surface the next slice programmatically is a potential future addition.
