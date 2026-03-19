# Story {{epic_num}}.{{story_num}}: {{story_title}}

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a {{role}},
I want {{action}},
so that {{benefit}}.

## Acceptance Criteria

1. [Add acceptance criteria from epics/PRD]

## Tasks / Subtasks

- [ ] Task 1 (AC: #)
  - [ ] Subtask 1.1
- [ ] Task 2 (AC: #)
  - [ ] Subtask 2.1

- [ ] Task N: Validation / Definition of Done
  - [ ] N.1 `make test` passes
  - [ ] N.2 `make lint` passes
  - [ ] N.3 If this story adds or modifies scenario/integration tests: `make scenario-test` (or `make integration-test`) passes with Docker available
  - [ ] N.4 Seam audit: If this story touches a component boundary (init↔run, template↔bridge, profile↔Docker, or other seam), identify which tests cover that seam. If none exist, add a seam test as part of this story.
  - [ ] N.5 Update story Status to `review`

## Dev Notes

- Relevant architecture patterns and constraints
- Source tree components to touch
- Testing standards summary

### Self-Hosting (Dogfooding)

Prefer implementing this story via the custos self-hosting pipeline:

```bash
git worktree add .custos-state/worktrees/<story-name> -b feature/<story-name>
cd .custos-state/worktrees/<story-name>
custos run --param STORY=_bmad-output/implementation-artifacts/<story-file>.md
```

**Suitability check:**
- ✅ **Safe to dogfood**: Go code changes, YAML config, test additions, docs — anything under the write-mounted source directories
- ⚠️ **Operator apply manually**: Stories modifying `_bmad/` framework files, `.custos/` pipeline config, or CI infrastructure — the container's write mount does not cover these; apply the agent's output from `_bmad-output/bmb-creations/` manually

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
- Detected conflicts or variances (with rationale)

### References

- Cite all technical details with source paths and sections, e.g. [Source: docs/<file>.md#Section]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
