import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { execSync, spawnSync } from 'child_process';
import { runCommit } from '../../src/commands/commit.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TMP = resolve(__dirname, '../../.tmp-commit-test');
const CLI = resolve(__dirname, '../../dist/cli.js');

function initRepo(cwd: string) {
  execSync('git init', { cwd });
  execSync('git config user.email "test@test.com"', { cwd });
  execSync('git config user.name "Test"', { cwd });
  execSync('git commit --allow-empty -m "init"', { cwd });
}

function setup() {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  initRepo(TMP);
}

function teardown() {
  rmSync(TMP, { recursive: true, force: true });
}

function staged(cwd: string): string[] {
  return spawnSync('git', ['diff', '--cached', '--name-only'], { cwd, encoding: 'utf-8' })
    .stdout.split('\n').filter(Boolean);
}

function log(cwd: string): string {
  return spawnSync('git', ['log', '--oneline', '-2'], { cwd, encoding: 'utf-8' }).stdout;
}

beforeEach(setup);
afterEach(teardown);

// ── AC-2 / AC-3: truth-sign skipped when no hierarchy files or no global-truths ─

describe('AC-2: no hierarchy files staged — truth-sign skipped', () => {
  it('commits source-only changes without calling truth-sign', () => {
    writeFileSync(join(TMP, 'src.ts'), 'const x = 1;');
    execSync('git add src.ts', { cwd: TMP });

    const result = runCommit({ message: 'add src', cwd: TMP });
    expect(result).toBe(0);
    expect(log(TMP)).toContain('add src');
    // taproot/truth-checks.md should NOT be staged when truth-sign skipped
    const commitFiles = spawnSync('git', ['show', '--name-only', 'HEAD'], { cwd: TMP, encoding: 'utf-8' }).stdout;
    expect(commitFiles).not.toContain('truth-checks.md');
  });
});

describe('AC-3: no global-truths directory — truth-sign skipped', () => {
  it('commits hierarchy files without calling truth-sign when global-truths absent', () => {
    mkdirSync(join(TMP, 'taproot/specs/foo'), { recursive: true });
    writeFileSync(join(TMP, 'taproot/specs/foo/intent.md'), '# Intent: Foo\n\n## Goal\nEnable foo.\n\n## Stakeholders\n- Dev\n\n## Success Criteria\n- Bar happens\n');
    execSync('git add taproot/', { cwd: TMP });

    const result = runCommit({ message: 'add intent', cwd: TMP });
    expect(result).toBe(0);
    expect(log(TMP)).toContain('add intent');
    const commitFiles = spawnSync('git', ['show', '--name-only', 'HEAD'], { cwd: TMP, encoding: 'utf-8' }).stdout;
    expect(commitFiles).not.toContain('truth-checks.md');
  });
});

// ── AC-4: --all stages all changes ────────────────────────────────────────────

describe('AC-4: --all stages all changes before committing', () => {
  it('stages all modified files when --all is passed', () => {
    writeFileSync(join(TMP, 'a.txt'), 'hello');
    writeFileSync(join(TMP, 'b.txt'), 'world');
    // do NOT git add manually

    const result = runCommit({ message: 'add files', all: true, cwd: TMP });
    expect(result).toBe(0);
    const commitFiles = spawnSync('git', ['show', '--name-only', 'HEAD'], { cwd: TMP, encoding: 'utf-8' }).stdout;
    expect(commitFiles).toContain('a.txt');
    expect(commitFiles).toContain('b.txt');
  });
});

// ── AC-5: nothing staged and no --all — informative error ─────────────────────

describe('AC-5: nothing staged and no --all — informative error', () => {
  it('reports nothing staged and exits non-zero', () => {
    // No staged files
    let stderrOutput = '';
    const origStderr = process.stderr.write.bind(process.stderr);
    (process.stderr as any).write = (chunk: string) => { stderrOutput += chunk; return true; };

    const result = runCommit({ message: 'empty', cwd: TMP });

    (process.stderr as any).write = origStderr;

    expect(result).toBe(1);
    expect(stderrOutput).toContain('Nothing staged');
    expect(stderrOutput).toContain('--all');
  });
});

// ── AC-7: dry-run makes no changes ────────────────────────────────────────────

describe('AC-7: dry-run makes no changes', () => {
  it('reports what would happen without modifying git state', () => {
    writeFileSync(join(TMP, 'file.txt'), 'content');
    execSync('git add file.txt', { cwd: TMP });

    const result = runCommit({ message: 'test', dryRun: true, cwd: TMP });
    expect(result).toBe(0);

    // Nothing actually committed
    const logOut = log(TMP);
    expect(logOut).not.toContain('test');
    // File still staged
    expect(staged(TMP)).toContain('file.txt');
  });
});
