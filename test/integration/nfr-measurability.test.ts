import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runDorChecks } from '../../src/core/dor-runner.js';

// ─── Activation regression ─────────────────────────────────────────────────
// Protects against the nfr-measurability DoR entry being accidentally removed.

describe('nfr-measurability activation (regression)', () => {
  it('taproot settings.yaml has check-if-affected-by: quality-gates/nfr-measurability in definitionOfReady', () => {
    const content = readFileSync('taproot/settings.yaml', 'utf-8');
    const dorIdx = content.indexOf('definitionOfReady:');
    const dodIdx = content.indexOf('definitionOfDone:');
    expect(dorIdx).toBeGreaterThanOrEqual(0);
    const dorBlock = content.slice(dorIdx, dodIdx > dorIdx ? dodIdx : undefined);
    expect(dorBlock).toContain('check-if-affected-by: quality-gates/nfr-measurability');
  });
});

// ─── DoR runner behaviour ──────────────────────────────────────────────────
// AC-1 / AC-2: the check is pending until the agent records a resolution;
// once recorded in impl.md it passes.

describe('nfr-measurability DoR runner behaviour', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-nfr-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function makeImplWithDorConfig(withResolution: boolean): string {
    mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
    writeFileSync(
      join(tmpDir, '.taproot', 'settings.yaml'),
      [
        'version: 1',
        'root: taproot/',
        'definitionOfReady:',
        '  - check-if-affected-by: quality-gates/nfr-measurability',
      ].join('\n') + '\n',
      'utf-8',
    );

    const behaviourDir = join(tmpDir, 'taproot', 'some-intent', 'some-behaviour');
    const implDir = join(behaviourDir, 'cli-command');
    mkdirSync(implDir, { recursive: true });

    writeFileSync(
      join(behaviourDir, 'usecase.md'),
      [
        '# Behaviour: Some Behaviour',
        '',
        '## Actor',
        'Developer',
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
        '## Flow',
        '```mermaid',
        'flowchart TD',
        '  A --> B',
        '```',
        '',
        '## Related',
        '- ../other/usecase.md',
        '',
        '## Status',
        '- **State:** specified',
        '- **Created:** 2026-01-01',
        '- **Last reviewed:** 2026-01-01',
        '',
      ].join('\n'),
      'utf-8',
    );

    const dorResolutionBlock = withResolution
      ? [
          '',
          '## DoR Resolutions',
          `- condition: check-if-affected-by: quality-gates/nfr-measurability | note: not applicable — no NFR-N entries in parent usecase.md | resolved: ${new Date().toISOString()}`,
          '',
        ].join('\n')
      : '';

    const implPath = join(implDir, 'impl.md');
    writeFileSync(
      implPath,
      [
        '# Implementation: Some Behaviour',
        '',
        '## Behaviour',
        '../usecase.md',
        '',
        '## Status',
        '- **State:** in-progress',
        '- **Created:** 2026-01-01',
        '- **Last verified:** 2026-01-01',
        '',
      ].join('\n') + dorResolutionBlock,
      'utf-8',
    );

    return implPath;
  }

  it('check is pending (passed: false) when no resolution recorded', () => {
    const implPath = makeImplWithDorConfig(false);
    const report = runDorChecks(implPath, tmpDir);
    const nfrCheck = report.results.find(r => r.name === 'check-if-affected-by: quality-gates/nfr-measurability');
    expect(nfrCheck).toBeDefined();
    expect(nfrCheck!.passed).toBe(false);
    expect(nfrCheck!.output).toContain('Agent check required');
  });

  it('check passes when agent has recorded a resolution', () => {
    const implPath = makeImplWithDorConfig(true);
    const report = runDorChecks(implPath, tmpDir);
    const nfrCheck = report.results.find(r => r.name === 'check-if-affected-by: quality-gates/nfr-measurability');
    expect(nfrCheck).toBeDefined();
    expect(nfrCheck!.passed).toBe(true);
  });
});
