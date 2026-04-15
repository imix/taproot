import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import yaml from 'js-yaml';
import { runInit, MODULE_SKILL_FILES } from '../../src/commands/init.js';

const UX_SKILLS = MODULE_SKILL_FILES['user-experience']!;

function skillsDir(dir: string): string {
  return join(dir, 'taproot', 'agent', 'skills');
}

function uxSkillExists(dir: string, filename: string): boolean {
  return existsSync(join(skillsDir(dir), filename));
}

function readSettings(dir: string): Record<string, unknown> {
  return yaml.load(readFileSync(join(dir, 'taproot', 'settings.yaml'), 'utf-8')) as Record<string, unknown>;
}

describe('module installation opt-in (taproot init) — AC-5', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-init-modules-'));
    mkdirSync(join(tmpDir, '.git'), { recursive: true });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // AC-5: taproot init respects modules: setting
  it('AC-5: installs UX skills when modules: [user-experience] is declared in existing settings', () => {
    // Pre-existing settings with modules: declared
    mkdirSync(join(tmpDir, 'taproot'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'taproot', 'settings.yaml'),
      `taproot_version: '1.0.0'\nversion: 1\nroot: taproot/specs/\nmodules:\n  - user-experience\n`,
    );
    runInit({ cwd: tmpDir, agent: 'claude' });
    for (const skill of UX_SKILLS) {
      expect(uxSkillExists(tmpDir, skill), `expected ${skill} to be installed`).toBe(true);
    }
  });

  it('AC-5: does not install UX skills when no modules: key in existing settings', () => {
    mkdirSync(join(tmpDir, 'taproot'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'taproot', 'settings.yaml'),
      `taproot_version: '1.0.0'\nversion: 1\nroot: taproot/specs/\n`,
    );
    runInit({ cwd: tmpDir, agent: 'claude' });
    for (const skill of UX_SKILLS) {
      expect(uxSkillExists(tmpDir, skill), `expected ${skill} NOT to be installed`).toBe(false);
    }
  });

  it('AC-5: fresh init (no prior settings) does not install any module skills', () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    for (const skill of UX_SKILLS) {
      expect(uxSkillExists(tmpDir, skill), `expected ${skill} NOT to be installed`).toBe(false);
    }
  });

  it('AC-5: non-module skills are installed regardless of modules: setting', () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    expect(uxSkillExists(tmpDir, 'commit.md')).toBe(true);
    expect(uxSkillExists(tmpDir, 'intent.md')).toBe(true);
    expect(uxSkillExists(tmpDir, 'implement.md')).toBe(true);
  });
});

describe('module selection at init time (AC-20, AC-21)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-init-modules-prompt-'));
    mkdirSync(join(tmpDir, '.git'), { recursive: true });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // AC-20: selection written to settings.yaml
  it('AC-20: modules passed to runInit are written to settings.yaml under modules:', () => {
    runInit({ cwd: tmpDir, agent: 'claude', modules: ['user-experience'] });
    const settings = readSettings(tmpDir);
    expect(Array.isArray(settings['modules'])).toBe(true);
    expect(settings['modules']).toContain('user-experience');
  });

  it('AC-20: no modules selected — settings.yaml has no active modules: key', () => {
    runInit({ cwd: tmpDir, agent: 'claude', modules: [] });
    const settings = readSettings(tmpDir);
    expect(settings['modules']).toBeUndefined();
  });

  it('AC-20: selected module skills are installed when modules passed at init', () => {
    runInit({ cwd: tmpDir, agent: 'claude', modules: ['user-experience'] });
    for (const skill of UX_SKILLS) {
      expect(uxSkillExists(tmpDir, skill), `expected ${skill} to be installed`).toBe(true);
    }
  });

  // AC-21: --modules flag path (non-interactive) — tested via runInit with modules option
  it('AC-21: multiple modules written when multiple names provided', () => {
    const available = Object.keys(MODULE_SKILL_FILES);
    if (available.length < 2) return; // skip if only one module exists
    runInit({ cwd: tmpDir, agent: 'claude', modules: available.slice(0, 2) });
    const settings = readSettings(tmpDir);
    expect(Array.isArray(settings['modules'])).toBe(true);
    expect((settings['modules'] as string[]).length).toBe(2);
  });

  it('AC-21: modules not overwritten on re-run when already declared', () => {
    runInit({ cwd: tmpDir, agent: 'claude', modules: ['user-experience'] });
    // Second run without modules option — existing declaration preserved
    runInit({ cwd: tmpDir, agent: 'claude' });
    const settings = readSettings(tmpDir);
    expect(settings['modules']).toContain('user-experience');
  });
});
