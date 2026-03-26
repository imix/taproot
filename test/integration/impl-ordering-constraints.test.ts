import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runDorChecks } from '../../src/core/dor-runner.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VALID_USECASE = [
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
].join('\n');

const MINIMAL_SETTINGS = [
  'version: 1',
  'root: taproot/',
].join('\n');

function makeImpl(dependsOnLines: string | null, state = 'in-progress'): string {
  const dependsOnSection = dependsOnLines != null
    ? `\n## Depends On\n${dependsOnLines}\n`
    : '';
  return [
    '# Implementation: Some Feature',
    '',
    '## Behaviour',
    '../usecase.md',
    '',
    '## Source Files',
    '- `src/foo.ts` — does something',
    dependsOnSection,
    '## Status',
    `- **State:** ${state}`,
    '- **Created:** 2026-01-01',
    '- **Last verified:** 2026-01-01',
    '',
  ].join('\n');
}

function makeDepImpl(state: string, hasStateField = true): string {
  const statusLine = hasStateField ? `- **State:** ${state}` : '- no state here';
  return [
    '# Implementation: Other Feature',
    '',
    '## Behaviour',
    '../usecase.md',
    '',
    '## Status',
    statusLine,
    '- **Created:** 2026-01-01',
    '',
  ].join('\n');
}

// ─── Test setup ───────────────────────────────────────────────────────────────

