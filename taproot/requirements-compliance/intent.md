# Intent: Requirements Compliance

## Goal
Prove that the software as built actually implements the requirements as specified — establishing an auditable trail from business intent through stakeholder behaviour to working, tested code.

## Stakeholders
- **External auditors / certifiers**: need evidence that the system was built against defined requirements (relevant for regulated industries)
- **Project stakeholders / management**: need confidence that what was agreed is what was delivered
- **Agentic developer / orchestrator**: needs to demonstrate that AI-generated code is traceable to explicit requirements, not ad hoc

## Success Criteria
- Every implementation record links to specific source files and git commits
- The commit history shows which requirement drove each change
- Broken links (missing source files, invalid references) are detected and reported

## Constraints
- Traceability is maintained by convention (commit tags, impl.md source references) not by tooling that auto-instruments code
- The audit trail relies on git history — shallow clones or force-pushes can break it
- A full chain report (intent → behaviour → impl → commit) is not yet generated as a single artefact; traceability is navigated document-by-document via `check-orphans` and the hierarchy itself

## Status
- **State:** active
- **Created:** 2026-03-19
