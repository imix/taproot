import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync, utimesSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { runDodChecks } from '../../src/core/dod-runner.js';
import { runDod, writeResolution, cascadeUsecaseState } from '../../src/commands/dod.js';

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
  mkdirSync(join(dir, '.taproot'), { recursive: true });
  writeFileSync(join(dir, '.taproot', 'settings.yaml'), yaml, 'utf-8');
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
  it('\1', async () => {
    const report = await runDodChecks(undefined, process.cwd());
    expect(report.configured).toBe(false);
    expect(report.allPassed).toBe(true);
    expect(report.results).toHaveLength(0);
  });

  it('\1', async () => {
    const report = await runDodChecks([], process.cwd());
    expect(report.configured).toBe(false);
    expect(report.allPassed).toBe(true);
  });
});

describe('runDodChecks — custom shell conditions', () => {
  it('\1', async () => {
    const report = await runDodChecks([{ run: 'true', name: 'always-pass' }], process.cwd());
    expect(report.configured).toBe(true);
    expect(report.results[0]!.passed).toBe(true);
    expect(report.allPassed).toBe(true);
  });

  it('\1', async () => {
    const report = await runDodChecks([{ run: 'false', name: 'always-fail' }], process.cwd());
    expect(report.results[0]!.passed).toBe(false);
    expect(report.allPassed).toBe(false);
  });

  it('\1', async () => {
    const report = await runDodChecks(
      [{ run: 'false', name: 'my-check', correction: 'Run the fix script' }],
      process.cwd()
    );
    expect(report.results[0]!.correction).toBe('Run the fix script');
  });

  it('\1', async () => {
    const report = await runDodChecks([{ run: 'false', name: 'my-check' }], process.cwd());
    expect(report.results[0]!.correction).toContain('re-run');
  });

  it('\1', async () => {
    const report = await runDodChecks(
      [{ run: 'echo "check failed"; exit 1', name: 'noisy-check' }],
      process.cwd()
    );
    expect(report.results[0]!.passed).toBe(false);
    expect(report.results[0]!.output).toContain('check failed');
  });

  it('\1', async () => {
    const report = await runDodChecks(
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

  it('\1', async () => {
    const report = await runDodChecks([{ run: 'true' }], process.cwd());
    expect(report.results[0]!.name).toBe('true');
  });
});

describe('runDodChecks — document-current condition', () => {
  it('\1', async () => {
    const report = await runDodChecks(
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

  it('\1', async () => {
    const report = await runDodChecks(
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
  it('\1', async () => {
    const report = await runDodChecks(
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

describe('runDodChecks — check-if-affected-by condition', () => {
  it('\1', async () => {
    const report = await runDodChecks(
      [{ 'check-if-affected-by': 'human-integration/contextual-next-steps' }],
      process.cwd()
    );
    expect(report.configured).toBe(true);
    expect(report.results[0]!.name).toBe('check-if-affected-by: human-integration/contextual-next-steps');
    expect(report.results[0]!.passed).toBe(false);
    expect(report.results[0]!.output).toContain('Agent check required');
    expect(report.results[0]!.correction).toContain('human-integration/contextual-next-steps');
    expect(report.allPassed).toBe(false);
  });
});

describe('runDodChecks — check: condition', () => {
  it('\1', async () => {
    const question = 'does this story introduce a cross-cutting concern?';
    const report = await runDodChecks([{ check: question }], process.cwd());
    expect(report.configured).toBe(true);
    expect(report.results[0]!.name).toBe(`check: ${question}`);
    expect(report.results[0]!.passed).toBe(false);
    expect(report.results[0]!.output).toContain('Agent check required');
    expect(report.results[0]!.correction).toContain(question);
    expect(report.allPassed).toBe(false);
  });

  it('\1', async () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'taproot-check-'));
    const question = 'does this story introduce a cross-cutting concern?';
    const conditionName = `check: ${question}`;
    const now = new Date().toISOString();

    // Create minimal behaviour/usecase.md so baseline passes
    const behaviourDir = join(tmpDir, 'taproot', 'my-behaviour');
    const implDir = join(behaviourDir, 'cli-command');
    mkdirSync(implDir, { recursive: true });

    writeFileSync(join(behaviourDir, 'usecase.md'), [
      '# Behaviour: My Behaviour',
      '## Status',
      '**State:** specified',
      '**Created:** 2026-01-01',
    ].join('\n'));

    const implPath = join(implDir, 'impl.md');
    writeFileSync(implPath, [
      '# Implementation: My Behaviour',
      '## Status',
      '**State:** in-progress',
      '**Created:** 2026-01-01',
      '## DoD Resolutions',
      `- condition: ${conditionName} | agent | resolved: ${now}`,
    ].join('\n'));

    const report = await runDodChecks(
      [{ check: question }],
      tmpDir,
      { implPath: join('taproot', 'my-behaviour', 'cli-command', 'impl.md') }
    );

    const result = report.results.find(r => r.name === conditionName);
    expect(result).toBeDefined();
    expect(result!.passed).toBe(true);

    rmSync(tmpDir, { recursive: true });
  });
});

describe('runDodChecks — command not found', () => {
  it('\1', async () => {
    const report = await runDodChecks(
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

  it('\1', async () => {
    makeUsecaseMd(tmpDir);
    const implPath = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command', 'impl.md');
    mkdirSync(join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command'), { recursive: true });
    writeFileSync(implPath, '# Impl\n\n## Status\n- **State:** in-progress\n- **Created:** 2026-03-19\n- **Last verified:** 2026-03-19\n');
    const report = await runDodChecks(undefined, tmpDir, { implPath });
    expect(report.configured).toBe(true);
    expect(report.results.some(r => r.name.startsWith('baseline-'))).toBe(true);
    expect(report.allPassed).toBe(true);
  });

  it('\1', async () => {
    const implDir = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command');
    mkdirSync(implDir, { recursive: true });
    const implPath = join(implDir, 'impl.md');
    writeFileSync(implPath, '# Impl\n\n## Status\n- **State:** in-progress\n- **Created:** 2026-03-19\n- **Last verified:** 2026-03-19\n');
    const report = await runDodChecks(undefined, tmpDir, { implPath });
    expect(report.allPassed).toBe(false);
    expect(report.results[0]!.name).toBe('baseline-usecase-exists');
    expect(report.results[0]!.passed).toBe(false);
  });

  it('\1', async () => {
    makeUsecaseMd(tmpDir, { state: 'proposed' });
    const implDir = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command');
    mkdirSync(implDir, { recursive: true });
    const implPath = join(implDir, 'impl.md');
    writeFileSync(implPath, '# Impl\n\n## Status\n- **State:** in-progress\n- **Created:** 2026-03-19\n- **Last verified:** 2026-03-19\n');
    const report = await runDodChecks(undefined, tmpDir, { implPath });
    const baselineState = report.results.find(r => r.name === 'baseline-state-specified');
    expect(baselineState?.passed).toBe(false);
    expect(baselineState?.output).toContain('proposed');
  });

  it('\1', async () => {
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
    const report = await runDodChecks(undefined, tmpDir, { implPath });
    const baselineFormat = report.results.find(r => r.name === 'baseline-validate-format');
    expect(baselineFormat?.passed).toBe(false);
    expect(baselineFormat?.output).toContain('Preconditions');
  });

  it('\1', async () => {
    makeUsecaseMd(tmpDir);
    const implDir = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command');
    mkdirSync(implDir, { recursive: true });
    const implPath = join(implDir, 'impl.md');
    writeFileSync(implPath, '# Impl\n\n## Status\n- **State:** in-progress\n- **Created:** 2026-03-19\n- **Last verified:** 2026-03-19\n');
    const report = await runDodChecks(undefined, tmpDir, { implPath });
    const baselineResults = report.results.filter(r => r.name.startsWith('baseline-'));
    expect(baselineResults.every(r => r.passed)).toBe(true);
  });
});

// ─── agent check resolution ───────────────────────────────────────────────────

describe('writeResolution and agent check passing', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('\1', async () => {
    const implPath = makeImplMd(tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'No changes needed', tmpDir);
    const content = readFileSync(implPath, 'utf-8');
    expect(content).toContain('## DoD Resolutions');
    expect(content).toContain('condition: check-if-affected: src/commands/update.ts');
    expect(content).toContain('No changes needed');
  });

  it('\1', async () => {
    const implPath = makeImplMd(tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'Not affected', tmpDir);
    const report = await runDodChecks(
      [{ 'check-if-affected': 'src/commands/update.ts' }],
      tmpDir,
      { implPath }
    );
    const result = report.results.find(r => r.name === 'check-if-affected: src/commands/update.ts');
    expect(result?.passed).toBe(true);
  });

  it('\1', async () => {
    const implPath = makeImplMd(tmpDir);
    const report = await runDodChecks(
      [{ 'check-if-affected': 'src/commands/update.ts' }],
      tmpDir,
      { implPath }
    );
    const result = report.results.find(r => r.name === 'check-if-affected: src/commands/update.ts');
    expect(result?.passed).toBe(false);
  });

  it('\1', async () => {
    const implPath = makeImplMd(tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'Not affected', tmpDir);
    // Simulate impl.md being modified 10 seconds after the resolution was recorded
    const future = new Date(Date.now() + 10_000);
    utimesSync(implPath, future, future);
    const report = await runDodChecks(
      [{ 'check-if-affected': 'src/commands/update.ts' }],
      tmpDir,
      { implPath }
    );
    const result = report.results.find(r => r.name === 'check-if-affected: src/commands/update.ts');
    expect(result?.passed).toBe(false);
    expect(result?.output).toContain('Agent check required');
  });

  it('\1', async () => {
    const implPath = makeImplMd(tmpDir);
    writeResolution(implPath, 'document-current', 'Docs updated', tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'Not affected', tmpDir);
    const content = readFileSync(implPath, 'utf-8');
    const count = (content.match(/condition:/g) ?? []).length;
    expect(count).toBe(2);
  });

  it('resolving the same condition twice updates in-place, no duplicate entry', () => {
    const implPath = makeImplMd(tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'First note', tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'Updated note', tmpDir);
    const content = readFileSync(implPath, 'utf-8');
    const count = (content.match(/condition: check-if-affected: src\/commands\/update\.ts/g) ?? []).length;
    expect(count).toBe(1);
    expect(content).toContain('Updated note');
    expect(content).not.toContain('First note');
  });

  it('resolving two different conditions produces exactly two entries', () => {
    const implPath = makeImplMd(tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'Not affected', tmpDir);
    writeResolution(implPath, 'check-if-affected: src/commands/update.ts', 'Still not affected', tmpDir);
    writeResolution(implPath, 'document-current', 'Docs current', tmpDir);
    const content = readFileSync(implPath, 'utf-8');
    const count = (content.match(/condition:/g) ?? []).length;
    expect(count).toBe(2);
  });

  it('multiple --resolve/--note pairs write all resolutions in one call via CLI action', async () => {
    // Simulate what the CLI does when called with multiple --resolve/--note flags
    const implPath = makeImplMd(tmpDir);
    const conditions = ['check-if-affected-by: human-integration/contextual-next-steps', 'check-if-affected-by: human-integration/pause-and-confirm'];
    const notes = ['Not applicable.', 'Not applicable.'];
    for (let i = 0; i < conditions.length; i++) {
      writeResolution(implPath, conditions[i]!, notes[i]!, tmpDir);
    }
    const content = readFileSync(implPath, 'utf-8');
    expect(content).toContain('contextual-next-steps');
    expect(content).toContain('pause-and-confirm');
    const count = (content.match(/condition:/g) ?? []).length;
    expect(count).toBe(2);
  });
});

// ─── cascadeUsecaseState ──────────────────────────────────────────────────────

describe('cascadeUsecaseState', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('\1', async () => {
    const implPath = makeImplMd(tmpDir); // creates usecase.md with state: specified
    const result = cascadeUsecaseState(implPath);
    expect(result).toBe('specified → implemented');
    const content = readFileSync(join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'usecase.md'), 'utf-8');
    expect(content).toContain('**State:** implemented');
  });

  it('\1', async () => {
    makeImplMd(tmpDir); // creates usecase with state: specified
    const usecasePath = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'usecase.md');
    const original = readFileSync(usecasePath, 'utf-8').replace('**State:** specified', '**State:** implemented');
    writeFileSync(usecasePath, original, 'utf-8');
    const implPath = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command', 'impl.md');
    const result = cascadeUsecaseState(implPath);
    expect(result).toBeNull();
    expect(readFileSync(usecasePath, 'utf-8')).toContain('**State:** implemented');
  });

  it('\1', async () => {
    const implDir = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command');
    mkdirSync(implDir, { recursive: true });
    const implPath = join(implDir, 'impl.md');
    writeFileSync(implPath, '# Impl\n## Status\n- **State:** in-progress\n');
    // No usecase.md created
    expect(() => cascadeUsecaseState(implPath)).not.toThrow();
    expect(cascadeUsecaseState(implPath)).toBeNull();
  });
});

// ─── runDod — cascade integration ────────────────────────────────────────────

describe('runDod — usecase state cascade', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('cascades usecase state to implemented when DoD passes', async () => {
    const implPath = makeImplMd(tmpDir, 'in-progress');
    writeConfig(tmpDir, [{ run: 'true', name: 'ok' }]);
    const report = await runDod({ implPath, cwd: tmpDir });
    expect(report.usecaseCascade).toBe('specified → implemented');
    const content = readFileSync(join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'usecase.md'), 'utf-8');
    expect(content).toContain('**State:** implemented');
  });

  it('does not cascade in dry-run mode', async () => {
    const implPath = makeImplMd(tmpDir, 'in-progress');
    writeConfig(tmpDir, [{ run: 'true', name: 'ok' }]);
    await runDod({ implPath, dryRun: true, cwd: tmpDir });
    const content = readFileSync(join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'usecase.md'), 'utf-8');
    expect(content).toContain('**State:** specified');
  });

  it('does not cascade when DoD fails', async () => {
    const implPath = makeImplMd(tmpDir, 'in-progress');
    writeConfig(tmpDir, [{ run: 'false', name: 'fail' }]);
    const report = await runDod({ implPath, cwd: tmpDir });
    expect(report.usecaseCascade).toBeUndefined();
    const content = readFileSync(join(tmpDir, 'taproot', 'some-intent', 'some-behaviour', 'usecase.md'), 'utf-8');
    expect(content).toContain('**State:** specified');
  });
});

// ─── runDod integration tests ─────────────────────────────────────────────────

describe('runDod — reads from .taproot/settings.yaml', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTempDir(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('returns configured: false when no DoD in config and no implPath', async () => {
    mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
    writeFileSync(join(tmpDir, '.taproot', 'settings.yaml'), 'version: 1\nroot: taproot/\n', 'utf-8');
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
    mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
    writeFileSync(join(tmpDir, '.taproot', 'settings.yaml'), 'version: 1\nroot: taproot/\n', 'utf-8');
    await runDod({ implPath, cwd: tmpDir });
    const content = readFileSync(implPath, 'utf-8');
    expect(content).toContain('**State:** complete');
  });
});