describe('impl-ordering-constraints', () => {
  let tmpDir: string;
  let declaringImplPath: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-ordering-'));

    mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
    writeFileSync(join(tmpDir, '.taproot', 'settings.yaml'), MINIMAL_SETTINGS, 'utf-8');

    const behaviourDir = join(tmpDir, 'taproot', 'my-intent', 'my-behaviour');
    const implDir = join(behaviourDir, 'my-impl');
    mkdirSync(implDir, { recursive: true });
    writeFileSync(join(behaviourDir, 'usecase.md'), VALID_USECASE, 'utf-8');

    declaringImplPath = join(implDir, 'impl.md');
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // ── AC-3: No depends-on field — ordering check skipped ─────────────────────
  it('AC-3: no depends-on section — ordering check is skipped (no ordering-depends-on result)', () => {
    writeFileSync(declaringImplPath, makeImpl(null), 'utf-8');
    const report = runDorChecks(declaringImplPath, tmpDir);
    const orderingResult = report.results.find(r => r.name === 'ordering-depends-on');
    expect(orderingResult).toBeUndefined();
  });

  // ── AC-1: All dependencies complete — commit allowed ───────────────────────
  it('AC-1: single complete dependency — ordering check passes', () => {
    const depRelPath = 'taproot/other-intent/other-behaviour/other-impl/impl.md';
    const depDir = join(tmpDir, 'taproot', 'other-intent', 'other-behaviour', 'other-impl');
    mkdirSync(depDir, { recursive: true });
    writeFileSync(join(depDir, 'impl.md'), makeDepImpl('complete'), 'utf-8');

    writeFileSync(declaringImplPath, makeImpl(`- ${depRelPath}`), 'utf-8');
    const report = runDorChecks(declaringImplPath, tmpDir);
    const orderingResult = report.results.find(r => r.name === 'ordering-depends-on');
    expect(orderingResult).toBeDefined();
    expect(orderingResult!.passed).toBe(true);
  });

  // ── AC-2: Dependency not complete — commit blocked ─────────────────────────
  it('AC-2: dependency is in-progress — ordering check fails', () => {
    const depRelPath = 'taproot/other-intent/other-behaviour/other-impl/impl.md';
    const depDir = join(tmpDir, 'taproot', 'other-intent', 'other-behaviour', 'other-impl');
    mkdirSync(depDir, { recursive: true });
    writeFileSync(join(depDir, 'impl.md'), makeDepImpl('in-progress'), 'utf-8');

    writeFileSync(declaringImplPath, makeImpl(`- ${depRelPath}`), 'utf-8');
    const report = runDorChecks(declaringImplPath, tmpDir);
    const orderingResult = report.results.find(r => r.name === 'ordering-depends-on');
    expect(orderingResult).toBeDefined();
    expect(orderingResult!.passed).toBe(false);
    expect(orderingResult!.output).toContain('has state: in-progress');
    expect(orderingResult!.output).toContain(depRelPath);
  });

  // ── AC-4: Dependency path not found ───────────────────────────────────────
  it('AC-4: dependency path not found — ordering check fails with not-found message', () => {
    const depRelPath = 'taproot/nonexistent/impl.md';
    writeFileSync(declaringImplPath, makeImpl(`- ${depRelPath}`), 'utf-8');
    const report = runDorChecks(declaringImplPath, tmpDir);
    const orderingResult = report.results.find(r => r.name === 'ordering-depends-on');
    expect(orderingResult).toBeDefined();
    expect(orderingResult!.passed).toBe(false);
    expect(orderingResult!.output).toContain('does not exist');
  });

  // ── AC-5: Multiple dependencies, one incomplete ────────────────────────────
  it('AC-5: multiple deps, one incomplete — only the failing dep is mentioned', () => {
    const depARelPath = 'taproot/dep-a/behaviour/impl/impl.md';
    const depBRelPath = 'taproot/dep-b/behaviour/impl/impl.md';

    const depADir = join(tmpDir, 'taproot', 'dep-a', 'behaviour', 'impl');
    const depBDir = join(tmpDir, 'taproot', 'dep-b', 'behaviour', 'impl');
    mkdirSync(depADir, { recursive: true });
    mkdirSync(depBDir, { recursive: true });
    writeFileSync(join(depADir, 'impl.md'), makeDepImpl('complete'), 'utf-8');
    writeFileSync(join(depBDir, 'impl.md'), makeDepImpl('specified'), 'utf-8');

    writeFileSync(declaringImplPath, makeImpl(`- ${depARelPath}\n- ${depBRelPath}`), 'utf-8');
    const report = runDorChecks(declaringImplPath, tmpDir);
    const orderingResult = report.results.find(r => r.name === 'ordering-depends-on');
    expect(orderingResult).toBeDefined();
    expect(orderingResult!.passed).toBe(false);
    expect(orderingResult!.output).toContain(depBRelPath);
    expect(orderingResult!.output).not.toContain(depARelPath);
  });

  // ── AC-6: Transitive circular dependency ──────────────────────────────────
  it('AC-6: transitive cycle A→B→C→A — ordering check fails with cycle message', () => {
    const implAPath = 'taproot/my-intent/my-behaviour/my-impl/impl.md'; // the declaring impl
    const implBRelPath = 'taproot/chain-b/behaviour/impl/impl.md';
    const implCRelPath = 'taproot/chain-c/behaviour/impl/impl.md';

    const implBDir = join(tmpDir, 'taproot', 'chain-b', 'behaviour', 'impl');
    const implCDir = join(tmpDir, 'taproot', 'chain-c', 'behaviour', 'impl');
    mkdirSync(implBDir, { recursive: true });
    mkdirSync(implCDir, { recursive: true });

    // B depends on C
    writeFileSync(join(implBDir, 'impl.md'), [
      '# Implementation: B',
      '',
      '## Behaviour',
      '../usecase.md',
      '',
      '## Depends On',
      `- ${implCRelPath}`,
      '',
      '## Status',
      '- **State:** in-progress',
      '',
    ].join('\n'), 'utf-8');

    // C depends on A (the declaring impl) — creating cycle A→B→C→A
    writeFileSync(join(implCDir, 'impl.md'), [
      '# Implementation: C',
      '',
      '## Behaviour',
      '../usecase.md',
      '',
      '## Depends On',
      `- ${implAPath}`,
      '',
      '## Status',
      '- **State:** in-progress',
      '',
    ].join('\n'), 'utf-8');

    // A depends on B
    writeFileSync(declaringImplPath, makeImpl(`- ${implBRelPath}`), 'utf-8');

    const report = runDorChecks(declaringImplPath, tmpDir);
    const orderingResult = report.results.find(r => r.name === 'ordering-depends-on');
    expect(orderingResult).toBeDefined();
    expect(orderingResult!.passed).toBe(false);
    expect(orderingResult!.output).toContain('circular dependency');
  });

  // ── AC-7: Scalar (plain text) depends-on ──────────────────────────────────
  it('AC-7: scalar depends-on (no list prefix) — normalised to single-item list, check runs', () => {
    const depRelPath = 'taproot/other-intent/other-behaviour/other-impl/impl.md';
    const depDir = join(tmpDir, 'taproot', 'other-intent', 'other-behaviour', 'other-impl');
    mkdirSync(depDir, { recursive: true });
    writeFileSync(join(depDir, 'impl.md'), makeDepImpl('complete'), 'utf-8');

    // No "- " prefix — scalar format
    writeFileSync(declaringImplPath, makeImpl(depRelPath), 'utf-8');
    const report = runDorChecks(declaringImplPath, tmpDir);
    const orderingResult = report.results.find(r => r.name === 'ordering-depends-on');
    expect(orderingResult).toBeDefined();
    expect(orderingResult!.passed).toBe(true);
  });

  // ── AC-8: Malformed depends-on value ─────────────────────────────────────
  it('AC-8: malformed value (no path separators, no .md) — ordering check fails with type error', () => {
    writeFileSync(declaringImplPath, makeImpl('123'), 'utf-8');
    const report = runDorChecks(declaringImplPath, tmpDir);
    const orderingResult = report.results.find(r => r.name === 'ordering-depends-on');
    expect(orderingResult).toBeDefined();
    expect(orderingResult!.passed).toBe(false);
    expect(orderingResult!.output).toContain('depends-on must be a string path or list of string paths');
    expect(orderingResult!.output).toContain('123');
  });

  // ── AC-9: Dependency has no state field ───────────────────────────────────
  it('AC-9: dependency impl.md has no state field — ordering check fails with no-state message', () => {
    const depRelPath = 'taproot/other-intent/other-behaviour/other-impl/impl.md';
    const depDir = join(tmpDir, 'taproot', 'other-intent', 'other-behaviour', 'other-impl');
    mkdirSync(depDir, { recursive: true });
    writeFileSync(join(depDir, 'impl.md'), makeDepImpl('complete', false), 'utf-8');

    writeFileSync(declaringImplPath, makeImpl(`- ${depRelPath}`), 'utf-8');
    const report = runDorChecks(declaringImplPath, tmpDir);
    const orderingResult = report.results.find(r => r.name === 'ordering-depends-on');
    expect(orderingResult).toBeDefined();
    expect(orderingResult!.passed).toBe(false);
    expect(orderingResult!.output).toContain('has no state field');
  });

  // ── AC-10: Deferred dependency ────────────────────────────────────────────
  it('AC-10: dependency is deferred — ordering check fails', () => {
    const depRelPath = 'taproot/other-intent/other-behaviour/other-impl/impl.md';
    const depDir = join(tmpDir, 'taproot', 'other-intent', 'other-behaviour', 'other-impl');
    mkdirSync(depDir, { recursive: true });
    writeFileSync(join(depDir, 'impl.md'), makeDepImpl('deferred'), 'utf-8');

    writeFileSync(declaringImplPath, makeImpl(`- ${depRelPath}`), 'utf-8');
    const report = runDorChecks(declaringImplPath, tmpDir);
    const orderingResult = report.results.find(r => r.name === 'ordering-depends-on');
    expect(orderingResult).toBeDefined();
    expect(orderingResult!.passed).toBe(false);
    expect(orderingResult!.output).toContain('has state: deferred');
  });
});
