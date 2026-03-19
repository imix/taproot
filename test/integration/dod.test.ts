import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync, utimesSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { runDodChecks } from '../../src/core/dod-runner.js';
import { runDod, writeResolution } from '../../src/commands/dod.js';

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

function makeUsecaseMd(dir: string, { state = 'specified', withRelated = true } = {}): string {
  const behaviourDir = join(dir, 'taproot', 'some-intent', 'some-behaviour');
  mkdirSync(behaviourDir, { recursive: true });
  const usecasePath = join(behaviourDir, 'usecase.md');
  const sections = [
    '# Behaviour: Test',
    '',
    '## Actor',
    'A test actor.',
    '',
    '## Preconditions',
    '- None.',
    '',
    '## Main Flow',
    '1. Step one.',
    '',
    '## Postconditions',
    '- Done.',
    '',
  ];
  sections.push('## Flow', '```mermaid', 'flowchart TD', '  A --> B', '```', '');
  if (withRelated) {
    sections.push('## Related', '- ../other/usecase.md', '');
  }
  sections.push('## Status', `- **State:** ${state}`, '- **Created:** 2026-03-19', '- **Last reviewed:** 2026-03-19', '');
  writeFileSync(usecasePath, sections.join('\n'), 'utf-8');
  return usecasePath;
}

