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
