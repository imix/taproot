import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawnSync } from 'child_process';
import {
  resolveTruthScope,
  scopeAppliesTo,
  collectApplicableTruths,
  writeTruthSession,
  validateTruthSession,
  docLevelFromFilename,
  globalTruthsDir,
} from '../../src/core/truth-checker.js';
import { runCommithook } from '../../src/commands/commithook.js';
import { runTruthSign } from '../../src/commands/truth-sign.js';
import { runInit } from '../../src/commands/init.js';

// ─── Git helpers ──────────────────────────────────────────────────────────────

function git(args: string[], cwd: string) {
  return spawnSync('git', args, { cwd, encoding: 'utf-8' });
}

function initRepo(dir: string) {
  git(['init'], dir);
  git(['config', 'user.email', 'test@test.com'], dir);
  git(['config', 'user.name', 'Test'], dir);
  git(['config', 'commit.gpgsign', 'false'], dir);
  writeFileSync(join(dir, 'README.md'), '# Test\n');
  git(['add', 'README.md'], dir);
  git(['commit', '-m', 'init'], dir);
}

function stage(files: Array<{ path: string; content: string }>, dir: string) {
  for (const f of files) {
    const full = join(dir, f.path);
    mkdirSync(full.replace(/\/[^/]+$/, ''), { recursive: true });
    writeFileSync(full, f.content);
  }
  git(['add', ...files.map(f => f.path)], dir);
}

const VALID_USECASE = `# Behaviour: Test

## Actor
Developer

## Preconditions
- Some precondition

## Main Flow
1. Developer does something
2. System responds

## Alternate Flows
### None
- **Trigger:** N/A
- **Steps:**
  1. N/A

## Postconditions
- Something is true

## Error Conditions
- **Error**: System responds

## Flow
\`\`\`mermaid
sequenceDiagram
    Actor->>System: action
    System-->>Actor: response
\`\`\`

## Related
- \`../other/usecase.md\` — related behaviour

## Acceptance Criteria

**AC-1: Developer does the thing**
- Given a precondition
- When developer acts
- Then something happens

## Status
- **State:** specified
- **Created:** 2026-03-26
- **Last reviewed:** 2026-03-26
`;

const VALID_INTENT = `# Intent: Test

## Goal
Enable teams to test the system reliably

## Stakeholders
- Developer: needs to verify behaviour

## Success Criteria
- [ ] Tests pass reliably

## Behaviours <!-- taproot-managed -->

## Status
- **State:** active
- **Created:** 2026-03-26
- **Last reviewed:** 2026-03-26
`;

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'taproot-truth-'));
  initRepo(tmpDir);
  runInit({ cwd: tmpDir });
  // Tests place fixtures directly under taproot/ — override root to match
  const settingsPath = join(tmpDir, 'taproot', 'settings.yaml');
  const settings = readFileSync(settingsPath, 'utf-8');
  writeFileSync(settingsPath, settings.replace(/^root:.*$/m, 'root: taproot/'));
  git(['add', '-A'], tmpDir);
  git(['commit', '-m', 'taproot init'], tmpDir);
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ─── Unit: resolveTruthScope ──────────────────────────────────────────────────

