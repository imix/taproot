import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SKILLS_DIR = resolve(__dirname, '../../skills');

const YESQ_PATTERN = /\[Y\].*\[E\].*\[S\].*\[Q\]/s;
const AUTO_PROCEED_PATTERN = /just go|do all|auto-proceed/i;
const SESSION_SUMMARY_PATTERN = /Written\s*\(<n>\)|session ended|skipped.*remaining/i;
const QUIT_SUMMARY_PATTERN = /\[Q\].*stop|stop.*session|quit session/i;

describe('pause-and-confirm — discover.md', () => {
  const content = readFileSync(resolve(SKILLS_DIR, 'discover.md'), 'utf-8');

  it('contains Y/E/S/Q confirmation menu before writing intent.md', () => {
    expect(YESQ_PATTERN.test(content)).toBe(true);
  });

  it('contains auto-proceed opt-in language', () => {
    expect(AUTO_PROCEED_PATTERN.test(content)).toBe(true);
  });

  it('contains session summary on stop/quit', () => {
    expect(SESSION_SUMMARY_PATTERN.test(content)).toBe(true);
  });

  it('presents confirmation before writing intent.md', () => {
    expect(content).toContain('Proposed: taproot/<slug>/intent.md');
  });

  it('presents confirmation before writing usecase.md', () => {
    expect(content).toContain('Proposed: taproot/<intent-slug>/<behaviour-slug>/usecase.md');
  });

  it('presents confirmation before writing impl.md', () => {
    expect(content).toContain('Proposed: taproot/<intent-slug>/<behaviour-slug>/<impl-slug>/impl.md');
  });
});

describe('pause-and-confirm — decompose.md', () => {
  const content = readFileSync(resolve(SKILLS_DIR, 'decompose.md'), 'utf-8');

  it('contains Y/E/S/Q confirmation menu before creating each behaviour', () => {
    expect(YESQ_PATTERN.test(content)).toBe(true);
  });

  it('contains auto-proceed opt-in language', () => {
    expect(AUTO_PROCEED_PATTERN.test(content)).toBe(true);
  });

  it('contains quit/stop with list of what was created and remaining', () => {
    expect(content).toMatch(/\[Q\].*stop|list what was created.*remaining/is);
  });
});
