import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runCoverage } from '../../src/commands/coverage.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'taproot-linked-coverage-'));
}

function writeConfig(dir: string): void {
  mkdirSync(join(dir, '.taproot'), { recursive: true });
  writeFileSync(join(dir, '.taproot', 'settings.yaml'), [
    'version: 1',
    'root: taproot/specs/',
  ].join('\n') + '\n', 'utf-8');
}

function makeIntent(dir: string, slug: string): string {
  const intentDir = join(dir, 'taproot', 'specs', slug);
  mkdirSync(intentDir, { recursive: true });
  writeFileSync(join(intentDir, 'intent.md'), [
    `# Intent: ${slug}`,
    '',
    '## Stakeholders',
    '- Owner — cares.',
    '',
    '## Goal',
    'Achieve something.',
    '',
    '## Success Criteria',
    '- [ ] It works.',
    '',
    '## Status',
    '- **State:** active',
    '- **Created:** 2026-03-31',
    '- **Last reviewed:** 2026-03-31',
    '',
  ].join('\n'), 'utf-8');
  return intentDir;
}

function makeBehaviour(intentDir: string, slug: string): string {
  const behaviourDir = join(intentDir, slug);
  mkdirSync(behaviourDir, { recursive: true });
  writeFileSync(join(behaviourDir, 'usecase.md'), [
    `# Behaviour: ${slug}`,
    '',
    '## Actor',
    'A test actor.',
    '',
    '## Status',
    '- **State:** specified',
    '- **Created:** 2026-03-31',
    '- **Last reviewed:** 2026-03-31',
    '',
  ].join('\n'), 'utf-8');
  return behaviourDir;
}

function makeImpl(behaviourDir: string, slug: string, state: string, sourceFiles: string[]): string {
  const implDir = join(behaviourDir, slug);
  mkdirSync(implDir, { recursive: true });
  const sourceLines = sourceFiles.length > 0
    ? sourceFiles.map(f => `- \`${f}\` — the file`)
    : ['- (none)'];
  writeFileSync(join(implDir, 'impl.md'), [
    `# Implementation: ${slug}`,
    '',
    '## Behaviour',
    '../usecase.md',
    '',
    '## Design Decisions',
    '- None.',
    '',
    '## Source Files',
    ...sourceLines,
    '',
    '## Commits',
    '- (none)',
    '',
    '## Tests',
    '- (none)',
    '',
    '## Status',
    `- **State:** ${state}`,
    '- **Created:** 2026-03-31',
    '- **Last verified:** 2026-03-31',
    '',
  ].join('\n'), 'utf-8');
  return implDir;
}

function makeLinkFile(dir: string, name: string, type: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), [
    '# Link: External Spec',
    '',
    '**Repo:** https://github.com/org/source',
    '**Path:** taproot/specs/auth/login/usecase.md',
    `**Type:** ${type}`,
  ].join('\n'), 'utf-8');
}

function makeReposYaml(dir: string, entries: Record<string, string>): void {
  mkdirSync(join(dir, '.taproot'), { recursive: true });
  const lines = Object.entries(entries).map(([url, p]) => `"${url}": "${p}"`);
  writeFileSync(join(dir, '.taproot', 'repos.yaml'), lines.join('\n') + '\n', 'utf-8');
}

// ─── AC-1: link + complete impl → counted as implemented ─────────────────────

describe('linked coverage — AC-1: complete impl counts link as implemented', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    const behaviourDir = makeBehaviour(intentDir, 'my-behaviour');
    // Link file in behaviour folder
    makeLinkFile(behaviourDir, 'link.md', 'behaviour');
    // impl.md references the link file and is complete
    makeImpl(behaviourDir, 'my-impl', 'complete', ['../link.md']);
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('counts linked behaviour as implemented when impl.md is complete', async () => {
    const report = await runCoverage({ path: join(dir, 'taproot', 'specs'), cwd: dir });
    const behaviour = report.intents[0]!.behaviours[0]!;
    const linked = behaviour.linkedItems.find(l => l.linkType === 'behaviour');
    expect(linked).toBeDefined();
    expect(linked!.implState).toBe('complete');
    expect(report.totals.completeImpls).toBeGreaterThan(0);
  });

  it('marks the linked item in the output', async () => {
    const report = await runCoverage({ path: join(dir, 'taproot', 'specs'), cwd: dir });
    const { formatReport } = await import('../../src/commands/coverage.js');
    const output = formatReport(report, 'tree');
    expect(output).toContain('[linked]');
    expect(output).toContain('complete');
  });
});

