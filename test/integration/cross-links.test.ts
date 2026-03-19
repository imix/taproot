import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runValidateFormat } from '../../src/commands/validate-format.js';
import { refreshLinks } from '../../src/commands/update.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'taproot-cross-links-'));
}

function writeConfig(dir: string): void {
  writeFileSync(join(dir, '.taproot.yaml'), [
    'version: 1',
    'root: taproot/',
  ].join('\n') + '\n', 'utf-8');
}

function makeIntent(dir: string, slug: string, extra = ''): string {
  const intentDir = join(dir, 'taproot', slug);
  mkdirSync(intentDir, { recursive: true });
  const content = [
    `# Intent: ${slug}`,
    '',
    '## Stakeholders',
    '- Stakeholder: Owner — cares.',
    '',
    '## Goal',
    'Achieve something.',
    '',
    '## Success Criteria',
    '- [ ] It works.',
    '',
    extra,
    '## Status',
    '- **State:** active',
    '- **Created:** 2026-03-19',
    '- **Last reviewed:** 2026-03-19',
    '',
  ].join('\n');
  writeFileSync(join(intentDir, 'intent.md'), content, 'utf-8');
  return intentDir;
}

function makeBehaviour(intentDir: string, slug: string, extra = ''): string {
  const behaviourDir = join(intentDir, slug);
  mkdirSync(behaviourDir, { recursive: true });
  const content = [
    `# Behaviour: ${slug}`,
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
    '- (none)',
    '',
    extra,
    '## Status',
    '- **State:** specified',
    '- **Created:** 2026-03-19',
    '- **Last reviewed:** 2026-03-19',
    '',
  ].join('\n');
  writeFileSync(join(behaviourDir, 'usecase.md'), content, 'utf-8');
  return behaviourDir;
}

function makeImpl(behaviourDir: string, slug: string): string {
  const implDir = join(behaviourDir, slug);
  mkdirSync(implDir, { recursive: true });
  const content = [
    `# Implementation: ${slug}`,
    '',
    '## Behaviour',
    '../usecase.md',
    '',
    '## Design Decisions',
    '- No decisions.',
    '',
    '## Source Files',
    '- (none)',
    '',
    '## Commits',
    '- (none)',
    '',
    '## Tests',
    '- (none)',
    '',
    '## Status',
    '- **State:** complete',
    '- **Created:** 2026-03-19',
    '- **Last verified:** 2026-03-19',
    '',
  ].join('\n');
  writeFileSync(join(implDir, 'impl.md'), content, 'utf-8');
  return implDir;
}

// ─── validate-format: missing link sections ───────────────────────────────────

describe('validate-format — missing ## Behaviours on intent with children', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    makeBehaviour(intentDir, 'my-behaviour');
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('reports MISSING_LINK_SECTION for intent.md with child behaviour folders', async () => {
    const violations = await runValidateFormat({ path: join(dir, 'taproot'), cwd: dir });
    expect(violations.some(v => v.code === 'MISSING_LINK_SECTION' && v.message.includes('Behaviours'))).toBe(true);
  });
});

describe('validate-format — missing ## Implementations on usecase with children', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    const behaviourDir = makeBehaviour(intentDir, 'my-behaviour');
    makeImpl(behaviourDir, 'my-impl');
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('reports MISSING_LINK_SECTION for usecase.md with child impl folders', async () => {
    const violations = await runValidateFormat({ path: join(dir, 'taproot'), cwd: dir });
    expect(violations.some(v => v.code === 'MISSING_LINK_SECTION' && v.message.includes('Implementations'))).toBe(true);
  });
});

describe('validate-format — link sections present and valid', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(
      dir, 'my-intent',
      '## Behaviours <!-- taproot-managed -->\n- [My Behaviour](./my-behaviour/usecase.md)\n'
    );
    makeBehaviour(intentDir, 'my-behaviour',
      '## Implementations <!-- taproot-managed -->\n- [My Impl](./my-impl/impl.md)\n'
    );
    const behaviourDir = join(intentDir, 'my-behaviour');
    makeImpl(behaviourDir, 'my-impl');
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('passes with no MISSING_LINK_SECTION or STALE_LINK errors', async () => {
    const violations = await runValidateFormat({ path: join(dir, 'taproot'), cwd: dir });
    const linkErrors = violations.filter(v => v.code === 'MISSING_LINK_SECTION' || v.code === 'STALE_LINK');
    expect(linkErrors).toHaveLength(0);
  });
});

