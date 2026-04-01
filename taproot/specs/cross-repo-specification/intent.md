# Intent: Cross-Repo Specification

## Stakeholders
- **Developer / architect on a multi-repo project**: needs to link to shared requirements and contracts defined in another repo — without copy-pasting or risking drift between codebases
- **Team building systems that span repository boundaries** (e.g. VS Code plugin + central platform): needs a single authoritative spec for behaviours that require changes in multiple repos, with each repo's local impl clearly accounted for
- **Source repo maintainer**: owns the shared specs — needs to evolve them without silently breaking linking repos; expects partial delegation to be explicitly modelled so audits remain clean

## Goal
Enable teams working across multiple repositories to link to shared intents, behaviours, and global truths defined in a source repo — so that a requirement specified once can be implemented locally in each codebase without duplication, and each repo's coverage and validation runs independently.

## Success Criteria
- [ ] A developer can create a link file in a linking repo that references an intent, behaviour, or global truth defined in a source repo
- [ ] `taproot coverage` in a linking repo counts a linked behaviour as implemented when a local `impl.md` references the link file
- [ ] `taproot check-orphans` in a linking repo flags link files whose targets do not resolve on disk
- [ ] A shared global truth (e.g. API contract, domain model) defined in a source repo can be referenced from linking repos and is enforced at commit time via the truth-check hook
- [ ] A developer in a partially-delegating source repo can mark specific ACs as delegated to a linking repo — and `taproot validate` accepts this as complete coverage for those ACs
- [ ] v1 does not detect when a linked target spec changes in the source repo — linking repos are responsible for re-validating links after upstream changes (drift detection is explicitly deferred)

## Constraints
- Link targets are resolved via a local path mapping (`.taproot/repos.yaml`, not committed) — no remote git fetching in v1; requires `.taproot/` to be gitignored (see backlog: `.taproot/.truth-check-session` bug)
- Links must form a DAG — circular references (A → B → A at any depth) are not permitted and are flagged by `taproot check-orphans`
- No cross-repo CI aggregation in v1 — each repo's coverage and validation runs independently
- No "integrated" state — a local `impl.md` referencing a linked behaviour is sufficient for the behaviour to count as implemented in that repo
- Any repo can act as a source of shared specs — there is no designated "master repo" concept in taproot
- Partial delegation uses a dedicated impl per repo contribution: one `impl.md` covering local ACs (state: complete), a second covering delegated ACs (state: delegated) — not a single partially-complete impl
- The truth-check hook resolves linked truth files via the local path mapping; if the target does not resolve on disk, the hook fails with a clear error rather than silently passing

## Behaviours <!-- taproot-managed -->
- [Define Cross-Repo Link](./define-cross-repo-link/usecase.md)
- [Resolve Linked Coverage](./resolve-linked-coverage/usecase.md)
- [Validate Link Targets](./validate-link-targets/usecase.md)
- [Delegate Implementation to Linking Repo](./delegate-implementation/usecase.md)
- [Enforce Linked Global Truth at Commit](./enforce-linked-truth/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-31
- **Last reviewed:** 2026-03-31

## Notes
- Cross-repo truths were previously deferred in `global-truth-store/intent.md` — this intent supersedes that deferral
- Backlog items consumed: "cross-repo traceability: link intents/behaviours across microservice repo boundaries" (2026-03-25) and "cross-repo traceability for global truths" (2026-03-26)
- Motivating example: VS Code plugin (repo A) and central platform (repo B) share an authentication behaviour — the usecase lives in the platform repo; the platform has a `platform-side/impl.md` (complete) and a `plugin-side/impl.md` (delegated); the plugin repo has a link file pointing to the platform's usecase and its own `impl.md`
