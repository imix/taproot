# Implementation: Commithook Extension + CLAUDE.md Guidance

## Behaviour
../usecase.md

## Design Decisions
- `checkBehaviourIntentAlignment` is a pure function (like `checkUsecaseQuality`) — takes usecase path, resolved intent path, intent content, and pack; returns `SpecFailure[]`. This keeps it unit-testable without git.
- `findParentIntentPath` does filesystem traversal from the usecase.md's directory upward, checking for `intent.md` at each ancestor level within the `taproot/` subtree. Returns the first found path or `null`.
- Intent content is read from the git staging area first (`getStagedContent`) so that in-flight intent changes are respected; falls back to reading from disk. This handles the case where intent.md and usecase.md are committed together.
- When no parent intent is found, the check blocks with a clear message — orphan usecases are a structural problem that should be fixed before committing.
- Agent-side semantic checks (Actor–Stakeholder trace, AC coverage, scope boundary, no contradiction) implemented as CLAUDE.md guidance — avoids LLM overhead in the commithook; follows the same split as `validate-usecase-quality` (structural in hook, semantic in agent guidance).
- Stakeholders warning (non-blocking): uses `severity: 'warning'` on the SpecFailure so the commithook surfaces it without blocking the commit; guarded by `!pack` to avoid false positives in localised contexts.
- Check runs inside the existing requirement-tier block alongside `checkUsecaseQuality` — no new tier needed.

## Source Files
- `src/commands/commithook.ts` — `findParentIntentPath`, `checkBehaviourIntentAlignment`, wired into requirement tier
- `CLAUDE.md` — agent guidance: read parent intent Goal before writing usecase ACs

## Commits
- (run `taproot link-commits` to populate)
- `bef249f68acc36661b64b3a45d91fe499c2dad2a` — (auto-linked by taproot link-commits)
- `4e797a44b162d1f4e0c4281f95af083b8605b844` — (auto-linked by taproot link-commits)
- `40ded1263123ad44088526106dae6c88c0e362df` — (auto-linked by taproot link-commits)
- `2a815f8902ed8a850339600f59458bd3d04fb3de` — (auto-linked by taproot link-commits)

## Tests
- `test/integration/commithook.test.ts` — `checkBehaviourIntentAlignment` unit describe block (AC-1 to AC-5) + integration test for staged usecase with valid parent intent
- `test/integration/commithook.test.ts` — `CLAUDE.md — behaviour-intent alignment agent guidance` describe block: verifies CLAUDE.md contains Actor–Stakeholder guidance (AC-7), AC coverage guidance (AC-8), and scope boundary guidance (AC-9)

## DoR Resolutions
- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — this impl IS a quality gate check; it extends commithook.ts in the same pattern as existing checks (`checkUsecaseQuality`, `checkIntentQuality`). No architectural decisions made. | resolved: 2026-03-29
- condition: check-if-affected-by: quality-gates/nfr-measurability | note: NOT APPLICABLE — the parent usecase.md contains no NFR-N entries. This behaviour has no performance, security, or reliability thresholds to verify. | resolved: 2026-03-29

## Status
- **State:** complete
- **Created:** 2026-03-29
- **Last verified:** 2026-04-12

## DoD Resolutions
- condition: document-current | note: docs/cli.md updated: commithook table row for hierarchy files now explicitly lists spec quality checks including behaviour-intent alignment. README.md does not enumerate individual commithook checks. docs/ accurately reflects the change. | resolved: 2026-03-29T18:36:55.909Z
- condition: check-if-affected-by: agent-integration/portable-output-patterns | note: not applicable — source files are commithook.ts (TypeScript git hook) and CLAUDE.md; no skill file (skills/*.md) modified; portable-output-patterns governs skill files only | resolved: 2026-04-11T07:17:02.746Z

- condition: check: if this change modifies a skill file (skills/*.md), verify it does not introduce shell command execution without validation, does not hardcode credentials or tokens, and follows least-privilege for agent instructions — see docs/security.md | note: COMPLIANT — CLAUDE.md is modified (not skills/*.md). The CLAUDE.md addition instructs the agent to read a file and check alignment. No shell commands, no credentials, no tokens introduced. | resolved: 2026-03-29T18:38:19.899Z

- condition: check: does this story reveal a reusable pattern worth documenting in docs/patterns.md? | note: NO — directory traversal for parent intent lookup is internal to commithook.ts. No reusable pattern for docs/patterns.md. | resolved: 2026-03-29T18:38:19.635Z

- condition: check: does this story introduce a cross-cutting concern that warrants a new check-if-affected-by or check-if-affected entry in .taproot/settings.yaml? | note: NO — extending an existing quality gate check is not a new cross-cutting concern. No new DoD conditions needed. | resolved: 2026-03-29T18:38:19.360Z

- condition: check-if-affected-by: quality-gates/architecture-compliance | note: COMPLIANT — extends commithook.ts in the established quality gate pattern (checkUsecaseQuality, checkIntentQuality). Tests cover all 6 ACs. No architectural constraints from docs/architecture.md violated. | resolved: 2026-03-29T18:38:19.096Z

- condition: check-if-affected-by: human-integration/pattern-hints | note: NOT APPLICABLE — pattern-hints applies to skills routing natural language requests. commithook.ts is a git hook. | resolved: 2026-03-29T18:38:07.025Z

- condition: check-if-affected-by: skill-architecture/commit-awareness | note: NOT APPLICABLE — commithook.ts is the gate that runs at commit time; it does not instruct agents to run git commit. Committing is the developer's action. | resolved: 2026-03-29T18:38:06.765Z

- condition: check-if-affected-by: skill-architecture/context-engineering | note: NOT APPLICABLE — context-engineering governs skill file design. This implementation changes commithook.ts (TypeScript) and CLAUDE.md. | resolved: 2026-03-29T18:38:06.507Z

- condition: check-if-affected-by: human-integration/pause-and-confirm | note: NOT APPLICABLE — commithook.ts is a git hook, not a multi-document-authoring skill. No destructive actions or bulk writes. | resolved: 2026-03-29T18:37:27.505Z

- condition: check-if-affected-by: human-integration/contextual-next-steps | note: NOT APPLICABLE — commithook.ts is a git hook with no What's next block. No interactive skill flow. | resolved: 2026-03-29T18:37:27.235Z

- condition: check-if-affected-by: agent-integration/agent-agnostic-language | note: NOT APPLICABLE — commithook.ts is TypeScript source code. CLAUDE.md guidance uses generic language ('read the parent intent.md Goal section'). No Claude-specific names or agent-specific invocation mechanisms introduced. | resolved: 2026-03-29T18:37:26.970Z

- condition: check-if-affected: examples/ | note: No examples exercise commithook directly. Not affected. | resolved: 2026-03-29T18:37:08.457Z

- condition: check-if-affected: docs/ | note: AFFECTED AND UPDATED — docs/cli.md commithook table updated to include behaviour-intent alignment in the spec quality checks listed for hierarchy file commits. | resolved: 2026-03-29T18:37:08.192Z

- condition: check-if-affected: skills/guide.md | note: guide.md documents user-facing skills. The behaviour-intent alignment check is a pre-commit gate, not a user-facing skill. Not affected. | resolved: 2026-03-29T18:37:03.475Z

- condition: check-if-affected: src/commands/update.ts | note: update.ts copies skill files only; commithook.ts changes are not distributed via taproot update. Not affected. | resolved: 2026-03-29T18:37:03.188Z

- condition: check-if-affected: package.json | note: No new dependencies or version bump required. Pure logic addition to commithook.ts — no new packages. | resolved: 2026-03-29T18:37:02.920Z