// ─── AC-2: link + pending impl → counted as pending ──────────────────────────

describe('linked coverage — AC-2: pending impl counts link as pending', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    const behaviourDir = makeBehaviour(intentDir, 'my-behaviour');
    makeLinkFile(behaviourDir, 'link.md', 'behaviour');
    makeImpl(behaviourDir, 'my-impl', 'in-progress', ['../link.md']);
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('counts linked behaviour as pending when impl.md is not complete', async () => {
    const report = await runCoverage({ path: join(dir, 'taproot', 'specs'), cwd: dir });
    const behaviour = report.intents[0]!.behaviours[0]!;
    const linked = behaviour.linkedItems.find(l => l.linkType === 'behaviour');
    expect(linked).toBeDefined();
    expect(linked!.implState).toBe('pending');
    // impl count includes pending impl
    expect(report.totals.implementations).toBeGreaterThan(0);
    // but not as complete
    expect(report.totals.completeImpls).toBe(0);
  });
});

// ─── AC-3: no impl → linked behaviour is a gap ───────────────────────────────

describe('linked coverage — AC-3: no impl means linked behaviour is a gap', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    const behaviourDir = makeBehaviour(intentDir, 'my-behaviour');
    makeLinkFile(behaviourDir, 'link.md', 'behaviour');
    // No impl.md that references the link file
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('counts linked behaviour as gap when no impl.md references it', async () => {
    const report = await runCoverage({ path: join(dir, 'taproot', 'specs'), cwd: dir });
    const behaviour = report.intents[0]!.behaviours[0]!;
    const linked = behaviour.linkedItems.find(l => l.linkType === 'behaviour');
    expect(linked).toBeDefined();
    expect(linked!.implState).toBe('gap');
    // gap contributes to behaviour count but not impl count
    expect(report.totals.behaviours).toBeGreaterThan(0);
    expect(report.totals.implementations).toBe(0);
  });
});

// ─── AC-4: unresolvable link target → warning, count unaffected ───────────────

describe('linked coverage — AC-4: unresolvable link does not throw, shows warning', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    const behaviourDir = makeBehaviour(intentDir, 'my-behaviour');
    makeLinkFile(behaviourDir, 'link.md', 'behaviour');
    makeImpl(behaviourDir, 'my-impl', 'complete', ['../link.md']);
    // Repos.yaml present but the repo URL is not mapped
    makeReposYaml(dir, { 'https://github.com/org/other': '/some/path' });
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('sets warnUnresolvable and does not throw', async () => {
    const report = await runCoverage({ path: join(dir, 'taproot', 'specs'), cwd: dir });
    const behaviour = report.intents[0]!.behaviours[0]!;
    const linked = behaviour.linkedItems.find(l => l.linkType === 'behaviour');
    expect(linked).toBeDefined();
    expect(linked!.warnUnresolvable).toBe(true);
    // Count is still based on local impl state
    expect(linked!.implState).toBe('complete');
    expect(report.totals.completeImpls).toBeGreaterThan(0);
  });

  it('shows unresolvable warning in tree output', async () => {
    const report = await runCoverage({ path: join(dir, 'taproot', 'specs'), cwd: dir });
    const { formatReport } = await import('../../src/commands/coverage.js');
    const output = formatReport(report, 'tree');
    expect(output).toContain('unresolvable');
  });
});

// ─── AC-5: intent-type link → counted in intent coverage ─────────────────────

describe('linked coverage — AC-5: intent-type link counts toward intent coverage', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    // Link file at behaviour-level folder but with Type: intent
    const behaviourDir = makeBehaviour(intentDir, 'my-behaviour');
    makeLinkFile(behaviourDir, 'link.md', 'intent');
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('counts intent-type link in linkedIntents total, not behaviour total', async () => {
    const report = await runCoverage({ path: join(dir, 'taproot', 'specs'), cwd: dir });
    const behaviour = report.intents[0]!.behaviours[0]!;
    const linked = behaviour.linkedItems.find(l => l.linkType === 'intent');
    expect(linked).toBeDefined();
    // Intent-type links are NOT counted in behaviour-level impl totals
    expect(report.totals.implementations).toBe(0);
  });
});
