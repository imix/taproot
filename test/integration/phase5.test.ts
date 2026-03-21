import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { runCoverage, formatContext } from '../../src/commands/coverage.js';
import { runInit } from '../../src/commands/init.js';

const fixture = (name: string) => resolve(__dirname, '../fixtures', name);

let tmpDir: string;
beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'taproot-p5-'));
  mkdirSync(join(tmpDir, '.git'));
});
afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

// ─── coverage --format context ────────────────────────────────────────────────

describe('coverage --format context', () => {
  it('formatContext returns a string containing the summary', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const content = formatContext(report, '/tmp/CONTEXT.md');
    expect(content).toContain('# Taproot Context');
    expect(content).toContain('## Summary');
    expect(content).toContain('## Hierarchy');
  });

  it('formatContext includes intent and behaviour names', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const content = formatContext(report, '/tmp/CONTEXT.md');
    expect(content).toContain('user-onboarding');
    expect(content).toContain('register-account');
  });

  it('formatContext includes totals', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const content = formatContext(report, '/tmp/CONTEXT.md');
    expect(content).toContain('1');  // 1 intent
    expect(content).toContain('implementations');
  });

  it('formatContext marks impls with no tests as needing attention', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const content = formatContext(report, '/tmp/CONTEXT.md');
    // stripe-integration has 0 tests and is complete — should appear in needs attention
    expect(content).toContain('Missing tests');
    expect(content).toContain('stripe-integration');
  });

  it('formatContext includes a quick-reference CLI block', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const content = formatContext(report, '/tmp/CONTEXT.md');
    expect(content).toContain('taproot validate-structure');
    expect(content).toContain('taproot coverage');
  });

  it('formatContext has auto-generated comment', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const content = formatContext(report, '/tmp/CONTEXT.md');
    expect(content).toContain('Auto-generated');
    expect(content).toContain('do not edit manually');
  });
});

// ─── GitLab CI ────────────────────────────────────────────────────────────────

describe('taproot init --with-ci gitlab', () => {
  it('creates .gitlab-ci.yml when it does not exist', () => {
    runInit({ cwd: tmpDir, withCi: 'gitlab' });
    expect(existsSync(join(tmpDir, '.gitlab-ci.yml'))).toBe(true);
  });

  it('generated file contains taproot-validate job', () => {
    runInit({ cwd: tmpDir, withCi: 'gitlab' });
    const content = readFileSync(join(tmpDir, '.gitlab-ci.yml'), 'utf-8');
    expect(content).toContain('taproot-validate');
    expect(content).toContain('taproot validate-structure');
    expect(content).toContain('taproot validate-format');
  });

  it('appends taproot job to existing .gitlab-ci.yml', () => {
    const existing = 'stages:\n  - test\n  - deploy\n\nbuild:\n  stage: deploy\n  script:\n    - echo done\n';
    writeFileSync(join(tmpDir, '.gitlab-ci.yml'), existing);
    runInit({ cwd: tmpDir, withCi: 'gitlab' });
    const content = readFileSync(join(tmpDir, '.gitlab-ci.yml'), 'utf-8');
    expect(content).toContain('build:');         // original preserved
    expect(content).toContain('taproot-validate'); // new job appended
  });

  it('is idempotent — does not duplicate job when run twice', () => {
    runInit({ cwd: tmpDir, withCi: 'gitlab' });
    runInit({ cwd: tmpDir, withCi: 'gitlab' });
    const content = readFileSync(join(tmpDir, '.gitlab-ci.yml'), 'utf-8');
    const count = (content.match(/taproot-validate/g) ?? []).length;
    expect(count).toBe(1);
  });
});

// ─── GitHub CI ────────────────────────────────────────────────────────────────

describe('taproot init --with-ci github', () => {
  it('creates .github/workflows/taproot.yml', () => {
    runInit({ cwd: tmpDir, withCi: 'github' });
    expect(existsSync(join(tmpDir, '.github', 'workflows', 'taproot.yml'))).toBe(true);
  });

  it('generated file contains validate jobs', () => {
    runInit({ cwd: tmpDir, withCi: 'github' });
    const content = readFileSync(join(tmpDir, '.github', 'workflows', 'taproot.yml'), 'utf-8');
    expect(content).toContain('taproot validate-structure');
    expect(content).toContain('taproot validate-format');
    expect(content).toContain('taproot check-orphans');
  });
});

// ─── Pre-commit hook ──────────────────────────────────────────────────────────

describe('taproot init --with-hooks', () => {
  it('does not crash when .git directory is absent', () => {
    expect(() => runInit({ cwd: tmpDir, withHooks: true })).not.toThrow();
  });

  it('creates pre-commit hook when .git exists', () => {
    mkdirSync(join(tmpDir, '.git', 'hooks'), { recursive: true });
    runInit({ cwd: tmpDir, withHooks: true });
    expect(existsSync(join(tmpDir, '.git', 'hooks', 'pre-commit'))).toBe(true);
  });

  it('pre-commit hook delegates to taproot commithook', () => {
    mkdirSync(join(tmpDir, '.git', 'hooks'), { recursive: true });
    runInit({ cwd: tmpDir, withHooks: true });
    const content = readFileSync(join(tmpDir, '.git', 'hooks', 'pre-commit'), 'utf-8');
    expect(content).toContain('taproot commithook');
  });
});
