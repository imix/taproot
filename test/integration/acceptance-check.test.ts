import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runAcceptanceCheck, collectCriteria, scanTestFiles, collectMissingSections } from '../../src/commands/acceptance-check.js';

function makeTmpDir(): string {
  const dir = join(tmpdir(), `taproot-ac-test-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeFile(dir: string, relPath: string, content: string): string {
  const full = join(dir, relPath);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, content, 'utf-8');
  return full;
}

describe('collectCriteria', () => {
  let tmp: string;
  beforeEach(() => { tmp = makeTmpDir(); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('extracts AC-N IDs from ## Acceptance Criteria sections', () => {
    writeFile(tmp, 'my-intent/my-behaviour/usecase.md', `
# Behaviour: Test

## Actor
Developer

## Preconditions
- exists

## Main Flow
1. Step

## Postconditions
- done

## Acceptance Criteria

**AC-1: First criterion**
- Given something
- When it happens
- Then it works

**AC-2: Second criterion**
- Given something else

## Status
- **State:** specified
- **Created:** 2026-01-01
- **Last reviewed:** 2026-01-01
`);
    const refs = collectCriteria(tmp);
    expect(refs.map(r => r.id)).toEqual(['AC-1', 'AC-2']);
  });

  it('skips deprecated criteria (strikethrough ~~**AC-N)', () => {
    writeFile(tmp, 'my-intent/my-behaviour/usecase.md', `
# Behaviour: Test

## Actor
Developer

## Preconditions
- exists

## Main Flow
1. Step

## Postconditions
- done

## Acceptance Criteria

~~**AC-1: Deprecated criterion**~~
~~- Given old scenario~~

**AC-2: Active criterion**
- Given something

## Status
- **State:** specified
- **Created:** 2026-01-01
- **Last reviewed:** 2026-01-01
`);
    const refs = collectCriteria(tmp);
    expect(refs.map(r => r.id)).toEqual(['AC-2']);
    expect(refs.map(r => r.id)).not.toContain('AC-1');
  });

  it('returns empty when no ## Acceptance Criteria section exists', () => {
    writeFile(tmp, 'my-intent/my-behaviour/usecase.md', `
# Behaviour: Test

## Actor
Developer

## Preconditions
- exists

## Main Flow
1. Step

## Postconditions
- done

## Status
- **State:** specified
- **Created:** 2026-01-01
- **Last reviewed:** 2026-01-01
`);
    const refs = collectCriteria(tmp);
    expect(refs).toHaveLength(0);
  });

  it('returns empty for non-existent path', () => {
    expect(collectCriteria('/does/not/exist')).toEqual([]);
  });
});

describe('scanTestFiles', () => {
  let tmp: string;
  beforeEach(() => { tmp = makeTmpDir(); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('finds AC-N references in test files', () => {
    writeFile(tmp, 'my.test.ts', `
describe('something', () => {
  it('AC-1: does the thing', () => {});
  it('AC-3: handles error', () => {});
});
`);
    const refs = scanTestFiles([tmp]);
    const ids = refs.map(r => r.id);
    expect(ids).toContain('AC-1');
    expect(ids).toContain('AC-3');
  });

  it('records file and line for each reference', () => {
    writeFile(tmp, 'foo.test.ts', 'line1\nAC-5 is here\nline3\n');
    const refs = scanTestFiles([tmp]);
    expect(refs).toHaveLength(1);
    expect(refs[0]?.id).toBe('AC-5');
    expect(refs[0]?.line).toBe(2);
  });

  it('ignores non-test files', () => {
    writeFile(tmp, 'helpers.ts', 'AC-1 mentioned here');
    writeFile(tmp, 'README.md', 'AC-2 mentioned here');
    const refs = scanTestFiles([tmp]);
    expect(refs).toHaveLength(0);
  });

  it('scans nested test directories', () => {
    writeFile(tmp, 'unit/foo.test.ts', '// AC-7');
    writeFile(tmp, 'integration/bar.test.ts', '// AC-8');
    const refs = scanTestFiles([tmp]);
    const ids = refs.map(r => r.id);
    expect(ids).toContain('AC-7');
    expect(ids).toContain('AC-8');
  });
});

describe('collectMissingSections', () => {
  let tmp: string;
  beforeEach(() => { tmp = makeTmpDir(); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('reports usecase.md with impl child but no AC section', () => {
    writeFile(tmp, 'intent/behaviour/usecase.md', `
# Behaviour: Test

## Actor
Developer

## Preconditions
- exists

## Main Flow
1. Step

## Postconditions
- done

## Status
- **State:** implemented
- **Created:** 2026-01-01
- **Last reviewed:** 2026-01-01
`);
    writeFile(tmp, 'intent/behaviour/my-impl/impl.md', `
# Implementation: My Impl

## Behaviour
../usecase.md

## Design Decisions
- none

## Source Files
- foo.ts

## Commits
<!-- taproot-managed -->

## Tests
- foo.test.ts

## Status
- **State:** complete
- **Created:** 2026-01-01
- **Last verified:** 2026-01-01
`);
    const missing = collectMissingSections(tmp);
    expect(missing).toHaveLength(1);
    expect(missing[0]).toContain('behaviour/usecase.md');
  });

  it('does not report usecase.md with AC section', () => {
    writeFile(tmp, 'intent/behaviour/usecase.md', `
# Behaviour: Test

## Actor
Developer

## Preconditions
- exists

## Main Flow
1. Step

## Postconditions
- done

## Acceptance Criteria

**AC-1: Something**
- Given x
- When y
- Then z

## Status
- **State:** implemented
- **Created:** 2026-01-01
- **Last reviewed:** 2026-01-01
`);
    writeFile(tmp, 'intent/behaviour/my-impl/impl.md', `
# Implementation: My Impl

## Behaviour
../usecase.md

## Design Decisions
- none

## Source Files
- foo.ts

## Commits
<!-- taproot-managed -->

## Tests
- foo.test.ts

## Status
- **State:** complete
- **Created:** 2026-01-01
- **Last verified:** 2026-01-01
`);
    const missing = collectMissingSections(tmp);
    expect(missing).toHaveLength(0);
  });

  it('does not report usecase.md with no impl children', () => {
    writeFile(tmp, 'intent/behaviour/usecase.md', `
# Behaviour: Test

## Actor
Developer

## Preconditions
- exists

## Main Flow
1. Step

## Postconditions
- done

## Status
- **State:** specified
- **Created:** 2026-01-01
- **Last reviewed:** 2026-01-01
`);
    const missing = collectMissingSections(tmp);
    expect(missing).toHaveLength(0);
  });
});

describe('runAcceptanceCheck', () => {
  let specDir: string;
  let testDir: string;
  beforeEach(() => {
    specDir = makeTmpDir();
    testDir = makeTmpDir();
  });
  afterEach(() => {
    rmSync(specDir, { recursive: true, force: true });
    rmSync(testDir, { recursive: true, force: true });
  });

  function makeSpec(dir: string, criteria: string[]): void {
    const acBody = criteria.map(id => `**${id}: criterion**\n- Given x\n- When y\n- Then z`).join('\n\n');
    writeFile(dir, 'intent/behaviour/usecase.md', `
# Behaviour: Test

## Actor
Developer

## Preconditions
- exists

## Main Flow
1. Step

## Postconditions
- done

## Acceptance Criteria

${acBody}

## Status
- **State:** specified
- **Created:** 2026-01-01
- **Last reviewed:** 2026-01-01
`);
  }

  it('returns covered when all spec IDs appear in tests', () => {
    makeSpec(specDir, ['AC-1', 'AC-2']);
    writeFile(testDir, 'foo.test.ts', '// AC-1 covers main flow\n// AC-2 covers alternate');
    const report = runAcceptanceCheck(specDir, [testDir]);
    expect(report.covered).toContain('AC-1');
    expect(report.covered).toContain('AC-2');
    expect(report.uncovered).toHaveLength(0);
    expect(report.orphaned).toHaveLength(0);
  });

  it('detects uncovered criteria', () => {
    makeSpec(specDir, ['AC-1', 'AC-2']);
    writeFile(testDir, 'foo.test.ts', '// AC-1 only');
    const report = runAcceptanceCheck(specDir, [testDir]);
    expect(report.uncovered.map(c => c.id)).toContain('AC-2');
    expect(report.covered).toContain('AC-1');
  });

  it('detects orphaned test references', () => {
    makeSpec(specDir, ['AC-1']);
    writeFile(testDir, 'foo.test.ts', '// AC-1\n// AC-99 — undefined');
    const report = runAcceptanceCheck(specDir, [testDir]);
    expect(report.orphaned.map(t => t.id)).toContain('AC-99');
    expect(report.orphaned.map(t => t.id)).not.toContain('AC-1');
  });

  it('returns empty report for empty hierarchy', () => {
    const report = runAcceptanceCheck(specDir, [testDir]);
    expect(report.uncovered).toHaveLength(0);
    expect(report.orphaned).toHaveLength(0);
    expect(report.covered).toHaveLength(0);
  });
});