describe('resolveTruthScope', () => {
  it('resolves suffix _intent.md to intent scope', () => {
    expect(resolveTruthScope('glossary_intent.md')).toEqual({ scope: 'intent', ambiguous: false });
  });

  it('resolves suffix _behaviour.md to behaviour scope', () => {
    expect(resolveTruthScope('rules_behaviour.md')).toEqual({ scope: 'behaviour', ambiguous: false });
  });

  it('resolves suffix _impl.md to impl scope', () => {
    expect(resolveTruthScope('tech_impl.md')).toEqual({ scope: 'impl', ambiguous: false });
  });

  it('resolves sub-folder intent/ to intent scope', () => {
    expect(resolveTruthScope('intent/glossary.md')).toEqual({ scope: 'intent', ambiguous: false });
  });

  it('resolves sub-folder behaviour/ to behaviour scope', () => {
    expect(resolveTruthScope('behaviour/rules.md')).toEqual({ scope: 'behaviour', ambiguous: false });
  });

  it('resolves sub-folder impl/ to impl scope', () => {
    expect(resolveTruthScope('impl/tech.md')).toEqual({ scope: 'impl', ambiguous: false });
  });

  it('defaults to intent scope when no signal present', () => {
    expect(resolveTruthScope('glossary.md')).toEqual({ scope: 'intent', ambiguous: true });
  });

  it('sub-folder wins over suffix when conflicting (most restrictive)', () => {
    // impl/ folder + _intent.md suffix → impl wins
    expect(resolveTruthScope('impl/glossary_intent.md')).toEqual({ scope: 'impl', ambiguous: false });
  });
});

// ─── Unit: scopeAppliesTo ─────────────────────────────────────────────────────

describe('scopeAppliesTo', () => {
  it('intent-scoped truth applies to all levels', () => {
    expect(scopeAppliesTo('intent', 'intent')).toBe(true);
    expect(scopeAppliesTo('intent', 'behaviour')).toBe(true);
    expect(scopeAppliesTo('intent', 'impl')).toBe(true);
  });

  it('behaviour-scoped truth applies to behaviour and impl only', () => {
    expect(scopeAppliesTo('behaviour', 'intent')).toBe(false);
    expect(scopeAppliesTo('behaviour', 'behaviour')).toBe(true);
    expect(scopeAppliesTo('behaviour', 'impl')).toBe(true);
  });

  it('impl-scoped truth applies to impl only', () => {
    expect(scopeAppliesTo('impl', 'intent')).toBe(false);
    expect(scopeAppliesTo('impl', 'behaviour')).toBe(false);
    expect(scopeAppliesTo('impl', 'impl')).toBe(true);
  });
});

// ─── Unit: docLevelFromFilename ───────────────────────────────────────────────

describe('docLevelFromFilename', () => {
  it('maps intent.md to intent', () => {
    expect(docLevelFromFilename('taproot/foo/intent.md')).toBe('intent');
  });
  it('maps usecase.md to behaviour', () => {
    expect(docLevelFromFilename('taproot/foo/bar/usecase.md')).toBe('behaviour');
  });
  it('maps impl.md to impl', () => {
    expect(docLevelFromFilename('taproot/foo/bar/baz/impl.md')).toBe('impl');
  });
  it('returns null for unknown files', () => {
    expect(docLevelFromFilename('src/foo.ts')).toBeNull();
  });
});

// ─── Unit: collectApplicableTruths ────────────────────────────────────────────

describe('collectApplicableTruths', () => {
  it('returns empty array when global-truths/ does not exist', () => {
    const truths = collectApplicableTruths(tmpDir, 'behaviour');
    expect(truths).toHaveLength(0);
  });

  it('returns empty array when global-truths/ contains only README.md', () => {
    // README.md is already created by init
    const truths = collectApplicableTruths(tmpDir, 'behaviour');
    expect(truths).toHaveLength(0);
  });

  it('AC-5: only collects truths applicable to the document level', () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'glossary_intent.md'), '## Terms\n- booking: a confirmed slot\n');
    writeFileSync(join(gtDir, 'tech_impl.md'), '## Tech\n- Use TypeScript\n');

    const behaviourTruths = collectApplicableTruths(tmpDir, 'behaviour');
    expect(behaviourTruths.map(t => t.relPath)).toContain('taproot/global-truths/glossary_intent.md');
    expect(behaviourTruths.map(t => t.relPath)).not.toContain('taproot/global-truths/tech_impl.md');
  });

  it('collects impl-scoped truths only for impl level', () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'tech_impl.md'), '## Tech\n- Use TypeScript\n');

    expect(collectApplicableTruths(tmpDir, 'intent')).toHaveLength(0);
    expect(collectApplicableTruths(tmpDir, 'behaviour')).toHaveLength(0);
    expect(collectApplicableTruths(tmpDir, 'impl')).toHaveLength(1);
  });

  it('resolves sub-folder convention correctly', () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    mkdirSync(join(gtDir, 'behaviour'), { recursive: true });
    writeFileSync(join(gtDir, 'behaviour', 'rules.md'), '## Rules\n- prices ex VAT\n');

    const intentTruths = collectApplicableTruths(tmpDir, 'intent');
    expect(intentTruths).toHaveLength(0);

    const behaviourTruths = collectApplicableTruths(tmpDir, 'behaviour');
    expect(behaviourTruths).toHaveLength(1);
    expect(behaviourTruths[0]!.scope).toBe('behaviour');
  });

  it('AC-6: marks unreadable files without throwing', () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    // Create a directory named like a truth file — readdirSync will list it but readFileSync will fail
    mkdirSync(join(gtDir, 'bad_intent.md'), { recursive: true });

    // Should not throw; unreadable entry (directory with .md name) handled gracefully
    expect(() => collectApplicableTruths(tmpDir, 'intent')).not.toThrow();
  });
});

