import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { runDodChecks } from '../../src/core/dod-runner.js';
import { runDod } from '../../src/commands/dod.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'taproot-dod-'));
}

function writeConfig(dir: string, dodConditions: unknown[]): void {
  const yaml = [
    'version: 1',
    `root: taproot/`,
    'definitionOfDone:',
    ...dodConditions.map(c =>
      typeof c === 'string'
        ? `  - ${c}`
        : `  - run: "${(c as { run: string }).run}"${(c as { name?: string }).name ? `\n    name: ${(c as { name?: string }).name}` : ''}${(c as { correction?: string }).correction ? `\n    correction: "${(c as { correction?: string }).correction}"` : ''}`
    ),
  ].join('\n') + '\n';
  writeFileSync(join(dir, '.taproot.yaml'), yaml, 'utf-8');
}

function makeImplMd(dir: string, state = 'in-progress'): string {
  const implDir = join(dir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command');
  mkdirSync(implDir, { recursive: true });
  const implPath = join(implDir, 'impl.md');
  writeFileSync(implPath, [
    '# Implementation: Test',
    '',
    '## Behaviour',
    '../usecase.md',
    '',
    '## Status',
    `- **State:** ${state}`,
    '- **Created:** 2026-03-19',
    '- **Last verified:** 2026-03-19',
    '',
  ].join('\n'), 'utf-8');
  return implPath;
}

// ─── dod-runner unit tests ────────────────────────────────────────────────────

describe('runDodChecks — no DoD configured', () => {
  it('returns configured: false and allPassed: true when conditions is undefined', () => {
    const report = runDodChecks(undefined, process.cwd());
    expect(report.configured).toBe(false);
    expect(report.allPassed).toBe(true);
    expect(report.results).toHaveLength(0);
  });

  it('returns configured: false when conditions is empty array', () => {
    const report = runDodChecks([], process.cwd());
    expect(report.configured).toBe(false);
    expect(report.allPassed).toBe(true);
  });
});

describe('runDodChecks — custom shell conditions', () => {
  it('passes when shell command exits 0', () => {
    const report = runDodChecks([{ run: 'true', name: 'always-pass' }], process.cwd());
    expect(report.configured).toBe(true);
    expect(report.results[0]!.passed).toBe(true);
    expect(report.allPassed).toBe(true);
  });

  it('fails when shell command exits non-zero', () => {
    const report = runDodChecks([{ run: 'false', name: 'always-fail' }], process.cwd());
    expect(report.results[0]!.passed).toBe(false);
    expect(report.allPassed).toBe(false);
  });

  it('uses provided correction on failure', () => {
    const report = runDodChecks(
      [{ run: 'false', name: 'my-check', correction: 'Run the fix script' }],
      process.cwd()
    );
    expect(report.results[0]!.correction).toBe('Run the fix script');
  });

  it('falls back to default correction when none provided', () => {
    const report = runDodChecks([{ run: 'false', name: 'my-check' }], process.cwd());
    expect(report.results[0]!.correction).toContain('re-run');
  });

  it('captures stdout/stderr output on failure', () => {
    const report = runDodChecks(
      [{ run: 'echo "check failed"; exit 1', name: 'noisy-check' }],
      process.cwd()
    );
    expect(report.results[0]!.passed).toBe(false);
    expect(report.results[0]!.output).toContain('check failed');
  });

  it('runs ALL conditions even when an earlier one fails', () => {
    const report = runDodChecks(
      [
        { run: 'false', name: 'first-fails' },
        { run: 'true', name: 'second-runs' },
        { run: 'false', name: 'third-fails' },
      ],
      process.cwd()
    );
    expect(report.results).toHaveLength(3);
    expect(report.results[0]!.passed).toBe(false);
    expect(report.results[1]!.passed).toBe(true);
    expect(report.results[2]!.passed).toBe(false);
    expect(report.allPassed).toBe(false);
  });

  it('uses condition name from run when name not specified', () => {
    const report = runDodChecks([{ run: 'true' }], process.cwd());
    expect(report.results[0]!.name).toBe('true');
  });
});

describe('runDodChecks — command not found', () => {
  it('reports failure with correction for missing command', () => {
    const report = runDodChecks(
      [{ run: 'this-command-definitely-does-not-exist-xyz', name: 'missing' }],
      process.cwd()
    );
    expect(report.results[0]!.passed).toBe(false);
    expect(report.results[0]!.correction).toContain('executable');
  });
});

// ─── runDod integration tests ─────────────────────────────────────────────────

describe('runDod — reads from .taproot.yaml', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('returns configured: false when no DoD in config', async () => {
    writeFileSync(join(tmpDir, '.taproot.yaml'), 'version: 1\nroot: taproot/\n', 'utf-8');
    const report = await runDod({ cwd: tmpDir });
    expect(report.configured).toBe(false);
    expect(report.allPassed).toBe(true);
  });

  it('passes when all configured conditions pass', async () => {
    writeConfig(tmpDir, [{ run: 'true', name: 'ok' }]);
    const report = await runDod({ cwd: tmpDir });
    expect(report.allPassed).toBe(true);
  });

  it('fails when a configured condition fails', async () => {
    writeConfig(tmpDir, [{ run: 'false', name: 'nope' }]);
    const report = await runDod({ cwd: tmpDir });
    expect(report.allPassed).toBe(false);
  });
});

// ─── impl.md state update ─────────────────────────────────────────────────────

describe('runDod — impl.md state update', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('does not modify impl.md when no implPath provided (standalone mode)', async () => {
    const implPath = makeImplMd(tmpDir, 'in-progress');
    writeConfig(tmpDir, [{ run: 'true', name: 'ok' }]);
    const before = readFileSync(implPath, 'utf-8');
    await runDod({ cwd: tmpDir });  // no implPath
    const after = readFileSync(implPath, 'utf-8');
    expect(after).toBe(before);
  });

  it('marks impl complete when all conditions pass and implPath provided', async () => {
    const implPath = makeImplMd(tmpDir, 'in-progress');
    writeConfig(tmpDir, [{ run: 'true', name: 'ok' }]);
    await runDod({ implPath, cwd: tmpDir });
    const content = readFileSync(implPath, 'utf-8');
    expect(content).toContain('**State:** complete');
  });

  it('does not mark impl complete when a condition fails', async () => {
    const implPath = makeImplMd(tmpDir, 'in-progress');
    writeConfig(tmpDir, [{ run: 'false', name: 'fail' }]);
    await runDod({ implPath, cwd: tmpDir });
    const content = readFileSync(implPath, 'utf-8');
    expect(content).toContain('**State:** in-progress');
  });

  it('does not modify impl.md in dry-run mode even when all pass', async () => {
    const implPath = makeImplMd(tmpDir, 'in-progress');
    writeConfig(tmpDir, [{ run: 'true', name: 'ok' }]);
    await runDod({ implPath, dryRun: true, cwd: tmpDir });
    const content = readFileSync(implPath, 'utf-8');
    expect(content).toContain('**State:** in-progress');
  });
});
