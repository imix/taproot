## Dependency governance conventions

### Core rule
Never add a dependency without explicit developer consent. Before including any new library or package:
1. Confirm the dependency is not already available (directly or transitively)
2. Confirm the developer has approved the addition
3. Note the reason for the dependency in the implementation record

### DoD verification command
None — rely on convention only.

## Agent checklist

Before adding any new dependency:
- [ ] Is this dependency already available in the project (directly or as a transitive dependency)?
- [ ] Has the developer explicitly approved this addition?
- [ ] Is the reason for adding this dependency recorded in the impl.md?
