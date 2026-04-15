import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
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
    expect(msgs.some(m => m.includes('No taproot agent adapters detected'))).toBe(true);
  });

  it('detects and regenerates claude adapter', async () => {
    generateAdapters('claude', tmpDir);
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('claude'))).toBe(true);
    expect(msgs.some(m => m.includes('tr-intent.md'))).toBe(true);
  });

  it('detects and regenerates cursor adapter', async () => {
    generateAdapters('cursor', tmpDir);
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('cursor'))).toBe(true);
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
    expect(msgs.some(m => m.includes('claude'))).toBe(true);
    expect(existsSync(staleDir)).toBe(false);
    expect(existsSync(join(tmpDir, '.claude', 'commands', 'tr-intent.md'))).toBe(true);
  });

  it('refreshes installed skills if present', async () => {
    generateAdapters('cursor', tmpDir);
    // Simulate previously installed skills
    const skillsDir = join(tmpDir, '.taproot', 'skills');
    mkdirSync(skillsDir, { recursive: true });
    writeFileSync(join(skillsDir, 'behaviour.md'), 'old skill content');

    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => /updated\s+.+skills\/.+\(\d+ files\) — v\d+\.\d+\.\d+/.test(m))).toBe(true);
  });

  it('ends with update complete message', async () => {
    generateAdapters('generic', tmpDir);
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs[msgs.length - 1]).toBe('Update complete.');
  });

  it('migrates old pre-commit hook to taproot commithook', async () => {
    generateAdapters('claude', tmpDir);
    const hookDir = join(tmpDir, '.git', 'hooks');
    mkdirSync(hookDir, { recursive: true });
    writeFileSync(join(hookDir, 'pre-commit'), '#!/bin/sh\ntaproot validate-structure\ntaproot validate-format\n', { mode: 0o755 });

    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('migrated') && m.includes('pre-commit'))).toBe(true);
    const migratedHook = readFileSync(join(hookDir, 'pre-commit'), 'utf-8');
    expect(migratedHook).toContain('taproot/agent/bin/taproot');
    expect(migratedHook).toContain('commithook');
  });

  it('installs hook with --with-hooks when none exists', async () => {
    generateAdapters('generic', tmpDir);
    mkdirSync(join(tmpDir, '.git', 'hooks'), { recursive: true });

    const msgs = await runUpdate({ cwd: tmpDir, withHooks: true });
    expect(existsSync(join(tmpDir, '.git', 'hooks', 'pre-commit'))).toBe(true);
    expect(msgs.some(m => m.includes('created') && m.includes('pre-commit'))).toBe(true);
  });

  it('reports exists for hook with --with-hooks when hook already present', async () => {
    generateAdapters('generic', tmpDir);
    const hookDir = join(tmpDir, '.git', 'hooks');
    mkdirSync(hookDir, { recursive: true });
    writeFileSync(join(hookDir, 'pre-commit'), '#!/bin/sh\ntaproot commithook\n', { mode: 0o755 });

    const msgs = await runUpdate({ cwd: tmpDir, withHooks: true });
    expect(msgs.some(m => m.includes('exists') && m.includes('pre-commit'))).toBe(true);
  });

  it('installs docs to .taproot/docs/ when claude adapter is present', async () => {
    generateAdapters('claude', tmpDir);
    const msgs = await runUpdate({ cwd: tmpDir });
    const docsDir = join(tmpDir, '.taproot', 'docs');
    expect(existsSync(docsDir)).toBe(true);
    expect(existsSync(join(docsDir, 'patterns.md'))).toBe(true);
    expect(msgs.some(m => /updated\s+.+docs\/.+\(\d+ files\) — v\d+\.\d+\.\d+/.test(m))).toBe(true);
  });

  it('refreshes docs with updated content on re-run', async () => {
    generateAdapters('claude', tmpDir);
    mkdirSync(join(tmpDir, 'taproot', 'agent'), { recursive: true }); // use new layout
    await runUpdate({ cwd: tmpDir });

    const patternsPath = join(tmpDir, 'taproot', 'agent', 'docs', 'patterns.md');
    writeFileSync(patternsPath, 'stale content');

    const msgs = await runUpdate({ cwd: tmpDir });
    expect(readFileSync(patternsPath, 'utf-8')).not.toBe('stale content');
    expect(msgs.some(m => /updated\s+.+docs\/.+\(\d+ files\) — v\d+\.\d+\.\d+/.test(m))).toBe(true);
  });

  it('does not install docs when no claude adapter and no existing docs', async () => {
    generateAdapters('cursor', tmpDir);
    await runUpdate({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, '.taproot', 'docs'))).toBe(false);
  });
});
