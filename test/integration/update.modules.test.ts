import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runUpdate } from '../../src/commands/update.js';
import { generateAdapters } from '../../src/adapters/index.js';
import { MODULE_SKILL_FILES } from '../../src/commands/init.js';

const UX_SKILLS = MODULE_SKILL_FILES['user-experience']!;

function setupClaudeProject(dir: string, modulesYaml = ''): void {
  mkdirSync(join(dir, '.git'), { recursive: true });
  // Install claude adapter so update detects and runs
  generateAdapters('claude', dir);
  // Write taproot/settings.yaml
  mkdirSync(join(dir, 'taproot'), { recursive: true });
  const modulesBlock = modulesYaml ? `\n${modulesYaml}\n` : '';
  writeFileSync(
    join(dir, 'taproot', 'settings.yaml'),
    `taproot_version: '1.0.0'\nversion: 1\nroot: taproot/specs/${modulesBlock}`,
  );
}

function skillsDir(dir: string): string {
  return join(dir, 'taproot', 'agent', 'skills');
}

function uxSkillExists(dir: string, filename: string): boolean {
  return existsSync(join(skillsDir(dir), filename));
}

describe('module installation opt-in (taproot update)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-modules-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // AC-1: Declared module skills installed
  it('AC-1: installs user-experience skills when modules: [user-experience] declared', async () => {
    setupClaudeProject(tmpDir, 'modules:\n  - user-experience');
    const msgs = await runUpdate({ cwd: tmpDir });
    for (const skill of UX_SKILLS) {
      expect(uxSkillExists(tmpDir, skill), `expected ${skill} to be installed`).toBe(true);
    }
    expect(msgs.some(m => m.includes('ux-define.md'))).toBe(true);
  });

  // AC-2: No modules declared — no module skills present
  it('AC-2: does not install any UX skills when no modules: key present', async () => {
    setupClaudeProject(tmpDir);
    await runUpdate({ cwd: tmpDir });
    for (const skill of UX_SKILLS) {
      expect(uxSkillExists(tmpDir, skill), `expected ${skill} NOT to be installed`).toBe(false);
    }
  });

  it('AC-2: does not install any UX skills when modules: is empty', async () => {
    setupClaudeProject(tmpDir, 'modules: []');
    await runUpdate({ cwd: tmpDir });
    for (const skill of UX_SKILLS) {
      expect(uxSkillExists(tmpDir, skill), `expected ${skill} NOT to be installed`).toBe(false);
    }
  });

  // AC-3: Module removed from declaration — skills removed
  it('AC-3: removes UX skills when user-experience is removed from modules list', async () => {
    // First install with module declared
    setupClaudeProject(tmpDir, 'modules:\n  - user-experience');
    await runUpdate({ cwd: tmpDir });
    expect(uxSkillExists(tmpDir, 'ux-define.md')).toBe(true);

    // Then update settings to remove the module
    writeFileSync(
      join(tmpDir, 'taproot', 'settings.yaml'),
      `taproot_version: '1.0.0'\nversion: 1\nroot: taproot/specs/\n`,
    );
    const msgs = await runUpdate({ cwd: tmpDir });
    for (const skill of UX_SKILLS) {
      expect(uxSkillExists(tmpDir, skill), `expected ${skill} to be removed`).toBe(false);
    }
    expect(msgs.some(m => m.includes('removed') && m.includes('ux-define.md'))).toBe(true);
  });

  // AC-4: Unknown module name reported
  it('AC-4: reports unknown module name and lists available modules', async () => {
    setupClaudeProject(tmpDir, 'modules:\n  - unknown-module');
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('Unknown module') && m.includes('unknown-module'))).toBe(true);
    expect(msgs.some(m => m.includes('user-experience'))).toBe(true);
  });

  it('AC-4: continues installing valid modules when one is unknown', async () => {
    setupClaudeProject(tmpDir, 'modules:\n  - unknown-module\n  - user-experience');
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('Unknown module'))).toBe(true);
    expect(uxSkillExists(tmpDir, 'ux-define.md')).toBe(true);
  });

  // AC-6: Non-module skills unaffected
  it('AC-6: installs non-module skills regardless of modules: setting', async () => {
    setupClaudeProject(tmpDir); // no modules
    await runUpdate({ cwd: tmpDir });
    expect(uxSkillExists(tmpDir, 'commit.md')).toBe(true);
    expect(uxSkillExists(tmpDir, 'intent.md')).toBe(true);
    expect(uxSkillExists(tmpDir, 'implement.md')).toBe(true);
  });
});
