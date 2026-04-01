import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const SKILLS_DIR = resolve(__dirname, '../../skills');
const TAPROOT_SKILLS_DIR = resolve(__dirname, '../../taproot/agent/skills');

const skill = readFileSync(resolve(SKILLS_DIR, 'discover-truths.md'), 'utf-8');
const reviewAll = readFileSync(resolve(SKILLS_DIR, 'audit-all.md'), 'utf-8');

// ─── AC-1: candidates surfaced from recurring terms ───────────────────────────

describe('AC-1 — skill scans for recurring terms', () => {
  it('skill describes scanning for recurring terms across 2+ specs', () => {
    expect(skill).toMatch(/[Rr]ecurring terms?/);
  });

  it('skill describes evidence: which specs reference the candidate', () => {
    expect(skill).toMatch(/[Ee]vidence/);
  });

  it('skill describes proposed scope with heuristic', () => {
    expect(skill).toMatch(/[Hh]euristic/);
  });
});

// ─── AC-2: candidates filtered by existing truths ─────────────────────────────

describe('AC-2 — skill filters already-defined truths', () => {
  it('skill filters candidates already defined in global-truths/', () => {
    expect(skill).toMatch(/already defined|already-defined|Filter out/i);
    expect(skill).toContain('taproot/global-truths/');
  });
});

// ─── AC-4: backlogged candidate recorded ─────────────────────────────────────

describe('AC-4 — backlogged candidate written to backlog.md', () => {
  it('skill appends truth candidate entry to backlog.md', () => {
    expect(skill).toContain('taproot/backlog.md');
    expect(skill).toMatch(/truth candidate: ?<term>/);
  });

  it('entry includes date prefix in YYYY-MM-DD format', () => {
    expect(skill).toMatch(/YYYY-MM-DD.*truth candidate|truth candidate.*YYYY-MM-DD/i);
  });
});

// ─── AC-5: skipped candidate leaves no record ─────────────────────────────────

describe('AC-5 — skipped candidate leaves no record', () => {
  it('skill states skip leaves no record and candidate reappears on next run', () => {
    expect(skill).toMatch(/[Nn]o record|reappears|resurface/);
  });
});

// ─── AC-6: too-small hierarchy exits cleanly ──────────────────────────────────

describe('AC-6 — too-small hierarchy exits with warning', () => {
  it('skill warns when fewer than 3 specs are found', () => {
    expect(skill).toMatch(/fewer than 3|Too few specs/i);
  });

  it('skill exits without scanning when hierarchy is too small', () => {
    expect(skill).toMatch(/exit|stop/i);
  });
});

// ─── AC-7: discovery pass appended to review-all output ──────────────────────

describe('AC-7 — review-all includes truth discovery pass', () => {
  it('review-all.md contains a truth discovery pass step', () => {
    expect(reviewAll).toMatch(/[Tt]ruth [Cc]andidates?|truth discovery pass/i);
  });

  it('review-all.md appends ## Truth Candidates section to report', () => {
    expect(reviewAll).toContain('## Truth Candidates');
  });

  it('review-all.md offers defer option that writes to backlog.md', () => {
    expect(reviewAll).toContain('taproot/backlog.md');
    expect(reviewAll).toMatch(/[Dd]efer/);
  });
});

// ─── AC-8: dismissed candidate suppressed from future runs ───────────────────

describe('AC-8 — dismissed candidate suppressed in future runs', () => {
  it('skill writes "reviewed — not a truth" to backlog.md on dismiss', () => {
    expect(skill).toContain('reviewed — not a truth:');
    expect(skill).toContain('taproot/backlog.md');
  });

  it('skill reads backlog.md dismissed entries to build suppression list', () => {
    expect(skill).toMatch(/suppression list|suppress|dismissed/i);
  });
});

// ─── AC-9: abandoned /tr-ineed treated as skip ───────────────────────────────

describe('AC-9 — abandoned /tr-ineed flow treated as skip', () => {
  it('skill treats abandoned /tr-ineed as skip — no truth file created', () => {
    expect(skill).toMatch(/abandon.*skip|abandon.*treated as skip/i);
  });

  it('abandoned candidate reappears on next discovery run', () => {
    expect(skill).toMatch(/reappears?|resurface/i);
  });
});

// ─── Structural requirements ──────────────────────────────────────────────────

describe('skill structure', () => {
  it('skill file exists in skills/', () => {
    expect(existsSync(resolve(SKILLS_DIR, 'discover-truths.md'))).toBe(true);
  });

  it('skill file is synced to .taproot/skills/', () => {
    expect(existsSync(resolve(TAPROOT_SKILLS_DIR, 'discover-truths.md'))).toBe(true);
  });

  it('skill has ## Description section with ≤50 tokens', () => {
    const descMatch = skill.match(/## Description\s*\n(.*)/);
    expect(descMatch).not.toBeNull();
    const description = descMatch![1];
    const tokenCount = description.trim().split(/\s+/).length;
    expect(tokenCount).toBeLessThanOrEqual(50);
  });

  it('skill has ## Autonomous mode section', () => {
    expect(skill).toContain('## Autonomous mode');
  });

  it('skill has ## Steps section', () => {
    expect(skill).toContain('## Steps');
  });

  it('skill has What\'s next? section', () => {
    expect(skill).toMatch(/\*\*What'?s next\??\*\*/i);
  });

  it('skill produces a summary report', () => {
    expect(skill).toMatch(/promoted.*skipped.*backlogged.*dismissed|N promoted/i);
  });

  it('audit-all.md is synced to .taproot/skills/', () => {
    const taproot = readFileSync(resolve(TAPROOT_SKILLS_DIR, 'audit-all.md'), 'utf-8');
    expect(taproot).toContain('## Truth Candidates');
  });
});
