import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runDodChecks, globMatches } from '../../src/core/dod-runner.js';
import { loadConfig } from '../../src/core/config.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'taproot-scoped-'));
}

function writeConfigYaml(dir: string, content: string): void {
  mkdirSync(join(dir, '.taproot'), { recursive: true });
  writeFileSync(join(dir, '.taproot', 'settings.yaml'), content, 'utf-8');
}

function makeUsecaseMd(dir: string): string {
  const behaviourDir = join(dir, 'taproot', 'some-intent', 'some-behaviour');
  mkdirSync(behaviourDir, { recursive: true });
  const usecasePath = join(behaviourDir, 'usecase.md');
  writeFileSync(usecasePath, [
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
    '- **Created:** 2026-03-28',
    '- **Last reviewed:** 2026-03-28',
    '',
  ].join('\n'), 'utf-8');
  return usecasePath;
}

function makeImplMd(dir: string, sourceFiles: string[] | null): string {
  makeUsecaseMd(dir);
  const implDir = join(dir, 'taproot', 'some-intent', 'some-behaviour', 'cli-command');
  mkdirSync(implDir, { recursive: true });
  const implPath = join(implDir, 'impl.md');
  const lines = [
    '# Implementation: Test',
    '',
    '## Behaviour',
    '../usecase.md',
    '',
  ];
  if (sourceFiles !== null) {
    lines.push('## Source Files');
    for (const f of sourceFiles) {
      lines.push(`- \`${f}\` — description`);
    }
    lines.push('');
  }
  lines.push(
    '## Status',
    '- **State:** in-progress',
    '- **Created:** 2026-03-28',
    '- **Last verified:** 2026-03-28',
    '',
  );
  writeFileSync(implPath, lines.join('\n'), 'utf-8');
  return implPath;
}