// ─── Unit: session hash round-trip ────────────────────────────────────────────

describe('writeTruthSession / validateTruthSession', () => {
  it('validates a session that matches the current state', () => {
    const docs = [{ path: 'taproot/foo/usecase.md', content: '# Behaviour' }];
    const truths = [{ relPath: 'taproot/global-truths/g_intent.md', scope: 'intent' as const, ambiguous: false, unreadable: false, content: '## Terms' }];

    writeTruthSession(tmpDir, docs, truths);
    const result = validateTruthSession(tmpDir, docs, truths);
    expect(result.valid).toBe(true);
  });

  it('invalidates when doc content changes', () => {
    const docs = [{ path: 'taproot/foo/usecase.md', content: '# Behaviour' }];
    const truths = [{ relPath: 'taproot/global-truths/g_intent.md', scope: 'intent' as const, ambiguous: false, unreadable: false, content: '## Terms' }];

    writeTruthSession(tmpDir, docs, truths);
    const changed = [{ path: 'taproot/foo/usecase.md', content: '# Behaviour CHANGED' }];
    const result = validateTruthSession(tmpDir, changed, truths);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/changed since the last truth check/);
  });

  it('invalidates when truth content changes', () => {
    const docs = [{ path: 'taproot/foo/usecase.md', content: '# Behaviour' }];
    const truths = [{ relPath: 'taproot/global-truths/g_intent.md', scope: 'intent' as const, ambiguous: false, unreadable: false, content: '## Terms' }];

    writeTruthSession(tmpDir, docs, truths);
    const changedTruths = [{ ...truths[0]!, content: '## Terms CHANGED' }];
    const result = validateTruthSession(tmpDir, docs, changedTruths);
    expect(result.valid).toBe(false);
  });

  it('returns invalid with reason when no session file exists', () => {
    const result = validateTruthSession(tmpDir, [], []);
    // Empty docs + empty truths → valid only if session was written with same empty state
    // Here no session was written at all
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/no truth-check session found/);
  });
});

// ─── Integration: commithook truth checks ─────────────────────────────────────

