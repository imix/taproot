import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runInit, MODULE_SKILL_FILES } from '../../src/commands/init.js';

const UX_SKILLS = MODULE_SKILL_FILES['user-experience']!;

function skillsDir(dir: string): string {
  return join(dir, 'taproot', 'agent', 'skills');
}

function uxSkillExists(dir: string, filename: string): boolean {
  return existsSync(join(skillsDir(dir), filename));
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
