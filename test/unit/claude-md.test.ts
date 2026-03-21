import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const CLAUDE_MD_PATH = resolve(__dirname, '../../CLAUDE.md');

describe('CLAUDE.md — commit trigger (ad-hoc-commit-prep)', () => {
  const content = existsSync(CLAUDE_MD_PATH) ? readFileSync(CLAUDE_MD_PATH, 'utf-8') : '';

  it('CLAUDE.md exists', () => {
    expect(existsSync(CLAUDE_MD_PATH)).toBe(true);
  });

  it('AC-1: instructs agent to invoke /tr-commit instead of raw git commands', () => {
    expect(content).toContain('/tr-commit');
  });

  it('AC-2: trigger covers both proactive commits and conversational "commit" intent', () => {
    expect(content).toMatch(/about to.*commit|commit.*about to|user says.*commit|commit.*user says/i);
  });
});
