import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runDorChecks } from '../../src/core/dor-runner.js';

// ─── Activation regression ─────────────────────────────────────────────────
// These tests protect against the architecture-compliance DoR entry being
// accidentally removed from taproot's own settings.

describe('architecture-compliance activation (regression)', () => {
  it('taproot settings.yaml has check-if-affected-by: quality-gates/architecture-compliance in definitionOfReady', () => {
    const content = readFileSync('taproot/settings.yaml', 'utf-8');
    const dorIdx = content.indexOf('definitionOfReady:');
    const dodIdx = content.indexOf('definitionOfDone:');
    expect(dorIdx).toBeGreaterThanOrEqual(0);
    // Extract the definitionOfReady block (everything between its heading and the next top-level key)
    const dorBlock = content.slice(dorIdx, dodIdx > dorIdx ? dodIdx : undefined);
    expect(dorBlock).toContain('check-if-affected-by: quality-gates/architecture-compliance');
  });

  it('docs/architecture.md exists (precondition for the check to run)', () => {
    expect(existsSync('docs/architecture.md')).toBe(true);
  });

  it('docs/architecture.md is non-empty', () => {
    const content = readFileSync('docs/architecture.md', 'utf-8');
    expect(content.trim().length).toBeGreaterThan(0);
  });
});

// ─── DoR runner behaviour ──────────────────────────────────────────────────
// AC-1 / AC-3: the check is pending until the agent records a resolution;
// once recorded in impl.md it passes.

describe('architecture-compliance DoR runner behaviour', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-arch-'));
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
        '  - check-if-affected-by: quality-gates/architecture-compliance',
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
          `- condition: check-if-affected-by: quality-gates/architecture-compliance | note: design decisions reviewed against docs/architecture.md — no conflicts found | resolved: ${new Date().toISOString()}`,
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

  it('AC-1: check is pending (passed: false) when no resolution recorded', () => {
    const implPath = makeImplWithDorConfig(false);
    const report = runDorChecks(implPath, tmpDir);
    const archCheck = report.results.find(r => r.name === 'check-if-affected-by: quality-gates/architecture-compliance');
    expect(archCheck).toBeDefined();
    expect(archCheck!.passed).toBe(false);
    expect(archCheck!.output).toContain('Agent check required');
  });

  it('AC-3 / AC-1: check passes when agent has recorded a resolution', () => {
    const implPath = makeImplWithDorConfig(true);
    const report = runDorChecks(implPath, tmpDir);
    const archCheck = report.results.find(r => r.name === 'check-if-affected-by: quality-gates/architecture-compliance');
    expect(archCheck).toBeDefined();
    expect(archCheck!.passed).toBe(true);
  });
});
