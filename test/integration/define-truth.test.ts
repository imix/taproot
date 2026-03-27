import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const SKILLS_DIR = resolve(__dirname, '../../skills');
const TAPROOT_SKILLS_DIR = resolve(__dirname, '../../taproot/agent/skills');

const skill = readFileSync(resolve(SKILLS_DIR, 'define-truth.md'), 'utf-8');

// ─── AC-1: suffix convention ──────────────────────────────────────────────────

describe('AC-1 — skill supports suffix convention', () => {
  it('skill describes <name>_<scope>.md suffix convention', () => {
    expect(skill).toMatch(/<name>_<scope>\.md/);
  });

  it('skill gives a concrete suffix example', () => {
    expect(skill).toMatch(/glossary_intent\.md/);
  });
});

// ─── AC-2: sub-folder convention ──────────────────────────────────────────────

describe('AC-2 — skill supports sub-folder convention', () => {
  it('skill describes <scope>/<name>.md sub-folder convention', () => {
    expect(skill).toMatch(/<scope>\/<name>\.md/);
  });

  it('skill gives a concrete sub-folder example', () => {
    expect(skill).toMatch(/intent\/glossary\.md/);
  });
});

// ─── AC-5: unscopable file defaults to intent scope with warning ──────────────

describe('AC-5 — no scope signal defaults to intent with warning', () => {
  it('skill warns when file has no scope signal', () => {
    expect(skill).toMatch(/no scope signal|defaults to intent scope/i);
  });

  it('skill suggests adding a suffix to resolve ambiguity', () => {
    expect(skill).toMatch(/_intent|_behaviour|_impl/);
  });
});

// ─── AC-6: conflicting scope signals — most restrictive wins ──────────────────

describe('AC-6 — conflicting scope signals', () => {
  it('skill warns about conflicting scope signals', () => {
    expect(skill).toMatch(/[Cc]onflicting scope signals/);
  });

  it('skill states sub-folder takes precedence (most restrictive)', () => {
    expect(skill).toMatch(/restrictive|sub-folder.*takes precedence|more restrictive/i);
  });
});

// ─── AC-3 & AC-4: edit and remove existing truth ─────────────────────────────

describe('AC-3/AC-4 — editing existing truth file', () => {
  it('skill handles case where file already exists', () => {
    expect(skill).toMatch(/already exists/i);
  });

  it('skill offers append, replace, or cancel options', () => {
    expect(skill).toMatch(/\[A\].*append|\[B\].*replace|\[C\].*cancel/i);
  });
});

// ─── Pre-populated candidate path (discover-truths integration) ───────────────

describe('candidate pre-population — discover-truths integration', () => {
  it('skill accepts a pre-populated candidate argument', () => {
    expect(skill).toContain('candidate');
  });

  it('skill displays candidate with proposed scope and evidence', () => {
    expect(skill).toMatch(/[Pp]roposed scope/);
    expect(skill).toMatch(/[Ee]vidence/);
  });
});

// ─── Structural requirements ──────────────────────────────────────────────────

describe('skill structure', () => {
  it('skill file exists in skills/', () => {
    expect(existsSync(resolve(SKILLS_DIR, 'define-truth.md'))).toBe(true);
  });

  it('skill file is synced to .taproot/skills/', () => {
    expect(existsSync(resolve(TAPROOT_SKILLS_DIR, 'define-truth.md'))).toBe(true);
  });

  it('skill description is ≤50 tokens', () => {
    const descMatch = skill.match(/## Description\s*\n([\s\S]*?)(?=\n##)/);
    expect(descMatch).not.toBeNull();
    const tokenCount = descMatch![1].trim().split(/\s+/).length;
    expect(tokenCount).toBeLessThanOrEqual(50);
  });

  it('skill has What\'s next? section', () => {
    expect(skill).toMatch(/\*\*What'?s next\??\*\*/i);
  });

  it('skill covers all three scope levels', () => {
    expect(skill).toMatch(/intent/);
    expect(skill).toMatch(/behaviour/);
    expect(skill).toMatch(/impl/);
  });

  it('skill states truth content is free-form', () => {
    expect(skill).toMatch(/free.form/i);
  });
});
