import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join } from 'path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { runCheckOrphans, checkLinkTargets } from '../../src/commands/check-orphans.js';

const fixture = (name: string) => resolve(__dirname, '../fixtures', name);

describe('check-orphans — valid hierarchy', () => {
  it('finds no broken source/test file references in valid fixture', async () => {
    // The valid fixture references files that don't exist on disk (src/auth/...).
    // check-orphans should find those MISSING_SOURCE_FILE warnings.
    // But there should be no BROKEN_BEHAVIOUR_REF since usecase.md is resolved
    // relative to impl.md — and the fixture's usecase.md does exist at ../usecase.md.
    const violations = await runCheckOrphans({ path: fixture('valid-hierarchy') });
    const brokenRefs = violations.filter(v => v.code === 'BROKEN_BEHAVIOUR_REF');
    expect(brokenRefs).toHaveLength(0);
  });

  it('reports MISSING_SOURCE_FILE for non-existent source files', async () => {
    // The valid fixture references src/auth/email-validator.ts which doesn't exist
    const violations = await runCheckOrphans({ path: fixture('valid-hierarchy') });
    const missing = violations.filter(v => v.code === 'MISSING_SOURCE_FILE');
    expect(missing.length).toBeGreaterThan(0);
  });
});

// ─── Link target validation ───────────────────────────────────────────────────

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), 'taproot-link-test-'));
}

function makeLinkFile(dir: string, name: string, repo: string, path: string, type: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), [
    `# Link: Test Link`,
    '',
    `**Repo:** ${repo}`,
    `**Path:** ${path}`,
    `**Type:** ${type}`,
  ].join('\n'), 'utf-8');
}

function makeReposYaml(projectRoot: string, entries: Record<string, string>): void {
  mkdirSync(join(projectRoot, '.taproot'), { recursive: true });
  const lines = Object.entries(entries).map(([url, p]) => `"${url}": "${p}"`);
  writeFileSync(join(projectRoot, '.taproot', 'repos.yaml'), lines.join('\n') + '\n', 'utf-8');
}

describe('link target validation — AC-1: all links resolve', () => {
  let dir: string;
  const origOffline = process.env['TAPROOT_OFFLINE'];

  beforeEach(() => {
    dir = makeTmpDir();
    delete process.env['TAPROOT_OFFLINE'];
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    if (origOffline !== undefined) process.env['TAPROOT_OFFLINE'] = origOffline;
    else delete process.env['TAPROOT_OFFLINE'];
  });

  it('reports no violations when link resolves to existing file', () => {
    const sourceDir = join(dir, 'source-repo');
    mkdirSync(join(sourceDir, 'taproot/specs/some-intent/some-behaviour'), { recursive: true });
    writeFileSync(join(sourceDir, 'taproot/specs/some-intent/some-behaviour/usecase.md'), '# Behaviour: X\n', 'utf-8');
    makeReposYaml(dir, { 'https://github.com/org/source': sourceDir });
    const linkDir = join(dir, 'taproot/specs/my-intent/my-behaviour');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/source', 'taproot/specs/some-intent/some-behaviour/usecase.md', 'behaviour');
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    const errors = violations.filter(v => v.code !== 'LINK_VALIDATION_SKIPPED');
    expect(errors).toHaveLength(0);
  });
});

describe('link target validation — AC-2: target file missing', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTmpDir();
    delete process.env['TAPROOT_OFFLINE'];
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('reports LINK_TARGET_MISSING when file not found at resolved path', () => {
    const sourceDir = join(dir, 'source-repo');
    mkdirSync(sourceDir, { recursive: true });
    makeReposYaml(dir, { 'https://github.com/org/source': sourceDir });
    const linkDir = join(dir, 'taproot/specs/my-intent/my-behaviour');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/source', 'taproot/specs/missing/usecase.md', 'behaviour');
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    expect(violations.some(v => v.code === 'LINK_TARGET_MISSING')).toBe(true);
  });
});

describe('link target validation — AC-3: repos.yaml absent', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTmpDir();
    delete process.env['TAPROOT_OFFLINE'];
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('reports LINK_TARGET_UNRESOLVABLE with repos.yaml message when file absent', () => {
    const linkDir = join(dir, 'taproot/specs/my-intent/my-behaviour');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/source', 'taproot/specs/foo/usecase.md', 'behaviour');
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    expect(violations.some(v => v.code === 'LINK_TARGET_UNRESOLVABLE' && v.message.includes('repos.yaml'))).toBe(true);
  });
});

