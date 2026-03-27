# Settings Templates

Ready-to-use `taproot/settings.yaml` templates for common project types.

| Template | Best for |
|----------|----------|
| [`webapp.yaml`](./webapp.yaml) | Next.js, React + Express, SvelteKit, full-stack apps |
| [`library.yaml`](./library.yaml) | npm packages, TypeScript/JavaScript SDKs |
| [`microservice.yaml`](./microservice.yaml) | REST APIs, GraphQL services, background workers |

## How to use

```bash
# Copy the right template into your project
cp examples/settings/webapp.yaml taproot/settings.yaml

# Then run init to generate adapters
npx @imix-js/taproot init
```

## Customising

All templates use the same three-layer DoD structure:

1. **Automated** (`run:`) — commands that exit 0 or fail. Change these to match your test runner, linter, and build tool.
2. **Agent checks** (`document-current`, `check:`) — instructions the AI agent reasons through before committing. Adjust these to match what "done" means for your project.
3. **Cross-cutting** (`check-if-affected-by:`, commented out) — once you have cross-cutting behaviour specs, add them here and they'll be evaluated for every implementation commit.

## Adding your own stack

Not using Node.js? The `run:` commands accept any shell command:

```yaml
definitionOfDone:
  - { run: "pytest", name: tests-passing }
  - { run: "ruff check .", name: lint-clean }
  - { run: "mypy src/", name: type-check }
```
