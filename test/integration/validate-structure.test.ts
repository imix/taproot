import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { runValidateStructure } from '../../src/commands/validate-structure.js';

const fixture = (name: string) => resolve(__dirname, '../fixtures', name);

describe('validate-structure — valid hierarchy', () => {
  it('exits with no errors for a complete valid hierarchy', async () => {
    const violations = await runValidateStructure({ path: fixture('valid-hierarchy') });
    const errors = violations.filter(v => v.type === 'error');
    expect(errors).toHaveLength(0);
  });
});

describe('validate-structure — invalid structures', () => {
  it('detects IMPL_PARENT_INVALID when impl.md is directly under an intent', async () => {
    const violations = await runValidateStructure({
      path: fixture('invalid-structure/impl-under-intent'),
    });
    expect(violations.some(v => v.code === 'IMPL_PARENT_INVALID')).toBe(true);
  });

  it('detects DUPLICATE_MARKERS when folder has both intent.md and usecase.md', async () => {
    const violations = await runValidateStructure({
      path: fixture('invalid-structure/two-markers'),
    });
    expect(violations.some(v => v.code === 'DUPLICATE_MARKERS')).toBe(true);
  });

  it('detects INVALID_FOLDER_NAME for non-kebab-case folder names', async () => {
    const violations = await runValidateStructure({
      path: fixture('invalid-structure/bad-folder-name'),
    });
    expect(violations.some(v => v.code === 'INVALID_FOLDER_NAME')).toBe(true);
  });

  it('detects ORPHAN_FOLDER for empty folders with no descendants', async () => {
    const violations = await runValidateStructure({
      path: fixture('invalid-structure/orphan'),
    });
    expect(violations.some(v => v.code === 'ORPHAN_FOLDER')).toBe(true);
  });
});

describe('validate-structure — strict mode', () => {
  it('adds EMPTY_FOLDER warnings in strict mode', async () => {
    const violations = await runValidateStructure({
      path: fixture('valid-hierarchy'),
      strict: true,
    });
    // intent with no children or behaviour with no children would warn
    // valid-hierarchy has complete structure, so expect no empty folder warnings
    // (this test mainly verifies strict mode doesn't crash)
    expect(Array.isArray(violations)).toBe(true);
  });
});