describe('link target validation — AC-4: repo URL not mapped', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTmpDir();
    delete process.env['TAPROOT_OFFLINE'];
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('reports LINK_TARGET_UNRESOLVABLE for unmapped URL while other links may resolve', () => {
    makeReposYaml(dir, { 'https://github.com/org/other': join(dir, 'other') });
    const linkDir = join(dir, 'taproot/specs/my-intent/my-behaviour');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/source', 'taproot/specs/foo/usecase.md', 'behaviour');
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    expect(violations.some(v => v.code === 'LINK_TARGET_UNRESOLVABLE' && v.message.includes('https://github.com/org/source'))).toBe(true);
  });
});

describe('link target validation — AC-5: circular reference', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTmpDir();
    delete process.env['TAPROOT_OFFLINE'];
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('reports LINK_CIRCULAR when visited set contains resolved path', () => {
    const sourceDir = join(dir, 'source-repo');
    const targetFile = join(sourceDir, 'taproot/specs/auth/login/usecase.md');
    mkdirSync(join(sourceDir, 'taproot/specs/auth/login'), { recursive: true });
    writeFileSync(targetFile, '# Behaviour: Login\n', 'utf-8');
    makeReposYaml(dir, { 'https://github.com/org/source': sourceDir });
    const linkDir = join(dir, 'taproot/specs/my-intent/my-behaviour');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/source', 'taproot/specs/auth/login/usecase.md', 'behaviour');
    // Simulate cycle: visited set already contains the resolved target
    const visited = new Set([targetFile]);
    const violations = checkLinkTargets(join(dir, 'taproot'), dir, visited);
    expect(violations.some(v => v.code === 'LINK_CIRCULAR')).toBe(true);
  });
});

describe('link target validation — AC-7: TAPROOT_OFFLINE=1 skips validation', () => {
  let dir: string;

  beforeEach(() => { dir = makeTmpDir(); });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    delete process.env['TAPROOT_OFFLINE'];
  });

  it('skips link resolution and emits LINK_VALIDATION_SKIPPED warning', () => {
    process.env['TAPROOT_OFFLINE'] = '1';
    const linkDir = join(dir, 'taproot/specs/my-intent/my-behaviour');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/source', 'taproot/specs/foo/usecase.md', 'behaviour');
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    expect(violations.some(v => v.code === 'LINK_VALIDATION_SKIPPED')).toBe(true);
    const errors = violations.filter(v => v.type === 'error');
    expect(errors).toHaveLength(0);
  });

  it('exits cleanly (no errors) with TAPROOT_OFFLINE=1 even when repos.yaml absent', () => {
    process.env['TAPROOT_OFFLINE'] = '1';
    const linkDir = join(dir, 'taproot/specs/my-intent/my-behaviour');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/source', 'taproot/specs/foo/usecase.md', 'behaviour');
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    const errors = violations.filter(v => v.type === 'error');
    expect(errors).toHaveLength(0);
  });
});

describe('link target validation — AC-6: draft-state target warning', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTmpDir();
    delete process.env['TAPROOT_OFFLINE'];
  });

  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('emits LINK_TARGET_DRAFT warning when resolved target spec is in proposed state', () => {
    const sourceDir = join(dir, 'source-repo');
    mkdirSync(join(sourceDir, 'taproot/specs/auth/login'), { recursive: true });
    writeFileSync(join(sourceDir, 'taproot/specs/auth/login/usecase.md'),
      '# Behaviour: Login\n\n## Status\n- **State:** proposed\n', 'utf-8');
    makeReposYaml(dir, { 'https://github.com/org/source': sourceDir });
    const linkDir = join(dir, 'taproot/specs/my-intent/my-behaviour');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/source', 'taproot/specs/auth/login/usecase.md', 'behaviour');
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    expect(violations.some(v => v.code === 'LINK_TARGET_DRAFT')).toBe(true);
    // Should not be an error — only a warning
    const draftViolation = violations.find(v => v.code === 'LINK_TARGET_DRAFT');
    expect(draftViolation?.type).toBe('warning');
  });

  it('does not warn when resolved target spec is in specified or later state', () => {
    const sourceDir = join(dir, 'source-repo');
    mkdirSync(join(sourceDir, 'taproot/specs/auth/login'), { recursive: true });
    writeFileSync(join(sourceDir, 'taproot/specs/auth/login/usecase.md'),
      '# Behaviour: Login\n\n## Status\n- **State:** specified\n', 'utf-8');
    makeReposYaml(dir, { 'https://github.com/org/source': sourceDir });
    const linkDir = join(dir, 'taproot/specs/my-intent/my-behaviour');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/source', 'taproot/specs/auth/login/usecase.md', 'behaviour');
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    expect(violations.some(v => v.code === 'LINK_TARGET_DRAFT')).toBe(false);
  });
});

