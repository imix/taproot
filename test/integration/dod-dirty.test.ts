import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';
import { getOutOfScopeChanges } from '../../src/commands/dod.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'taproot-dirty-'));
}

function gitInit(dir: string): void {
  spawnSync('git', ['init'], { cwd: dir });
  spawnSync('git', ['config', 'user.email', 'test@test.com'], { cwd: dir });
  spawnSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
}

function gitAdd(dir: string, ...files: string[]): void {
  spawnSync('git', ['add', ...files], { cwd: dir });
}

function gitCommit(dir: string, msg: string): void {
  spawnSync('git', ['commit', '-m', msg, '--allow-empty'], { cwd: dir });
}

function makeImplMd(dir: string, sourceFiles: string[]): string {
  mkdirSync(join(dir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command'), { recursive: true });
  const implPath = join(dir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command', 'impl.md');
  const lines = [
    '# Implementation: Test',
    '',
    '## Behaviour',
    '../usecase.md',
    '',
    '## Source Files',
    ...sourceFiles.map(f => `- \`${f}\` — description`),
    '',
    '## Status',
    '- **State:** in-progress',
    '- **Created:** 2026-03-28',
    '- **Last verified:** 2026-03-28',
    '',
  ];
  writeFileSync(implPath, lines.join('\n'), 'utf-8');
  return 'taproot/some-intent/some-behaviour/cli-command/impl.md';
}

let dir: string;
beforeEach(() => {
  dir = makeTempDir();
  gitInit(dir);
  gitCommit(dir, 'initial');
});
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

// ─── AC-19: uncommitted changes outside impl scope are detected ───────────────

describe('AC-19: getOutOfScopeChanges', () => {
  it('returns empty when working tree is clean', () => {
    const implPath = makeImplMd(dir, ['src/foo.ts']);
    gitAdd(dir, '.');
    gitCommit(dir, 'add files');
    const result = getOutOfScopeChanges(implPath, dir);
    expect(result).toEqual([]);
  });

  it('returns empty when all dirty files are in Source Files', () => {
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'foo.ts'), 'initial', 'utf-8');
    const implPath = makeImplMd(dir, ['src/foo.ts']);
    gitAdd(dir, '.');
    gitCommit(dir, 'add files');
    // Modify a Source Files file
    writeFileSync(join(dir, 'src', 'foo.ts'), 'modified', 'utf-8');
    const result = getOutOfScopeChanges(implPath, dir);
    expect(result).toEqual([]);
  });

  it('returns out-of-scope file when an untracked file exists', () => {
    const implPath = makeImplMd(dir, ['src/foo.ts']);
    gitAdd(dir, '.');
    gitCommit(dir, 'add impl');
    // Create an untracked file not in Source Files
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'bar.ts'), 'new file', 'utf-8');
    const result = getOutOfScopeChanges(implPath, dir);
    expect(result).toContain('src/bar.ts');
  });

  it('returns out-of-scope file when a tracked file is modified outside Source Files', () => {
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'other.ts'), 'initial', 'utf-8');
    const implPath = makeImplMd(dir, ['src/foo.ts']);
    gitAdd(dir, '.');
    gitCommit(dir, 'add files');
    // Modify a file not in Source Files
    writeFileSync(join(dir, 'src', 'other.ts'), 'modified', 'utf-8');
    const result = getOutOfScopeChanges(implPath, dir);
    expect(result).toContain('src/other.ts');
  });

  it('excludes the impl.md itself from out-of-scope list', () => {
    const implPath = makeImplMd(dir, ['src/foo.ts']);
    // impl.md is untracked (not committed yet) — it should not appear as out-of-scope
    const result = getOutOfScopeChanges(implPath, dir);
    expect(result).not.toContain(implPath);
  });

  it('returns empty when impl has no ## Source Files section', () => {
    // Impl without Source Files section
    mkdirSync(join(dir, 'taproot', 'some-intent', 'other-beh', 'impl-x'), { recursive: true });
    writeFileSync(join(dir, 'taproot', 'some-intent', 'other-beh', 'impl-x', 'impl.md'), [
      '# Implementation: No Source Files',
      '',
      '## Behaviour',
      '../usecase.md',
      '',
      '## Status',
      '- **State:** in-progress',
      '',
    ].join('\n'), 'utf-8');
    // Create a dirty file
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'bar.ts'), 'new', 'utf-8');
    const result = getOutOfScopeChanges(
      'taproot/some-intent/other-beh/impl-x/impl.md', dir
    );
    // No Source Files section → skip check → return empty
    expect(result).toEqual([]);
  });

  it('returns empty when not in a git repo', () => {
    const implPath = makeImplMd(dir, ['src/foo.ts']);
    // Use a non-git subdirectory as cwd
    const nonGitDir = mkdtempSync(join(tmpdir(), 'nongit-'));
    try {
      const result = getOutOfScopeChanges(implPath, nonGitDir);
      expect(result).toEqual([]);
    } finally {
      rmSync(nonGitDir, { recursive: true, force: true });
    }
  });
});