describe('runCommithook — truth checks', () => {
  it('AC-3: passes when global-truths/ does not exist', async () => {
    // init creates global-truths/ — remove it to test absence
    rmSync(join(tmpDir, 'taproot', 'global-truths'), { recursive: true });
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'remove global-truths'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent'), { recursive: true });
    stage([{ path: 'taproot/my-intent/intent.md', content: VALID_INTENT }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('passes when global-truths/ has no applicable truths for the staged doc', async () => {
    // Only impl-scoped truth, but we're staging a usecase.md (behaviour level)
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'tech_impl.md'), '## Tech\n- Use TypeScript\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add impl truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    stage([
      { path: 'taproot/my-intent/intent.md', content: VALID_INTENT },
      { path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE },
    ], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('blocks commit when truths exist but no session file', async () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'glossary_intent.md'), '## Terms\n- booking: confirmed slot\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    // Write intent.md to disk (not staged) so validate-structure is happy
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    stage([{ path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('AC-2: passes when a valid truth-check session is present', async () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'glossary_intent.md'), '## Terms\n- booking: confirmed slot\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    stage([{ path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE }], tmpDir);

    runTruthSign({ cwd: tmpDir });

    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('blocks commit when session exists but staged content has changed', async () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'glossary_intent.md'), '## Terms\n- booking: confirmed slot\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    stage([{ path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE }], tmpDir);

    runTruthSign({ cwd: tmpDir });
    stage([{ path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE + '\n<!-- extra -->' }], tmpDir);

    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('AC-4: passes after truth is updated and session re-signed', async () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'glossary_intent.md'), '## Terms\n- booking: confirmed slot\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    stage([{ path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE }], tmpDir);

    runTruthSign({ cwd: tmpDir });

    // Developer updates the truth and re-stages it alongside the spec
    writeFileSync(join(gtDir, 'glossary_intent.md'), '## Terms\n- booking: a confirmed reservation slot\n');
    git(['add', join('taproot', 'global-truths', 'glossary_intent.md')], tmpDir);

    runTruthSign({ cwd: tmpDir });

    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('AC-5: only applicable truths per level affect session validation', async () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'glossary_intent.md'), '## Terms\n- booking: confirmed slot\n');
    writeFileSync(join(gtDir, 'tech_impl.md'), '## Tech\n- Use TypeScript\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add truths'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    // Stage a usecase.md (behaviour level) — only glossary_intent.md applies, not tech_impl.md
    stage([{ path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE }], tmpDir);

    runTruthSign({ cwd: tmpDir });
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('AC-6: unreadable truth file emits warning but does not block commit', async () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    mkdirSync(join(gtDir, 'bad_intent.md'), { recursive: true });
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add bad truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    stage([{ path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE }], tmpDir);

    // No readable truths (directory named .md) → no session needed → passes
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });
});

// ─── Unit: collectApplicableTruths — linked truths ──────────────────────────

describe('collectApplicableTruths — linked truths', () => {
  let sourceRepoDir: string;

  beforeEach(() => {
    // Create a "source repo" with a truth file
    sourceRepoDir = mkdtempSync(join(tmpdir(), 'taproot-source-'));
    mkdirSync(join(sourceRepoDir, 'taproot', 'global-truths'), { recursive: true });
    writeFileSync(
      join(sourceRepoDir, 'taproot', 'global-truths', 'api-rules_behaviour.md'),
      '## API Rules\n- All endpoints must return JSON\n- Use HTTP status codes correctly\n'
    );
  });

  afterEach(() => {
    rmSync(sourceRepoDir, { recursive: true, force: true });
  });

  it('AC-1: resolves linked truth and includes it in collection', () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'api-rules-link.md'),
      `# Link: API Rules\n\n**Repo:** https://github.com/test/source\n**Path:** taproot/global-truths/api-rules_behaviour.md\n**Type:** truth\n`
    );
    // Set up repos.yaml
    mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
    writeFileSync(join(tmpDir, '.taproot', 'repos.yaml'),
      `https://github.com/test/source: ${sourceRepoDir}\n`
    );

    const truths = collectApplicableTruths(tmpDir, 'behaviour');
    const linked = truths.find(t => t.linked);
    expect(linked).toBeDefined();
    expect(linked!.content).toMatch(/All endpoints must return JSON/);
    expect(linked!.scope).toBe('behaviour');
    expect(linked!.linked).toBe(true);
  });

  it('AC-5: linked truth with no scope signal defaults to intent-scoped', () => {
    // Source truth with no scope suffix
    writeFileSync(
      join(sourceRepoDir, 'taproot', 'global-truths', 'glossary.md'),
      '## Terms\n- booking: a confirmed slot\n'
    );
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'glossary-link.md'),
      `# Link: Glossary\n\n**Repo:** https://github.com/test/source\n**Path:** taproot/global-truths/glossary.md\n**Type:** truth\n`
    );
    mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
    writeFileSync(join(tmpDir, '.taproot', 'repos.yaml'),
      `https://github.com/test/source: ${sourceRepoDir}\n`
    );

    // Intent-scoped should apply to all levels
    const intentTruths = collectApplicableTruths(tmpDir, 'intent');
    expect(intentTruths.some(t => t.linked && t.ambiguous)).toBe(true);
  });

  it('skips link files that are not Type: truth', () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'feature-link.md'),
      `# Link: Feature\n\n**Repo:** https://github.com/test/source\n**Path:** some/usecase.md\n**Type:** behaviour\n`
    );

    const truths = collectApplicableTruths(tmpDir, 'behaviour');
    expect(truths.filter(t => t.linked)).toHaveLength(0);
  });

  it('AC-3: marks unresolvable when repos.yaml missing', () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'api-rules-link.md'),
      `# Link: API Rules\n\n**Repo:** https://github.com/test/source\n**Path:** taproot/global-truths/api-rules_behaviour.md\n**Type:** truth\n`
    );
    // No repos.yaml

    const truths = collectApplicableTruths(tmpDir, 'behaviour');
    const linked = truths.find(t => t.linked);
    expect(linked).toBeDefined();
    expect(linked!.unresolvable).toBe(true);
    expect(linked!.unreadable).toBe(true);
  });

  it('AC-3: marks unresolvable when repo URL not in repos.yaml', () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'api-rules-link.md'),
      `# Link: API Rules\n\n**Repo:** https://github.com/test/unknown-repo\n**Path:** taproot/global-truths/api-rules_behaviour.md\n**Type:** truth\n`
    );
    mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
    writeFileSync(join(tmpDir, '.taproot', 'repos.yaml'),
      `https://github.com/test/source: ${sourceRepoDir}\n`
    );

    const truths = collectApplicableTruths(tmpDir, 'behaviour');
    const linked = truths.find(t => t.linked);
    expect(linked).toBeDefined();
    expect(linked!.unresolvable).toBe(true);
  });

  it('AC-4: offline mode skips linked truth resolution', () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'api-rules-link.md'),
      `# Link: API Rules\n\n**Repo:** https://github.com/test/source\n**Path:** taproot/global-truths/api-rules_behaviour.md\n**Type:** truth\n`
    );
    // No repos.yaml — would normally be unresolvable, but offline mode skips

    const origEnv = process.env['TAPROOT_OFFLINE'];
    process.env['TAPROOT_OFFLINE'] = '1';
    try {
      const truths = collectApplicableTruths(tmpDir, 'behaviour');
      const linked = truths.find(t => t.linked);
      expect(linked).toBeDefined();
      expect(linked!.unreadable).toBe(true);
      expect(linked!.unresolvable).toBeUndefined(); // not unresolvable — just skipped
    } finally {
      if (origEnv === undefined) delete process.env['TAPROOT_OFFLINE'];
      else process.env['TAPROOT_OFFLINE'] = origEnv;
    }
  });
});