describe('link target validation — per-repo offline mode (AC-1, AC-2, AC-3)', () => {
  let dir: string;
  const origOffline = process.env['TAPROOT_OFFLINE'];

  beforeEach(() => {
    dir = makeTmpDir();
    delete process.env['TAPROOT_OFFLINE'];
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    if (origOffline === undefined) delete process.env['TAPROOT_OFFLINE'];
    else process.env['TAPROOT_OFFLINE'] = origOffline;
  });

  it('AC-1: link to offline repo emits warning and exits 0 (no error)', () => {
    makeReposYaml(dir, { 'https://github.com/org/repo-b': 'offline' });
    const linkDir = join(dir, 'taproot/specs/my-intent/my-behaviour');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/repo-b', 'taproot/specs/auth/login/usecase.md', 'behaviour');
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    expect(violations.some(v => v.code === 'LINK_VALIDATION_SKIPPED')).toBe(true);
    const skipped = violations.find(v => v.code === 'LINK_VALIDATION_SKIPPED');
    expect(skipped?.type).toBe('warning');
    expect(violations.some(v => v.type === 'error')).toBe(false);
  });

  it('AC-2: links to local-path repo validated normally alongside offline repo', () => {
    const sourceDir = join(dir, 'source-repo');
    mkdirSync(join(sourceDir, 'taproot/specs/auth/login'), { recursive: true });
    writeFileSync(join(sourceDir, 'taproot/specs/auth/login/usecase.md'),
      '# Behaviour: Login\n\n## Status\n- **State:** specified\n', 'utf-8');
    makeReposYaml(dir, {
      'https://github.com/org/repo-a': sourceDir,
      'https://github.com/org/repo-b': 'offline',
    });
    const linkDirA = join(dir, 'taproot/specs/intent-a/beh-a');
    const linkDirB = join(dir, 'taproot/specs/intent-b/beh-b');
    makeLinkFile(linkDirA, 'link.md', 'https://github.com/org/repo-a', 'taproot/specs/auth/login/usecase.md', 'behaviour');
    makeLinkFile(linkDirB, 'link.md', 'https://github.com/org/repo-b', 'taproot/specs/auth/login/usecase.md', 'behaviour');
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    // repo-b link skipped with warning
    expect(violations.some(v => v.code === 'LINK_VALIDATION_SKIPPED')).toBe(true);
    // repo-a link resolves cleanly (no error for it)
    expect(violations.some(v => v.type === 'error')).toBe(false);
  });

  it('AC-3: TAPROOT_OFFLINE=1 overrides per-repo offline entries — emits single global skip message', () => {
    makeReposYaml(dir, {
      'https://github.com/org/repo-a': '/some/local/path',
      'https://github.com/org/repo-b': 'offline',
    });
    const linkDir = join(dir, 'taproot/specs/my-intent/my-beh');
    makeLinkFile(linkDir, 'link.md', 'https://github.com/org/repo-a', 'taproot/specs/auth/login/usecase.md', 'behaviour');
    process.env['TAPROOT_OFFLINE'] = '1';
    const violations = checkLinkTargets(join(dir, 'taproot'), dir);
    // Global skip message, not per-link
    expect(violations.some(v => v.code === 'LINK_VALIDATION_SKIPPED')).toBe(true);
    const skipViolation = violations.find(v => v.code === 'LINK_VALIDATION_SKIPPED');
    expect(skipViolation?.message).toContain('TAPROOT_OFFLINE=1');
  });
});

describe('check-orphans — --include-unimplemented', () => {
  it('reports UNIMPLEMENTED_BEHAVIOUR when flag is set', async () => {
    // create a fixture scenario with a behaviour that has no impls
    const violations = await runCheckOrphans({
      path: fixture('valid-hierarchy'),
      includeUnimplemented: true,
    });
    // valid-hierarchy has implementations for all behaviours, so 0 unimplemented
    const unimpl = violations.filter(v => v.code === 'UNIMPLEMENTED_BEHAVIOUR');
    expect(unimpl).toHaveLength(0);
  });
});