describe('validate-format — stale link detection', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    makeIntent(
      dir, 'my-intent',
      '## Behaviours <!-- taproot-managed -->\n- [Gone](./gone/usecase.md)\n'
    );
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('reports STALE_LINK when linked file does not exist', async () => {
    const violations = await runValidateFormat({ path: join(dir, 'taproot'), cwd: dir });
    expect(violations.some(v => v.code === 'STALE_LINK')).toBe(true);
  });
});

// ─── refreshLinks ─────────────────────────────────────────────────────────────

describe('refreshLinks — adds ## Behaviours section to intent without one', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    makeBehaviour(intentDir, 'my-behaviour');
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('inserts ## Behaviours section with correct link', () => {
    const msgs = refreshLinks(dir, join(dir, 'taproot'));
    expect(msgs.some(m => m.includes('my-intent'))).toBe(true);

    const intentContent = readFileSync(join(dir, 'taproot', 'my-intent', 'intent.md'), 'utf-8');
    expect(intentContent).toContain('## Behaviours <!-- taproot-managed -->');
    expect(intentContent).toContain('./my-behaviour/usecase.md');
  });
});

describe('refreshLinks — adds ## Implementations section to usecase without one', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    const behaviourDir = makeBehaviour(intentDir, 'my-behaviour');
    makeImpl(behaviourDir, 'my-impl');
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('inserts ## Implementations section with correct link', () => {
    refreshLinks(dir, join(dir, 'taproot'));

    const usecaseContent = readFileSync(
      join(dir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), 'utf-8'
    );
    expect(usecaseContent).toContain('## Implementations <!-- taproot-managed -->');
    expect(usecaseContent).toContain('./my-impl/impl.md');
  });
});

describe('refreshLinks — idempotent', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    makeBehaviour(intentDir, 'my-behaviour');
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('produces no changes on second run', () => {
    refreshLinks(dir, join(dir, 'taproot'));
    const contentAfterFirst = readFileSync(
      join(dir, 'taproot', 'my-intent', 'intent.md'), 'utf-8'
    );

    const msgs = refreshLinks(dir, join(dir, 'taproot'));
    const contentAfterSecond = readFileSync(
      join(dir, 'taproot', 'my-intent', 'intent.md'), 'utf-8'
    );

    expect(msgs).toHaveLength(0);
    expect(contentAfterSecond).toBe(contentAfterFirst);
  });
});

describe('refreshLinks — prunes stale links', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    // Intent with a stale link (no actual behaviour folder)
    makeIntent(dir, 'my-intent',
      '## Behaviours <!-- taproot-managed -->\n- [Gone](./gone/usecase.md)\n'
    );
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('removes the stale link from the section', () => {
    refreshLinks(dir, join(dir, 'taproot'));
    const content = readFileSync(join(dir, 'taproot', 'my-intent', 'intent.md'), 'utf-8');
    expect(content).not.toContain('./gone/usecase.md');
  });
});

describe('refreshLinks — title extracted from first # Heading', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    makeBehaviour(intentDir, 'my-behaviour');
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('uses the title from usecase.md heading, stripping type prefix', () => {
    refreshLinks(dir, join(dir, 'taproot'));
    const content = readFileSync(join(dir, 'taproot', 'my-intent', 'intent.md'), 'utf-8');
    // The behaviour heading is "# Behaviour: my-behaviour" → title is "my-behaviour"
    expect(content).toContain('[my-behaviour]');
  });
});

describe('refreshLinks — fallback to folder slug when no heading', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
    writeConfig(dir);
    const intentDir = makeIntent(dir, 'my-intent');
    // Write a usecase.md with no # heading
    const behaviourDir = join(intentDir, 'headless-behaviour');
    mkdirSync(behaviourDir, { recursive: true });
    writeFileSync(join(behaviourDir, 'usecase.md'), [
      '## Actor',
      'Someone.',
      '',
      '## Preconditions',
      '- None.',
      '',
      '## Main Flow',
      '1. Step.',
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
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('falls back to folder slug as link title', () => {
    refreshLinks(dir, join(dir, 'taproot'));
    const content = readFileSync(join(dir, 'taproot', 'my-intent', 'intent.md'), 'utf-8');
    expect(content).toContain('[headless-behaviour]');
  });
});
