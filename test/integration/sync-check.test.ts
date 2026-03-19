import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { runSyncCheck } from '../../src/commands/sync-check.js';

const fixture = (name: string) => resolve(__dirname, '../fixtures', name);

describe('sync-check', () => {
  it('runs without error on valid hierarchy', async () => {
    const violations = await runSyncCheck({ path: fixture('valid-hierarchy') });
    expect(Array.isArray(violations)).toBe(true);
  });

  it('returns only warnings, never errors', async () => {
    const violations = await runSyncCheck({ path: fixture('valid-hierarchy') });
    const errors = violations.filter(v => v.type === 'error');
    expect(errors).toHaveLength(0);
  });

  it('uses IMPL_STALE and SPEC_UPDATED codes', async () => {
    const violations = await runSyncCheck({ path: fixture('valid-hierarchy') });
    // All violations (if any) should have expected codes
    for (const v of violations) {
      expect(['IMPL_STALE', 'SPEC_UPDATED']).toContain(v.code);
    }
  });
});