function makeImplMd(dir: string, state = 'in-progress'): string {
  makeUsecaseMd(dir); // always create a valid usecase alongside
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

describe('runDodChecks — document-current condition', () => {
  it('reports as agent check (not passed) with description as correction', () => {
    const report = runDodChecks(
      [{ 'document-current': 'ensure all sections in readme.md are up to date' }],
      process.cwd()
    );
    expect(report.configured).toBe(true);
    expect(report.results[0]!.name).toBe('document-current');
    expect(report.results[0]!.passed).toBe(false);
    expect(report.results[0]!.correction).toBe('ensure all sections in readme.md are up to date');
    expect(report.results[0]!.output).toContain('Agent check required');
    expect(report.allPassed).toBe(false);
  });

  it('runs subsequent conditions after document-current', () => {
    const report = runDodChecks(
      [
        { 'document-current': 'check readme' },
        { run: 'true', name: 'after' },
      ],
      process.cwd()
    );
    expect(report.results).toHaveLength(2);
    expect(report.results[1]!.passed).toBe(true);
  });
});

describe('runDodChecks — check-if-affected condition', () => {
  it('reports as agent check (not passed) with target as description', () => {
    const report = runDodChecks(
      [{ 'check-if-affected': 'src/commands/update.ts' }],
      process.cwd()
    );
    expect(report.configured).toBe(true);
    expect(report.results[0]!.name).toBe('check-if-affected: src/commands/update.ts');
    expect(report.results[0]!.passed).toBe(false);
    expect(report.results[0]!.output).toContain('Agent check required');
    expect(report.results[0]!.correction).toContain('src/commands/update.ts');
    expect(report.allPassed).toBe(false);
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

// ─── DoD baseline ─────────────────────────────────────────────────────────────

describe('runDodChecks — DoD baseline (implPath provided)', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('runs baseline checks and reports configured: true even with no conditions', () => {
    makeUsecaseMd(tmpDir);
    const implPath = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command', 'impl.md');
    mkdirSync(join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command'), { recursive: true });
    writeFileSync(implPath, '# Impl\n\n## Status\n- **State:** in-progress\n- **Created:** 2026-03-19\n- **Last verified:** 2026-03-19\n');
    const report = runDodChecks(undefined, tmpDir, { implPath });
    expect(report.configured).toBe(true);
    expect(report.results.some(r => r.name.startsWith('baseline-'))).toBe(true);
    expect(report.allPassed).toBe(true);
  });

  it('fails baseline when usecase.md is missing', () => {
    const implDir = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command');
    mkdirSync(implDir, { recursive: true });
    const implPath = join(implDir, 'impl.md');
    writeFileSync(implPath, '# Impl\n\n## Status\n- **State:** in-progress\n- **Created:** 2026-03-19\n- **Last verified:** 2026-03-19\n');
    const report = runDodChecks(undefined, tmpDir, { implPath });
    expect(report.allPassed).toBe(false);
    expect(report.results[0]!.name).toBe('baseline-usecase-exists');
    expect(report.results[0]!.passed).toBe(false);
  });

  it('fails baseline when usecase.md state is not specified', () => {
    makeUsecaseMd(tmpDir, { state: 'proposed' });
    const implDir = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command');
    mkdirSync(implDir, { recursive: true });
    const implPath = join(implDir, 'impl.md');
    writeFileSync(implPath, '# Impl\n\n## Status\n- **State:** in-progress\n- **Created:** 2026-03-19\n- **Last verified:** 2026-03-19\n');
    const report = runDodChecks(undefined, tmpDir, { implPath });
    const baselineState = report.results.find(r => r.name === 'baseline-state-specified');
    expect(baselineState?.passed).toBe(false);
    expect(baselineState?.output).toContain('proposed');
  });

  it('fails baseline when usecase.md is missing a required section (e.g. ## Preconditions)', () => {
    const behaviourDir = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour');
    mkdirSync(behaviourDir, { recursive: true });
    // Write a usecase missing ## Preconditions (required by validate-format)
    writeFileSync(join(behaviourDir, 'usecase.md'), [
      '# Behaviour: Test',
      '',
      '## Actor',
      'A test actor.',
      '',
      '## Main Flow',
      '1. Step one.',
      '',
      '## Postconditions',
      '- Done.',
      '',
      '## Status',
      '- **State:** specified',
      '- **Created:** 2026-03-19',
      '- **Last reviewed:** 2026-03-19',
      '',
    ].join('\n'), 'utf-8');
    const implDir = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command');
    mkdirSync(implDir, { recursive: true });
    const implPath = join(implDir, 'impl.md');
    writeFileSync(implPath, '# Impl\n\n## Status\n- **State:** in-progress\n- **Created:** 2026-03-19\n- **Last verified:** 2026-03-19\n');
    const report = runDodChecks(undefined, tmpDir, { implPath });
    const baselineFormat = report.results.find(r => r.name === 'baseline-validate-format');
    expect(baselineFormat?.passed).toBe(false);
    expect(baselineFormat?.output).toContain('Preconditions');
  });

  it('passes all baseline checks with a valid usecase.md', () => {
    makeUsecaseMd(tmpDir);
    const implDir = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command');
    mkdirSync(implDir, { recursive: true });
    const implPath = join(implDir, 'impl.md');
    writeFileSync(implPath, '# Impl\n\n## Status\n- **State:** in-progress\n- **Created:** 2026-03-19\n- **Last verified:** 2026-03-19\n');
    const report = runDodChecks(undefined, tmpDir, { implPath });
    const baselineResults = report.results.filter(r => r.name.startsWith('baseline-'));
    expect(baselineResults.every(r => r.passed)).toBe(true);
  });
});

// ─── agent check resolution ───────────────────────────────────────────────────

describe('writeResolution and agent check passing', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('writeResolution appends ## DoD Resolutions section to impl.md', () => {
    const implPath = makeImplMd(tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'No changes needed', tmpDir);
    const content = readFileSync(implPath, 'utf-8');
    expect(content).toContain('## DoD Resolutions');
    expect(content).toContain('condition: check-if-affected: src/commands/update.ts');
    expect(content).toContain('No changes needed');
  });

  it('agent check passes when resolution exists in impl.md', () => {
    const implPath = makeImplMd(tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'Not affected', tmpDir);
    const report = runDodChecks(
      [{ 'check-if-affected': 'src/commands/update.ts' }],
      tmpDir,
      { implPath }
    );
    const result = report.results.find(r => r.name === 'check-if-affected: src/commands/update.ts');
    expect(result?.passed).toBe(true);
  });

  it('agent check fails when no resolution recorded', () => {
    const implPath = makeImplMd(tmpDir);
    const report = runDodChecks(
      [{ 'check-if-affected': 'src/commands/update.ts' }],
      tmpDir,
      { implPath }
    );
    const result = report.results.find(r => r.name === 'check-if-affected: src/commands/update.ts');
    expect(result?.passed).toBe(false);
  });

  it('agent check fails when resolution is stale (impl.md modified after resolution)', () => {
    const implPath = makeImplMd(tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'Not affected', tmpDir);
    // Simulate impl.md being modified 10 seconds after the resolution was recorded
    const future = new Date(Date.now() + 10_000);
    utimesSync(implPath, future, future);
    const report = runDodChecks(
      [{ 'check-if-affected': 'src/commands/update.ts' }],
      tmpDir,
      { implPath }
    );
    const result = report.results.find(r => r.name === 'check-if-affected: src/commands/update.ts');
    expect(result?.passed).toBe(false);
    expect(result?.output).toContain('Agent check required');
  });

  it('writeResolution appends to existing ## DoD Resolutions section', () => {
    const implPath = makeImplMd(tmpDir);
    writeResolution(implPath, 'document-current', 'Docs updated', tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'Not affected', tmpDir);
    const content = readFileSync(implPath, 'utf-8');
    const count = (content.match(/condition:/g) ?? []).length;
    expect(count).toBe(2);
  });
});

// ─── runDod integration tests ─────────────────────────────────────────────────

describe('runDod — reads from .taproot.yaml', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('returns configured: false when no DoD in config and no implPath', async () => {
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

  it('runs baseline and marks complete when no conditions configured but implPath given', async () => {
    const implPath = makeImplMd(tmpDir, 'in-progress');
    writeFileSync(join(tmpDir, '.taproot.yaml'), 'version: 1\nroot: taproot/\n', 'utf-8');
    await runDod({ implPath, cwd: tmpDir });
    const content = readFileSync(implPath, 'utf-8');
    expect(content).toContain('**State:** complete');
  });
});
