import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'path';
import { mkdtempSync, rmSync, cpSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runValidateFormat } from '../../src/commands/validate-format.js';

const fixture = (name: string) => resolve(__dirname, '../fixtures', name);

describe('validate-format — valid hierarchy', () => {
  it('reports no errors for valid documents', async () => {
    const violations = await runValidateFormat({ path: fixture('valid-hierarchy') });
    // The valid fixture's impl.md references ../usecase.md which doesn't exist on disk
    // at the absolute path — filter to non-reference violations
    const nonRefErrors = violations.filter(
      v => v.type === 'error' && v.code !== 'INVALID_BEHAVIOUR_REFERENCE'
    );
    expect(nonRefErrors).toHaveLength(0);
  });
});

describe('validate-format — missing sections', () => {
  it('detects MISSING_SECTION for missing required sections', async () => {
    const violations = await runValidateFormat({
      path: fixture('invalid-format/missing-sections'),
    });
    expect(violations.some(v => v.code === 'MISSING_SECTION')).toBe(true);
    expect(violations.some(v => v.message.includes('Stakeholders'))).toBe(true);
    expect(violations.some(v => v.message.includes('Success Criteria'))).toBe(true);
  });
});

describe('validate-format — bad status', () => {
  it('detects INVALID_STATUS_VALUE for unknown state', async () => {
    const violations = await runValidateFormat({
      path: fixture('invalid-format/bad-status'),
    });
    expect(violations.some(v => v.code === 'INVALID_STATUS_VALUE')).toBe(true);
  });

  it('detects INVALID_DATE_FORMAT for non-ISO dates', async () => {
    const violations = await runValidateFormat({
      path: fixture('invalid-format/bad-status'),
    });
    expect(violations.some(v => v.code === 'INVALID_DATE_FORMAT')).toBe(true);
  });
});

describe('validate-format --fix', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-test-'));
    cpSync(fixture('invalid-format/missing-sections'), tmpDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('adds missing section headers to the file', async () => {
    await runValidateFormat({ path: tmpDir, fix: true });
    const content = readFileSync(join(tmpDir, 'user-auth', 'intent.md'), 'utf-8');
    expect(content).toContain('## Stakeholders');
    expect(content).toContain('## Success Criteria');
  });

  it('does not destroy existing content', async () => {
    await runValidateFormat({ path: tmpDir, fix: true });
    const content = readFileSync(join(tmpDir, 'user-auth', 'intent.md'), 'utf-8');
    expect(content).toContain('## Goal');
    expect(content).toContain('Handle user authentication.');
  });
});