let dir: string;
beforeEach(() => { dir = makeTempDir(); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

// ─── globMatches unit tests ───────────────────────────────────────────────────

describe('globMatches', () => {
  it('matches exact path', () => {
    expect(globMatches('skills/commit.md', 'skills/commit.md')).toBe(true);
  });

  it('does not match different path', () => {
    expect(globMatches('skills/commit.md', 'src/commit.ts')).toBe(false);
  });

  it('* matches within a segment', () => {
    expect(globMatches('skills/*.md', 'skills/commit.md')).toBe(true);
    expect(globMatches('skills/*.md', 'skills/plan-execute.md')).toBe(true);
    expect(globMatches('skills/*.md', 'src/commit.ts')).toBe(false);
    expect(globMatches('skills/*.md', 'nested/skills/commit.md')).toBe(false);
  });

  it('* does not cross directory separator', () => {
    expect(globMatches('src/*.ts', 'src/nested/file.ts')).toBe(false);
  });

  it('** matches across segments', () => {
    expect(globMatches('src/**/*.ts', 'src/core/dod-runner.ts')).toBe(true);
    expect(globMatches('src/**/*.ts', 'src/validators/types.ts')).toBe(true);
    expect(globMatches('src/**/*.ts', 'src/deep/a/b/c.ts')).toBe(true);
    expect(globMatches('src/**/*.ts', 'lib/core/file.ts')).toBe(false);
  });
});

// ─── AC-1: scoped condition auto-resolves when no source file matches ─────────

describe('AC-1: scoped condition auto-resolves when no source file matches', () => {
  it('skill-file scoped check auto-resolves for TypeScript-only impl', async () => {
    writeConfigYaml(dir, [
      'version: 1',
      'root: taproot/',
      'definitionOfDone:',
      '  - check-if-affected-by: skill-architecture/context-engineering',
      '    when:',
      '      source-matches: "skills/*.md"',
    ].join('\n'));
    const implPath = makeImplMd(dir, ['src/core/dod-runner.ts', 'src/validators/types.ts']);
    const { config } = loadConfig(dir);
    const report = await runDodChecks(config.definitionOfDone, dir, { implPath, config });
    const result = report.results.find(r => r.name.includes('skill-architecture/context-engineering'));
    expect(result).toBeDefined();
    expect(result!.passed).toBe(true);
    expect(result!.output).toContain('not applicable');
    expect(result!.output).toContain('skills/*.md');
  });
});

// ─── AC-2: scoped condition runs normally when a source file matches ──────────

describe('AC-2: scoped condition runs when source file matches', () => {
  it('skill-file scoped check runs (as agent-check) for skill-file impl', async () => {
    writeConfigYaml(dir, [
      'version: 1',
      'root: taproot/',
      'definitionOfDone:',
      '  - check-if-affected-by: skill-architecture/context-engineering',
      '    when:',
      '      source-matches: "skills/*.md"',
    ].join('\n'));
    const implPath = makeImplMd(dir, ['skills/commit.md', 'taproot/agent/skills/commit.md']);
    const { config } = loadConfig(dir);
    const report = await runDodChecks(config.definitionOfDone, dir, { implPath, config });
    const result = report.results.find(r => r.name.includes('skill-architecture/context-engineering'));
    expect(result).toBeDefined();
    // Should run as agent check required — not auto-resolved
    expect(result!.passed).toBe(false);
    expect(result!.output).toContain('Agent check required');
  });
});

// ─── AC-3: unscoped conditions are unaffected ─────────────────────────────────

describe('AC-3: unscoped conditions run unconditionally', () => {
  it('unscoped agent check runs even for TypeScript-only impl', async () => {
    writeConfigYaml(dir, [
      'version: 1',
      'root: taproot/',
      'definitionOfDone:',
      '  - check-if-affected-by: human-integration/contextual-next-steps',
      '  - check-if-affected-by: skill-architecture/context-engineering',
      '    when:',
      '      source-matches: "skills/*.md"',
    ].join('\n'));
    const implPath = makeImplMd(dir, ['src/core/dod-runner.ts']);
    const { config } = loadConfig(dir);
    const report = await runDodChecks(config.definitionOfDone, dir, { implPath, config });

    const unscoped = report.results.find(r => r.name.includes('human-integration/contextual-next-steps'));
    const scoped = report.results.find(r => r.name.includes('skill-architecture/context-engineering'));

    expect(unscoped?.passed).toBe(false); // agent check required — runs
    expect(unscoped?.output).toContain('Agent check required');

    expect(scoped?.passed).toBe(true); // auto-resolved
    expect(scoped?.output).toContain('not applicable');
  });
});

// ─── AC-4: impl with no ## Source Files auto-resolves all scoped conditions ───

describe('AC-4: no ## Source Files section auto-resolves scoped conditions', () => {
  it('all scoped conditions auto-resolve when impl has no Source Files section', async () => {
    writeConfigYaml(dir, [
      'version: 1',
      'root: taproot/',
      'definitionOfDone:',
      '  - check-if-affected-by: skill-architecture/context-engineering',
      '    when:',
      '      source-matches: "skills/*.md"',
    ].join('\n'));
    const implPath = makeImplMd(dir, null); // null = no ## Source Files section
    const { config } = loadConfig(dir);
    const report = await runDodChecks(config.definitionOfDone, dir, { implPath, config });
    const result = report.results.find(r => r.name.includes('skill-architecture/context-engineering'));
    expect(result?.passed).toBe(true);
    expect(result?.output).toContain('no ## Source Files section');
  });
});

// ─── AC-5: malformed when: qualifier produces a parse error ──────────────────

describe('AC-5: malformed when: qualifier produces a parse error', () => {
  it('unknown qualifier type fails with descriptive error', async () => {
    writeConfigYaml(dir, [
      'version: 1',
      'root: taproot/',
      'definitionOfDone:',
      '  - check-if-affected-by: skill-architecture/context-engineering',
      '    when:',
      '      unknown-key: "*.ts"',
    ].join('\n'));
    const implPath = makeImplMd(dir, ['src/dod-runner.ts']);
    const { config } = loadConfig(dir);
    const report = await runDodChecks(config.definitionOfDone, dir, { implPath, config });
    const result = report.results.find(r => !r.name.includes('baseline'));
    expect(result?.passed).toBe(false);
    expect(result?.output).toContain("unrecognised 'when:'");
    expect(result?.output).toContain('unknown-key');
  });
});
