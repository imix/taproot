import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SKILL_FILES } from '../../src/commands/init.js';

const CHANNEL_DIR = join(process.cwd(), 'channels', 'cursor');
const SKILLS_DIR = join(CHANNEL_DIR, 'skills');
const COMMANDS_DIR = join(CHANNEL_DIR, 'commands');
const RULES_DIR = join(CHANNEL_DIR, 'rules');

describe('Cursor plugin', () => {
  describe('structure', () => {
    it('channels/cursor/ exists', () => {
      expect(existsSync(CHANNEL_DIR)).toBe(true);
    });

    it('skills/ directory exists', () => {
      expect(existsSync(SKILLS_DIR)).toBe(true);
    });

    it('rules/ directory exists', () => {
      expect(existsSync(RULES_DIR)).toBe(true);
    });

    it('commands/ directory exists', () => {
      expect(existsSync(COMMANDS_DIR)).toBe(true);
    });

    it('README.md exists', () => {
      expect(existsSync(join(CHANNEL_DIR, 'README.md'))).toBe(true);
    });
  });

  describe('NFR-1: skill count matches SKILL_FILES', () => {
    it('number of skill directories equals SKILL_FILES length', () => {
      const skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      expect(skillDirs.length).toBe(SKILL_FILES.length);
    });

    it('each skill directory contains a SKILL.md', () => {
      const skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      for (const dir of skillDirs) {
        expect(existsSync(join(SKILLS_DIR, dir, 'SKILL.md')),
          `SKILL.md missing in skills/${dir}/`).toBe(true);
      }
    });
  });

  describe('AC-7: all plugin skills match SKILL_FILES — no extras', () => {
    it('plugin skill names match SKILL_FILES names exactly', () => {
      const expected = new Set(SKILL_FILES.map(f => f.replace('.md', '')));
      const actual = new Set(
        readdirSync(SKILLS_DIR, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name)
      );
      for (const name of actual) {
        expect(expected.has(name), `Plugin has extra skill not in SKILL_FILES: ${name}`).toBe(true);
      }
      for (const name of expected) {
        expect(actual.has(name), `SKILL_FILES entry missing from plugin: ${name}`).toBe(true);
      }
    });
  });

  describe('AC-3: thin-launcher pattern', () => {
    it('each SKILL.md references the canonical skill path', () => {
      for (const filename of SKILL_FILES) {
        const name = filename.replace('.md', '');
        const skillPath = join(SKILLS_DIR, name, 'SKILL.md');
        const content = readFileSync(skillPath, 'utf-8');
        expect(content, `${name}/SKILL.md should reference taproot/agent/skills/${name}.md`)
          .toContain(`taproot/agent/skills/${name}.md`);
      }
    });

    it('each SKILL.md has Cursor-native frontmatter with name and description', () => {
      for (const filename of SKILL_FILES) {
        const name = filename.replace('.md', '');
        const content = readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf-8');
        expect(content, `${name}/SKILL.md should have name frontmatter`).toMatch(/^---[\s\S]*?name:/m);
        expect(content, `${name}/SKILL.md should have description frontmatter`).toMatch(/^---[\s\S]*?description:/m);
      }
    });

    it('no SKILL.md contains the full skill content (must be a launcher only)', () => {
      for (const filename of SKILL_FILES) {
        const name = filename.replace('.md', '');
        const content = readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf-8');
        // Launchers should be short — full skill files are hundreds of lines
        const lineCount = content.split('\n').length;
        expect(lineCount, `${name}/SKILL.md has too many lines (${lineCount}) — should be a thin launcher`).toBeLessThan(20);
      }
    });
  });

  describe('AC-5: five common commands exist', () => {
    const REQUIRED_COMMANDS = [
      'initialize.md',
      'status.md',
      'route-requirement.md',
      'report-bug.md',
      'build-plan.md',
    ];

    for (const cmd of REQUIRED_COMMANDS) {
      it(`${cmd} exists`, () => {
        expect(existsSync(join(COMMANDS_DIR, cmd))).toBe(true);
      });
    }

    it('each command file has name and description frontmatter', () => {
      for (const cmd of REQUIRED_COMMANDS) {
        const content = readFileSync(join(COMMANDS_DIR, cmd), 'utf-8');
        expect(content, `${cmd} should have name frontmatter`).toMatch(/^---[\s\S]*?name:/m);
        expect(content, `${cmd} should have description frontmatter`).toMatch(/^---[\s\S]*?description:/m);
      }
    });
  });

  describe('rules file', () => {
    it('taproot.mdc exists', () => {
      expect(existsSync(join(RULES_DIR, 'taproot.mdc'))).toBe(true);
    });

    it('taproot.mdc has MDC frontmatter with globs', () => {
      const content = readFileSync(join(RULES_DIR, 'taproot.mdc'), 'utf-8');
      expect(content).toMatch(/^---[\s\S]*?globs:/m);
    });

    it('taproot.mdc is scoped to taproot/** files', () => {
      const content = readFileSync(join(RULES_DIR, 'taproot.mdc'), 'utf-8');
      expect(content).toContain('taproot/**');
    });
  });
});