// ─── Integration: commithook — linked truth enforcement ─────────────────────

describe('runCommithook — linked truth enforcement', () => {
  let sourceRepoDir: string;

  beforeEach(() => {
    sourceRepoDir = mkdtempSync(join(tmpdir(), 'taproot-source-'));
    mkdirSync(join(sourceRepoDir, 'taproot', 'global-truths'), { recursive: true });
    writeFileSync(
      join(sourceRepoDir, 'taproot', 'global-truths', 'api-rules_intent.md'),
      '## API Rules\n- All endpoints must return JSON\n'
    );
  });

  afterEach(() => {
    rmSync(sourceRepoDir, { recursive: true, force: true });
  });

  it('AC-1: commit passes when linked truth resolves and session is valid', async () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'api-rules-link.md'),
      `# Link: API Rules\n\n**Repo:** https://github.com/test/source\n**Path:** taproot/global-truths/api-rules_intent.md\n**Type:** truth\n`
    );
    mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
    writeFileSync(join(tmpDir, '.taproot', 'repos.yaml'),
      `https://github.com/test/source: ${sourceRepoDir}\n`
    );
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add linked truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    stage([{ path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE }], tmpDir);

    runTruthSign({ cwd: tmpDir });
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('AC-3: commit blocked when linked truth is unresolvable', async () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'api-rules-link.md'),
      `# Link: API Rules\n\n**Repo:** https://github.com/test/unknown\n**Path:** taproot/global-truths/api-rules_intent.md\n**Type:** truth\n`
    );
    // No repos.yaml → unresolvable
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add unresolvable linked truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    stage([{ path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE }], tmpDir);

    runTruthSign({ cwd: tmpDir });
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('AC-4: offline mode skips linked truth with warning and commit passes', async () => {
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'api-rules-link.md'),
      `# Link: API Rules\n\n**Repo:** https://github.com/test/unknown\n**Path:** taproot/global-truths/api-rules_intent.md\n**Type:** truth\n`
    );
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add linked truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    stage([{ path: 'taproot/my-intent/my-behaviour/usecase.md', content: VALID_USECASE }], tmpDir);

    const origEnv = process.env['TAPROOT_OFFLINE'];
    process.env['TAPROOT_OFFLINE'] = '1';
    try {
      runTruthSign({ cwd: tmpDir });
      const code = await runCommithook({ cwd: tmpDir });
      expect(code).toBe(0);
    } finally {
      if (origEnv === undefined) delete process.env['TAPROOT_OFFLINE'];
      else process.env['TAPROOT_OFFLINE'] = origEnv;
    }
  });
});

