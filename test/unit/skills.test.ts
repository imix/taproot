import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { parseMarkdown } from '../../src/core/markdown-parser.js';
import { SKILL_FILES } from '../../src/commands/init.js';

const SKILLS_DIR = resolve(__dirname, '../../skills');

const REQUIRED_SECTIONS = ['description', 'inputs', 'steps', 'output', 'cli dependencies'];

describe('canonical skill files', () => {
  it('skills directory exists', () => {
    expect(existsSync(SKILLS_DIR)).toBe(true);
  });

  it('all expected skill files are present', () => {
    for (const filename of SKILL_FILES) {
      const path = join(SKILLS_DIR, filename);
      expect(existsSync(path), `Missing skill file: ${filename}`).toBe(true);
    }
  });

  for (const filename of SKILL_FILES) {
    describe(filename, () => {
      const path = join(SKILLS_DIR, filename);

      it('is readable and non-empty', () => {
        const content = readFileSync(path, 'utf-8');
        expect(content.trim().length).toBeGreaterThan(100);
      });

      it('has an # Skill: heading', () => {
        const content = readFileSync(path, 'utf-8');
        expect(content).toMatch(/^# Skill:/m);
      });

      it('has all required sections', () => {
        const content = readFileSync(path, 'utf-8');
        const doc = parseMarkdown(path, content);
        for (const section of REQUIRED_SECTIONS) {
          expect(
            doc.sections.has(section),
            `${filename} is missing "## ${section[0]!.toUpperCase() + section.slice(1)}" section`
          ).toBe(true);
        }
      });

      it('Steps section has numbered list items', () => {
        const content = readFileSync(path, 'utf-8');
        const doc = parseMarkdown(path, content);
        const steps = doc.sections.get('steps');
        expect(steps).toBeDefined();
        const hasNumberedItem = steps!.bodyLines.some(l => /^\d+\./.test(l.trim()));
        expect(hasNumberedItem, `${filename} Steps section has no numbered list items`).toBe(true);
      });

      it('CLI Dependencies section lists taproot commands or "None"', () => {
        const content = readFileSync(path, 'utf-8');
        const doc = parseMarkdown(path, content);
        const cliDeps = doc.sections.get('cli dependencies');
        expect(cliDeps).toBeDefined();
        const body = cliDeps!.rawBody.trim();
        const valid = body.toLowerCase().includes('none') ||
          body.includes('taproot ') ||
          body.includes('taproot\n');
        expect(valid, `${filename}: CLI Dependencies should list taproot commands or "None"`).toBe(true);
      });
    });
  }
});

// ─── AC-1/AC-2: status.md Parked section ──────────────────────────────────────

describe('status.md — Parked section (AC-1, AC-2)', () => {
  const statusPath = resolve(SKILLS_DIR, 'status.md');
  const content = readFileSync(statusPath, 'utf-8');

  it('AC-1: references deferredBehaviours and deferredImpls JSON fields', () => {
    expect(content).toContain('deferredBehaviours');
    expect(content).toContain('deferredImpls');
  });

  it('AC-1: report template contains a ## Parked section', () => {
    expect(content).toContain('## Parked');
  });

  it('AC-2: Parked section includes instruction to omit when zero deferred items', () => {
    expect(content).toMatch(/omit.*if 0|if.*zero|if both are zero/i);
  });
});

// ─── AC-1/AC-3/AC-4: implement.md commit-awareness ────────────────────────────

describe('implement.md — commit-awareness (AC-1, AC-3, AC-4)', () => {
  const implementPath = resolve(SKILLS_DIR, 'implement.md');
  const content = readFileSync(implementPath, 'utf-8');

  it('AC-1: references .taproot/settings.yaml for pre-commit context', () => {
    expect(content).toContain('settings.yaml');
  });

  it('AC-3: declaration commit step surfaces DoR awareness', () => {
    expect(content).toMatch(/declaration commit/i);
    expect(content).toMatch(/definitionOfReady|DoR/);
  });

  it('AC-4: implementation commit step instructs impl.md real-diff requirement', () => {
    expect(content).toMatch(/implementation commit/i);
    expect(content).toMatch(/real diff/i);
  });
});

// ─── AC-1/AC-2/AC-4: sweep.md confirmation gate and live progress ─────────────

describe('sweep.md — confirmation gate and live progress (AC-1, AC-2, AC-4)', () => {
  const sweepPath = resolve(SKILLS_DIR, 'sweep.md');
  const content = readFileSync(sweepPath, 'utf-8');

  it('AC-1: [x] progress marking present in step 4 output', () => {
    expect(content).toContain('[x]');
  });

  it('AC-2: Y/N confirmation gate present before processing', () => {
    expect(content).toMatch(/\[Y\].*Yes.*\[N\].*No/s);
  });

  it('AC-2: cancelled when developer declines', () => {
    expect(content).toMatch(/cancelled/i);
  });

  it('AC-4: [x] progress line includes taproot path', () => {
    expect(content).toMatch(/\[x\] taproot\//);
  });

  it('cross-item context warning redirects to /tr-review-all', () => {
    expect(content).toContain('cross-item context');
    expect(content).toContain('tr-review-all');
  });
});

// ─── AC-1/AC-2/AC-6/AC-7: pattern-hints step in all four skills ───────────────

describe('pattern-hints — AC-1/AC-2/AC-6/AC-7: pattern check step present in all four skills', () => {
  const skills = [
    { name: 'ineed.md',     path: resolve(SKILLS_DIR, 'ineed.md') },
    { name: 'behaviour.md', path: resolve(SKILLS_DIR, 'behaviour.md') },
    { name: 'implement.md', path: resolve(SKILLS_DIR, 'implement.md') },
    { name: 'refine.md',    path: resolve(SKILLS_DIR, 'refine.md') },
  ];

  for (const skill of skills) {
    describe(skill.name, () => {
      const content = readFileSync(skill.path, 'utf-8');

      it('AC-1: contains docs/patterns.md scan step', () => {
        expect(content).toContain('docs/patterns.md');
      });

      it('AC-1: check-if-affected-by listed as trigger signal', () => {
        expect(content).toContain('check-if-affected-by');
      });

      it('AC-2: [A] and [B] choice offered to user', () => {
        expect(content).toMatch(/\[A\]/);
        expect(content).toMatch(/\[B\]/);
      });
    });
  }

  it('AC-6: ineed.md skips gracefully when docs/patterns.md absent', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'ineed.md'), 'utf-8');
    expect(content).toMatch(/absent.*skip silently|skip silently/i);
  });

  it('AC-7: ineed.md [A] does not add hierarchy entry', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'ineed.md'), 'utf-8');
    expect(content).toMatch(/Do not create a new hierarchy entry/i);
  });

  it('AC-7: behaviour.md [A] does not write a new usecase.md', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'behaviour.md'), 'utf-8');
    expect(content).toMatch(/Do not write a new.*usecase\.md/i);
  });

  it('AC-7: refine.md [A] does not modify usecase.md', () => {
    const content = readFileSync(resolve(SKILLS_DIR, 'refine.md'), 'utf-8');
    expect(content).toMatch(/Do not modify.*usecase\.md/i);
  });
});
