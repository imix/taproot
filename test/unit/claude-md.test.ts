import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const CLAUDE_MD_PATH = resolve(__dirname, '../../CLAUDE.md');

describe('CLAUDE.md — pre-commit ownership scan (ad-hoc-commit-prep)', () => {
  const content = existsSync(CLAUDE_MD_PATH) ? readFileSync(CLAUDE_MD_PATH, 'utf-8') : '';

  it('CLAUDE.md exists', () => {
    expect(existsSync(CLAUDE_MD_PATH)).toBe(true);
  });

  it('AC-1: instructs grep scan to find impl.md owners', () => {
    expect(content).toMatch(/grep.*taproot/);
  });

  it('AC-1: instructs running taproot dod for matched impl.md files', () => {
    expect(content).toContain('taproot dod');
  });

  it('AC-1: instructs staging impl.md files alongside source files', () => {
    expect(content).toMatch(/stage.*impl\.md|impl\.md.*stage/i);
  });

  it('AC-2: plain commit fallback when no impl.md claims ownership', () => {
    expect(content).toMatch(/plain commit|no impl\.md claims/i);
  });

  it('AC-3: Last verified update instruction present', () => {
    expect(content).toContain('Last verified');
  });

  it('AC-4: DoD resolution note fallback when Last verified is already today', () => {
    expect(content).toMatch(/resolution note|already today/i);
  });

  it('AC-5: announcement step present — agent reports which impl.md it found', () => {
    expect(content).toMatch(/announce|tracked by/i);
  });
});
