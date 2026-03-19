import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runUpdate } from '../../src/commands/update.js';
import { generateAdapters } from '../../src/adapters/index.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'taproot-update-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('taproot update', () => {
  it('reports nothing to update when no adapters are installed', async () => {
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs[0]).toContain('No taproot agent adapters detected');
  });

  it('detects and regenerates claude adapter', async () => {
    generateAdapters('claude', tmpDir);
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs[0]).toContain('claude');
    expect(msgs.some(m => m.includes('tr-intent.md'))).toBe(true);
  });

  it('detects and regenerates cursor adapter', async () => {
    generateAdapters('cursor', tmpDir);
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs[0]).toContain('cursor');
    expect(msgs.some(m => m.includes('taproot.md'))).toBe(true);
  });

  it('removes stale .claude/skills/taproot/ directory', async () => {
    const staleDir = join(tmpDir, '.claude', 'skills', 'taproot');
    mkdirSync(staleDir, { recursive: true });
    writeFileSync(join(staleDir, 'intent.md'), 'old content');

    // Also put a tr- file in commands/ so claude is detected
    const commandsDir = join(tmpDir, '.claude', 'commands');
    mkdirSync(commandsDir, { recursive: true });
    writeFileSync(join(commandsDir, 'tr-intent.md'), 'new content');

    const msgs = await runUpdate({ cwd: tmpDir });
    expect(existsSync(staleDir)).toBe(false);
    expect(msgs.some(m => m.includes('removed') && m.includes('.claude/skills/taproot'))).toBe(true);
  });

  it('removes stale tr-*.md files in .claude/skills/', async () => {
    // Simulate the short-lived skills/ layout (before commands/)
    const skillsDir = join(tmpDir, '.claude', 'skills');
    mkdirSync(skillsDir, { recursive: true });
    writeFileSync(join(skillsDir, 'tr-intent.md'), 'old content');

    const msgs = await runUpdate({ cwd: tmpDir });
    expect(existsSync(join(skillsDir, 'tr-intent.md'))).toBe(false);
    expect(msgs.some(m => m.includes('removed') && m.includes('tr-intent.md'))).toBe(true);
  });

  it('detects old taproot/ subdir layout as claude and migrates to commands/', async () => {
    const staleDir = join(tmpDir, '.claude', 'skills', 'taproot');
    mkdirSync(staleDir, { recursive: true });
    writeFileSync(join(staleDir, 'intent.md'), 'old content');

    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs[0]).toContain('claude');
    expect(existsSync(staleDir)).toBe(false);
    expect(existsSync(join(tmpDir, '.claude', 'commands', 'tr-intent.md'))).toBe(true);
  });

  it('refreshes installed skills if present', async () => {
    generateAdapters('cursor', tmpDir);
    // Simulate previously installed skills
    const skillsDir = join(tmpDir, '.taproot', 'skills');
    mkdirSync(skillsDir, { recursive: true });
    writeFileSync(join(skillsDir, 'grill.md'), 'old skill content');

    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('skills'))).toBe(true);
  });

  it('ends with update complete message', async () => {
    generateAdapters('generic', tmpDir);
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs[msgs.length - 1]).toBe('Update complete.');
  });
});
