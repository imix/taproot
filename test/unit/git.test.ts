import { describe, it, expect } from 'vitest';
import { extractTaprootPath } from '../../src/core/git.js';
import type { GitCommit } from '../../src/core/git.js';

function commit(overrides: Partial<GitCommit>): GitCommit {
  return {
    hash: 'a'.repeat(40),
    subject: '',
    body: '',
    date: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

const PATTERN = 'taproot\\(([^)]+)\\):';
const TRAILER = 'Taproot';

describe('extractTaprootPath', () => {
  it('extracts path from subject line', () => {
    const c = commit({ subject: 'taproot(user-onboarding/register-account/email-validation): add validator' });
    expect(extractTaprootPath(c, PATTERN, TRAILER)).toBe('user-onboarding/register-account/email-validation');
  });

  it('extracts path from body trailer', () => {
    const c = commit({ body: 'Some longer description.\n\nTaproot: user-onboarding/register-account/email-validation' });
    expect(extractTaprootPath(c, PATTERN, TRAILER)).toBe('user-onboarding/register-account/email-validation');
  });

  it('prefers subject over trailer', () => {
    const c = commit({
      subject: 'taproot(path/from/subject): msg',
      body: 'Taproot: path/from/trailer',
    });
    expect(extractTaprootPath(c, PATTERN, TRAILER)).toBe('path/from/subject');
  });

  it('returns null for commits with no taproot reference', () => {
    const c = commit({ subject: 'fix: some unrelated fix' });
    expect(extractTaprootPath(c, PATTERN, TRAILER)).toBeNull();
  });

  it('returns null for empty commit', () => {
    const c = commit({});
    expect(extractTaprootPath(c, PATTERN, TRAILER)).toBeNull();
  });
});
