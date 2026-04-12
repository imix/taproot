## Test structure conventions

### Folder split
| Folder | Purpose |
|---|---|
| `test/unit/` | Pure-function tests — no filesystem, no subprocess, no I/O |
| `test/integration/` | Everything else: filesystem, CLI invocation, multi-module flows |
| `test/fixtures/` | Shared read-only fixture directories (valid-hierarchy, invalid-format, etc.) |

### File naming
- Unit test mirrors the source module: `src/core/config.ts` → `test/unit/config.test.ts`
- Integration test names the feature or command: `test/integration/dod.test.ts`, `test/integration/init.test.ts`

### Per-test writable state
Use `mkdtempSync` in `beforeEach` and `rmSync(..., { recursive: true, force: true })` in `afterEach`. Never share mutable temp directories across tests.

```typescript
let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'taproot-feature-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});
```

### Test helpers
Keep helpers local to the test file (e.g. `makeTempDir`, `writeConfig`, `makeImplMd`). Extract to a shared helper only when three or more test files need the exact same setup function.

### AC tracing
Link `describe` or `it` blocks back to the acceptance criterion they cover with a `// AC-N:` comment:

```typescript
// AC-3: missing config file → returns defaults
describe('loadConfig — missing settings.yaml', () => { ... });
```

### Import style
Always use `.js` extension on relative imports (TypeScript ESM resolution):

```typescript
import { loadConfig } from '../../src/core/config.js';
```

### Test framework
Vitest. Import test functions explicitly — do not rely on globals:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
```

## Agent checklist

Before writing any test:
- [ ] Does this test touch the filesystem or spawn a process? If yes — `test/integration/`; if no — `test/unit/`
- [ ] Does the test file name mirror the source module or feature being tested?
- [ ] Writable state: using `mkdtempSync` in `beforeEach` and cleaning up in `afterEach`?
- [ ] Is a new shared helper needed, or can the setup stay local to this file?
- [ ] Are `it` blocks linked to ACs with `// AC-N:` comments where applicable?
- [ ] Imports use `.js` extension?
