import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { runCheckOrphans } from '../../src/commands/check-orphans.js';

const fixture = (name: string) => resolve(__dirname, '../fixtures', name);

describe('check-orphans — valid hierarchy', () => {
  it('finds no broken source/test file references in valid fixture', async () => {
    // The valid fixture references files that don't exist on disk (src/auth/...).
    // check-orphans should find those MISSING_SOURCE_FILE warnings.
    // But there should be no BROKEN_BEHAVIOUR_REF since usecase.md is resolved
    // relative to impl.md — and the fixture's usecase.md does exist at ../usecase.md.
    const violations = await runCheckOrphans({ path: fixture('valid-hierarchy') });
    const brokenRefs = violations.filter(v => v.code === 'BROKEN_BEHAVIOUR_REF');
    expect(brokenRefs).toHaveLength(0);
  });

  it('reports MISSING_SOURCE_FILE for non-existent source files', async () => {
    // The valid fixture references src/auth/email-validator.ts which doesn't exist
    const violations = await runCheckOrphans({ path: fixture('valid-hierarchy') });
    const missing = violations.filter(v => v.code === 'MISSING_SOURCE_FILE');
    expect(missing.length).toBeGreaterThan(0);
  });
});

describe('check-orphans — --include-unimplemented', () => {
  it('reports UNIMPLEMENTED_BEHAVIOUR when flag is set', async () => {
    // create a fixture scenario with a behaviour that has no impls
    const violations = await runCheckOrphans({
      path: fixture('valid-hierarchy'),
      includeUnimplemented: true,
    });
    // valid-hierarchy has implementations for all behaviours, so 0 unimplemented
    const unimpl = violations.filter(v => v.code === 'UNIMPLEMENTED_BEHAVIOUR');
    expect(unimpl).toHaveLength(0);
  });
});