// ─── Integration: impl-level truth checks (AC-7 through AC-10) ───────────────

/** Helpers for impl commit tests. */
function makeMinimalSettings(dir: string): void {
  writeFileSync(join(dir, 'taproot', 'settings.yaml'), 'version: 1\nroot: taproot/\n');
}

const IMPL_MD_IN_PROGRESS = `# Implementation: My Impl

## Behaviour
../usecase.md

## Design Decisions
- Simple test implementation

## Source Files
- \`src/foo.ts\` — test source file

## Commits
- placeholder

## Tests
- none

## Status
- **State:** in-progress
- **Created:** 2026-03-27
- **Last verified:** 2026-03-27
`;

const IMPL_MD_COMPLETE = IMPL_MD_IN_PROGRESS.replace('in-progress', 'complete');

describe('runCommithook — impl-level truth checks', () => {
  it('AC-7: impl commit with staged source file is blocked when truths exist but no session', async () => {
    makeMinimalSettings(tmpDir);
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'minimal settings'], tmpDir);

    // Add a truth file
    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'ux-principles_intent.md'), '## UX\n- fail early\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add truth'], tmpDir);

    // Commit hierarchy + impl.md (declares src/foo.ts)
    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'usecase.md'), VALID_USECASE);
    writeFileSync(
      join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl', 'impl.md'),
      IMPL_MD_IN_PROGRESS
    );
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'declare impl'], tmpDir);

    // Stage source file + updated impl.md (complete)
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl', 'impl.md'), IMPL_MD_COMPLETE);
    mkdirSync(join(tmpDir, 'src'), { recursive: true });
    writeFileSync(join(tmpDir, 'src', 'foo.ts'), '// source\n');
    git(['add', 'src/foo.ts', 'taproot/my-intent/my-beh/my-impl/impl.md'], tmpDir);

    // No session → blocked
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('AC-7: impl commit passes after truth-sign', async () => {
    makeMinimalSettings(tmpDir);
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'minimal settings'], tmpDir);

    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'ux-principles_intent.md'), '## UX\n- fail early\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'usecase.md'), VALID_USECASE);
    writeFileSync(
      join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl', 'impl.md'),
      IMPL_MD_IN_PROGRESS
    );
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'declare impl'], tmpDir);

    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl', 'impl.md'), IMPL_MD_COMPLETE);
    mkdirSync(join(tmpDir, 'src'), { recursive: true });
    writeFileSync(join(tmpDir, 'src', 'foo.ts'), '// source\n');
    git(['add', 'src/foo.ts', 'taproot/my-intent/my-beh/my-impl/impl.md'], tmpDir);

    // Sign → should pass
    runTruthSign({ cwd: tmpDir });
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('AC-8: scope ladder — usecase.md commit does not require impl-scoped truths in session', async () => {
    makeMinimalSettings(tmpDir);
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'minimal settings'], tmpDir);

    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'glossary_intent.md'), '## Terms\n- booking: slot\n');
    writeFileSync(join(gtDir, 'patterns_impl.md'), '## Patterns\n- use modules\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add truths'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    stage([{ path: 'taproot/my-intent/my-beh/usecase.md', content: VALID_USECASE }], tmpDir);

    // truth-sign: only hierarchy docs staged → session covers behaviour level (intent + behaviour truths)
    // patterns_impl.md is impl-scoped → NOT included in session
    runTruthSign({ cwd: tmpDir });

    // Adding an impl-scoped truth after signing should not invalidate the session
    // (because impl truths don't apply to behaviour-level commits)
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('AC-9: impl commit blocked when session was signed for different source files', async () => {
    makeMinimalSettings(tmpDir);
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'minimal settings'], tmpDir);

    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'ux_intent.md'), '## UX\n- fail early\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'usecase.md'), VALID_USECASE);
    writeFileSync(
      join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl', 'impl.md'),
      IMPL_MD_IN_PROGRESS
    );
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'declare impl'], tmpDir);

    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl', 'impl.md'), IMPL_MD_COMPLETE);
    mkdirSync(join(tmpDir, 'src'), { recursive: true });
    writeFileSync(join(tmpDir, 'src', 'foo.ts'), '// source\n');
    git(['add', 'src/foo.ts', 'taproot/my-intent/my-beh/my-impl/impl.md'], tmpDir);
    runTruthSign({ cwd: tmpDir });

    // Add another source file after signing → different staged set → session invalidated
    writeFileSync(join(tmpDir, 'src', 'bar.ts'), '// extra\n');
    git(['add', 'src/bar.ts'], tmpDir);

    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1); // session no longer covers src/bar.ts
  });

  it('AC-10: no check-if-affected-by entry in settings.yaml — truths still enforced automatically', async () => {
    // Explicit minimal settings with NO check-if-affected-by for global-truths
    makeMinimalSettings(tmpDir);
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'minimal settings'], tmpDir);

    const gtDir = join(tmpDir, 'taproot', 'global-truths');
    writeFileSync(join(gtDir, 'ux_intent.md'), '## UX\n- no surprises\n');
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'add truth'], tmpDir);

    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'intent.md'), VALID_INTENT);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'usecase.md'), VALID_USECASE);
    writeFileSync(
      join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl', 'impl.md'),
      IMPL_MD_IN_PROGRESS
    );
    git(['add', '-A'], tmpDir);
    git(['commit', '-m', 'declare impl'], tmpDir);

    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-beh', 'my-impl', 'impl.md'), IMPL_MD_COMPLETE);
    mkdirSync(join(tmpDir, 'src'), { recursive: true });
    writeFileSync(join(tmpDir, 'src', 'foo.ts'), '// source\n');
    git(['add', 'src/foo.ts', 'taproot/my-intent/my-beh/my-impl/impl.md'], tmpDir);

    // No session → blocked — proving enforcement is automatic, not via settings.yaml
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });
});
