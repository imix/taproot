import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { runCommithook, buildSourceToImplMap, checkUsecaseQuality, checkIntentQuality } from '../../src/commands/commithook.js';
import { runInit } from '../../src/commands/init.js';
import { runDorChecks } from '../../src/core/dor-runner.js';

// ─── Git helpers ──────────────────────────────────────────────────────────────

function git(args: string[], cwd: string) {
  return spawnSync('git', args, { cwd, encoding: 'utf-8' });
}

function initRepo(dir: string) {
  git(['init'], dir);
  git(['config', 'user.email', 'test@test.com'], dir);
  git(['config', 'user.name', 'Test'], dir);
  git(['config', 'commit.gpgsign', 'false'], dir);
  // Initial commit so HEAD exists
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
Test actor

## Preconditions
- Some precondition

## Main Flow
1. Actor does something
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

## Status
- **State:** specified
- **Created:** 2026-03-19
- **Last reviewed:** 2026-03-19
`;

const IMPL_MD = `# Implementation: Test

## Behaviour
../usecase.md

## Design Decisions
- Some decision

## Source Files
- \`src/test.ts\` — test file

## Commits
- (to be filled)

## Tests
- \`test/test.test.ts\` — covers main flow

## Status
- **State:** in-progress
- **Created:** 2026-03-19
- **Last verified:** 2026-03-19
`;

const IMPL_MD_COMPLETE = IMPL_MD.replace('in-progress', 'complete');

// ─── Tests ────────────────────────────────────────────────────────────────────

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'taproot-hook-'));
  initRepo(tmpDir);
  runInit({ cwd: tmpDir });
  git(['add', '-A'], tmpDir);
  git(['commit', '-m', 'taproot init'], tmpDir);
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('runCommithook — plain commit', () => {
  it('passes when no taproot files are staged', async () => {
    stage([{ path: 'src/foo.ts', content: 'export const x = 1;' }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('passes for source files not tracked in any impl.md', async () => {
    // .gitignore, config files, etc. — never in any impl.md Source Files
    stage([{ path: '.gitignore', content: 'node_modules\n' }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });
});

describe('runCommithook — requirement commit', () => {
  it('passes when valid hierarchy files are staged', async () => {
    mkdirSync(join(tmpDir, 'taproot', 'my-intent'), { recursive: true });
    stage([{
      path: 'taproot/my-intent/intent.md',
      content: `# Intent: Test\n\n## Goal\nEnable teams to test the system\n\n## Stakeholders\n- Dev: needs to verify behaviour\n\n## Success Criteria\n- [ ] Tests pass reliably\n\n## Status\n- **State:** active\n- **Created:** 2026-03-19\n`,
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('fails when staged hierarchy files have format errors', async () => {
    mkdirSync(join(tmpDir, 'taproot', 'bad-intent'), { recursive: true });
    stage([{
      path: 'taproot/bad-intent/intent.md',
      content: '# Intent: Bad\n\n## Goal\nMissing other required sections\n',
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });
});

describe('runCommithook — declaration commit', () => {
  beforeEach(() => {
    // Set up a valid behaviour spec and commit it
    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    stage([{
      path: 'taproot/my-intent/usecase.md',
      content: `# Intent: Test\n\n## Goal\nGoal\n\n## Stakeholders\n- Dev\n\n## Success Criteria\n- [ ] Works\n\n## Status\n- **State:** active\n- **Created:** 2026-03-19\n`,
    }, {
      path: 'taproot/my-intent/intent.md',
      content: `# Intent: Test\n\n## Goal\nGoal\n\n## Stakeholders\n- Dev\n\n## Success Criteria\n- [ ] Works\n\n## Status\n- **State:** active\n- **Created:** 2026-03-19\n`,
    }, {
      path: 'taproot/my-intent/my-behaviour/usecase.md',
      content: VALID_USECASE,
    }], tmpDir);
    git(['commit', '-m', 'add behaviour'], tmpDir);
  });

  it('passes when impl.md references a specified usecase', async () => {
    stage([{
      path: 'taproot/my-intent/my-behaviour/my-impl/impl.md',
      content: IMPL_MD,
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('fails when parent usecase is not specified', async () => {
    const notSpecified = VALID_USECASE.replace('State:** specified', 'State:** proposed');
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), notSpecified);
    git(['add', 'taproot/my-intent/my-behaviour/usecase.md'], tmpDir);
    git(['commit', '-m', 'downgrade state'], tmpDir);

    stage([{
      path: 'taproot/my-intent/my-behaviour/my-impl/impl.md',
      content: IMPL_MD,
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('fails when parent usecase has no Flow section', async () => {
    const noFlow = VALID_USECASE.replace(/## Flow[\s\S]*?## Related/, '## Related');
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), noFlow);
    git(['add', 'taproot/my-intent/my-behaviour/usecase.md'], tmpDir);
    git(['commit', '-m', 'remove flow'], tmpDir);

    stage([{
      path: 'taproot/my-intent/my-behaviour/my-impl/impl.md',
      content: IMPL_MD,
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('fails when parent usecase has no Related section', async () => {
    const noRelated = VALID_USECASE.replace(/## Related[\s\S]*?## Status/, '## Status');
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), noRelated);
    git(['add', 'taproot/my-intent/my-behaviour/usecase.md'], tmpDir);
    git(['commit', '-m', 'remove related'], tmpDir);

    stage([{
      path: 'taproot/my-intent/my-behaviour/my-impl/impl.md',
      content: IMPL_MD,
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });
});

describe('runCommithook — implementation commit', () => {
  beforeEach(() => {
    // Set up behaviour + impl.md (declaration commit already done)
    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl'), { recursive: true });
    stage([{
      path: 'taproot/my-intent/intent.md',
      content: `# Intent: Test\n\n## Goal\nGoal\n\n## Stakeholders\n- Dev\n\n## Success Criteria\n- [ ] Works\n\n## Status\n- **State:** active\n- **Created:** 2026-03-19\n`,
    }, {
      path: 'taproot/my-intent/my-behaviour/usecase.md',
      content: VALID_USECASE,
    }, {
      path: 'taproot/my-intent/my-behaviour/my-impl/impl.md',
      content: IMPL_MD,
    }], tmpDir);
    git(['commit', '-m', 'declaration commit'], tmpDir);
  });

  it('passes when only Status section changed in impl.md alongside tracked source file', async () => {
    // src/test.ts is listed in IMPL_MD's ## Source Files
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), IMPL_MD_COMPLETE);
    mkdirSync(join(tmpDir, 'src'), { recursive: true });
    writeFileSync(join(tmpDir, 'src', 'test.ts'), 'export const x = 1;');
    git(['add', 'taproot/my-intent/my-behaviour/my-impl/impl.md', 'src/test.ts'], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('fails when impl.md changes beyond Status section', async () => {
    const modifiedImpl = IMPL_MD_COMPLETE.replace('Some decision', 'A different decision');
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), modifiedImpl);
    mkdirSync(join(tmpDir, 'src'), { recursive: true });
    writeFileSync(join(tmpDir, 'src', 'test.ts'), 'export const x = 1;');
    git(['add', 'taproot/my-intent/my-behaviour/my-impl/impl.md', 'src/test.ts'], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('fails when tracked source file is staged without its impl.md', async () => {
    // src/test.ts is tracked by my-impl/impl.md — staging it without impl.md must be blocked
    mkdirSync(join(tmpDir, 'src'), { recursive: true });
    writeFileSync(join(tmpDir, 'src', 'test.ts'), 'export const x = 1;');
    git(['add', 'src/test.ts'], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('passes when source file is tracked only by a complete impl.md (AC-14)', async () => {
    // my-impl/impl.md is already committed with state=in-progress; update it to complete on disk
    writeFileSync(
      join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'),
      IMPL_MD_COMPLETE
    );
    git(['add', 'taproot/my-intent/my-behaviour/my-impl/impl.md'], tmpDir);
    git(['commit', '-m', 'mark complete'], tmpDir);

    // Now stage only the source file — impl.md is complete, so no co-staging required
    mkdirSync(join(tmpDir, 'src'), { recursive: true });
    writeFileSync(join(tmpDir, 'src', 'test.ts'), 'export const x = 1;');
    git(['add', 'src/test.ts'], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(0);
  });

  it('still requires staging for in-progress impl.md even when complete impl.md tracks the same file', async () => {
    // Add a second impl that also tracks src/test.ts, in-progress state
    const secondImpl = IMPL_MD; // state: in-progress, tracks src/test.ts
    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'second-impl'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'second-impl', 'impl.md'),
      secondImpl
    );
    git(['add', 'taproot/my-intent/my-behaviour/second-impl/impl.md'], tmpDir);
    git(['commit', '-m', 'declare second-impl'], tmpDir);

    // Stage only the source file — second-impl is in-progress, so co-staging IS required
    mkdirSync(join(tmpDir, 'src'), { recursive: true });
    writeFileSync(join(tmpDir, 'src', 'test.ts'), 'export const x = 1;');
    git(['add', 'src/test.ts'], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('fails when impl.md is new (not previously declared) and staged with its tracked source', async () => {
    // Write a new impl.md that tracks src/new-feature.ts
    const newImplContent = IMPL_MD.replace('`src/test.ts`', '`src/new-feature.ts`');
    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'new-impl'), { recursive: true });
    mkdirSync(join(tmpDir, 'src'), { recursive: true });
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'new-impl', 'impl.md'), newImplContent);
    writeFileSync(join(tmpDir, 'src', 'new-feature.ts'), 'export const x = 1;');
    git(['add',
      'taproot/my-intent/my-behaviour/new-impl/impl.md',
      'src/new-feature.ts',
    ], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    // checkStatusOnly: no HEAD version → FAIL "commit impl.md alone first"
    expect(code).toBe(1);
  });
});

describe('runDorChecks', () => {
  beforeEach(() => {
    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl'), { recursive: true });
  });

  it('fails when usecase.md does not exist', () => {
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), IMPL_MD);
    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    expect(report.allPassed).toBe(false);
    expect(report.results[0]!.name).toBe('usecase-exists');
    expect(report.results[0]!.passed).toBe(false);
  });

  it('fails when usecase state is not specified', () => {
    const notSpec = VALID_USECASE.replace('State:** specified', 'State:** proposed');
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), notSpec);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), IMPL_MD);
    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    expect(report.allPassed).toBe(false);
    expect(report.results.find(r => r.name === 'state-specified')!.passed).toBe(false);
  });

  it('passes all baseline checks for a fully specified usecase', () => {
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), VALID_USECASE);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), IMPL_MD);
    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    expect(report.allPassed).toBe(true);
  });

  it('fails when Flow section is missing', () => {
    const noFlow = VALID_USECASE.replace(/## Flow[\s\S]*?## Related/, '## Related');
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), noFlow);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), IMPL_MD);
    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    expect(report.results.find(r => r.name === 'flow-diagram')!.passed).toBe(false);
  });

  it('fails when Related section is missing', () => {
    const noRelated = VALID_USECASE.replace(/## Related[\s\S]*?## Status/, '## Status');
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), noRelated);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), IMPL_MD);
    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    expect(report.results.find(r => r.name === 'related-behaviours')!.passed).toBe(false);
  });

  it('fails when check: condition is unresolved (no DoR Resolutions in impl.md)', () => {
    writeFileSync(join(tmpDir, 'taproot', 'settings.yaml'), [
      'version: 1',
      'root: taproot/',
      'definitionOfReady:',
      '  - check: "is this spec complete enough to implement?"',
    ].join('\n'));
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), VALID_USECASE);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), IMPL_MD);
    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    const result = report.results.find(r => r.name === 'check: is this spec complete enough to implement?');
    expect(result).toBeDefined();
    expect(result!.passed).toBe(false);
    expect(result!.output).toContain('Agent check required');
    expect(report.allPassed).toBe(false);
  });

  it('passes when check: condition is resolved in impl.md DoR Resolutions', () => {
    const question = 'is this spec complete enough to implement?';
    const conditionName = `check: ${question}`;
    const now = new Date().toISOString();
    writeFileSync(join(tmpDir, 'taproot', 'settings.yaml'), [
      'version: 1',
      'root: taproot/',
      'definitionOfReady:',
      `  - check: "${question}"`,
    ].join('\n'));
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), VALID_USECASE);
    const implWithResolution = IMPL_MD + [
      '',
      '## DoR Resolutions',
      `- condition: ${conditionName} | note: yes, spec is clear | resolved: ${now}`,
    ].join('\n');
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), implWithResolution);
    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    const result = report.results.find(r => r.name === conditionName);
    expect(result).toBeDefined();
    expect(result!.passed).toBe(true);
    expect(report.allPassed).toBe(true);
  });

  // ─── AC-1/AC-2/AC-3: require-discussion-log ───────────────────────────────

  it('AC-1: passes when require-discussion-log: true and discussion.md is present', () => {
    writeFileSync(join(tmpDir, 'taproot', 'settings.yaml'), [
      'version: 1',
      'root: taproot/',
      'definitionOfReady:',
      '  - require-discussion-log: true',
    ].join('\n'));
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), VALID_USECASE);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), IMPL_MD);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'discussion.md'), '# Discussion: Test\n\n## Pivotal Questions\nShould we do X?\n');
    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    const result = report.results.find(r => r.name === 'require-discussion-log');
    expect(result).toBeDefined();
    expect(result!.passed).toBe(true);
    expect(report.allPassed).toBe(true);
  });

  it('AC-2: fails when require-discussion-log: true and discussion.md is absent', () => {
    writeFileSync(join(tmpDir, 'taproot', 'settings.yaml'), [
      'version: 1',
      'root: taproot/',
      'definitionOfReady:',
      '  - require-discussion-log: true',
    ].join('\n'));
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), VALID_USECASE);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), IMPL_MD);
    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    const result = report.results.find(r => r.name === 'require-discussion-log');
    expect(result).toBeDefined();
    expect(result!.passed).toBe(false);
    expect(result!.output).toContain('discussion.md missing');
    expect(report.allPassed).toBe(false);
  });

  it('AC-3: skipped when require-discussion-log is not configured', () => {
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'usecase.md'), VALID_USECASE);
    writeFileSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'), IMPL_MD);
    // No discussion.md — should still pass
    const report = runDorChecks('taproot/my-intent/my-behaviour/my-impl/impl.md', tmpDir);
    expect(report.results.find(r => r.name === 'require-discussion-log')).toBeUndefined();
    expect(report.allPassed).toBe(true);
  });
});

describe('buildSourceToImplMap', () => {
  it('returns empty map when no impl.md files exist', () => {
    const map = buildSourceToImplMap(tmpDir);
    expect(map.size).toBe(0);
  });

  it('maps source files to their impl.md path', () => {
    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'),
      IMPL_MD
    );
    const map = buildSourceToImplMap(tmpDir);
    expect(map.get('src/test.ts')).toBe('taproot/my-intent/my-behaviour/my-impl/impl.md');
  });

  it('ignores impl.md files with no Source Files section', () => {
    const noSources = IMPL_MD.replace(/## Source Files[\s\S]*?## Commits/, '## Commits');
    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'taproot', 'my-intent', 'my-behaviour', 'my-impl', 'impl.md'),
      noSources
    );
    const map = buildSourceToImplMap(tmpDir);
    expect(map.size).toBe(0);
  });
});

describe('checkUsecaseQuality', () => {
  const VALID = `# Behaviour: Test\n\n## Actor\nDeveloper\n\n## Main Flow\n1. Developer does something\n\n## Acceptance Criteria\n\n**AC-1: Thing works**\n- Given ...\n- When ...\n- Then ...\n\n## Postconditions\n- Something is true\n`;

  it('passes a usecase with AC, valid actor, and postconditions', () => {
    const failures = checkUsecaseQuality('taproot/x/usecase.md', VALID);
    expect(failures).toHaveLength(0);
  });

  it('fails when ## Acceptance Criteria section is missing', () => {
    const content = VALID.replace(/## Acceptance Criteria[\s\S]*?## Postconditions/, '## Postconditions');
    const failures = checkUsecaseQuality('taproot/x/usecase.md', content);
    expect(failures.some(f => f.message.includes('Acceptance Criteria'))).toBe(true);
  });

  it('fails when AC section has no AC-N: entries', () => {
    const content = VALID.replace('**AC-1: Thing works**', 'No structured entries here');
    const failures = checkUsecaseQuality('taproot/x/usecase.md', content);
    expect(failures.some(f => f.message.includes('AC-N:') || f.message.includes('no AC-N'))).toBe(true);
  });

  it('fails when actor describes an implementation mechanism', () => {
    const content = VALID.replace('## Actor\nDeveloper', '## Actor\nthe REST endpoint');
    const failures = checkUsecaseQuality('taproot/x/usecase.md', content);
    expect(failures.some(f => f.message.includes('implementation mechanism'))).toBe(true);
  });

  it('fails when ## Postconditions section is missing', () => {
    const content = VALID.replace(/## Postconditions[\s\S]*$/, '');
    const failures = checkUsecaseQuality('taproot/x/usecase.md', content);
    expect(failures.some(f => f.message.includes('Postconditions'))).toBe(true);
  });

  it('fails when ## Postconditions section is empty', () => {
    const content = VALID.replace('- Something is true', '');
    const failures = checkUsecaseQuality('taproot/x/usecase.md', content);
    expect(failures.some(f => f.message.includes('Postconditions'))).toBe(true);
  });
});

describe('checkIntentQuality', () => {
  const VALID = `# Intent: Test\n\n## Goal\nEnable teams to manage their workflow\n\n## Stakeholders\n- Developer: needs clear criteria\n\n## Success Criteria\n- [ ] Teams can configure conditions\n`;

  it('passes a well-formed intent', () => {
    const failures = checkIntentQuality('taproot/x/intent.md', VALID);
    expect(failures).toHaveLength(0);
  });

  it('fails when ## Goal section is missing', () => {
    const content = VALID.replace(/## Goal[\s\S]*?## Stakeholders/, '## Stakeholders');
    const failures = checkIntentQuality('taproot/x/intent.md', content);
    expect(failures.some(f => f.message.includes('Goal'))).toBe(true);
  });

  it('fails when goal does not start with a recognised verb', () => {
    const content = VALID.replace('Enable teams to manage their workflow', 'A system for managing workflow');
    const failures = checkIntentQuality('taproot/x/intent.md', content);
    expect(failures.some(f => f.message.includes('does not start with a verb'))).toBe(true);
  });

  it('fails when goal references implementation technology', () => {
    const content = VALID.replace('Enable teams to manage their workflow', 'Enable teams to use a REST API to manage workflow');
    const failures = checkIntentQuality('taproot/x/intent.md', content);
    expect(failures.some(f => f.message.includes('implementation technology'))).toBe(true);
  });

  it('fails when ## Stakeholders section is missing', () => {
    const content = VALID.replace(/## Stakeholders[\s\S]*?## Success Criteria/, '## Success Criteria');
    const failures = checkIntentQuality('taproot/x/intent.md', content);
    expect(failures.some(f => f.message.includes('Stakeholders'))).toBe(true);
  });

  it('fails when ## Success Criteria section is missing', () => {
    const content = VALID.replace(/## Success Criteria[\s\S]*$/, '');
    const failures = checkIntentQuality('taproot/x/intent.md', content);
    expect(failures.some(f => f.message.includes('Success Criteria'))).toBe(true);
  });
});

describe('runCommithook — spec quality gates (requirement commit)', () => {
  it('blocks commit when usecase.md is missing Acceptance Criteria', async () => {
    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    stage([{
      path: 'taproot/my-intent/my-behaviour/usecase.md',
      content: `# Behaviour: Test\n\n## Actor\nDeveloper\n\n## Main Flow\n1. Developer acts\n\n## Postconditions\n- Done\n\n## Status\n- **State:** specified\n- **Created:** 2026-03-21\n`,
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('blocks commit when usecase.md actor is an implementation mechanism', async () => {
    mkdirSync(join(tmpDir, 'taproot', 'my-intent', 'my-behaviour'), { recursive: true });
    stage([{
      path: 'taproot/my-intent/my-behaviour/usecase.md',
      content: `# Behaviour: Test\n\n## Actor\nthe database\n\n## Main Flow\n1. Database queries\n\n## Acceptance Criteria\n\n**AC-1:** Given ... When ... Then ...\n\n## Postconditions\n- Done\n\n## Status\n- **State:** specified\n- **Created:** 2026-03-21\n`,
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('blocks commit when intent.md goal does not start with a verb', async () => {
    mkdirSync(join(tmpDir, 'taproot', 'my-intent'), { recursive: true });
    stage([{
      path: 'taproot/my-intent/intent.md',
      content: `# Intent: Test\n\n## Goal\nA better workflow for teams\n\n## Stakeholders\n- Dev: needs this\n\n## Success Criteria\n- [ ] Works\n\n## Status\n- **State:** active\n- **Created:** 2026-03-21\n`,
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('blocks commit when intent.md goal references implementation technology', async () => {
    mkdirSync(join(tmpDir, 'taproot', 'my-intent'), { recursive: true });
    stage([{
      path: 'taproot/my-intent/intent.md',
      content: `# Intent: Test\n\n## Goal\nProvide a REST API to expose workflow data\n\n## Stakeholders\n- Dev: needs this\n\n## Success Criteria\n- [ ] API works\n\n## Status\n- **State:** active\n- **Created:** 2026-03-21\n`,
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });

  it('blocks commit when intent.md is missing Success Criteria', async () => {
    mkdirSync(join(tmpDir, 'taproot', 'my-intent'), { recursive: true });
    stage([{
      path: 'taproot/my-intent/intent.md',
      content: `# Intent: Test\n\n## Goal\nEnable teams to track their work\n\n## Stakeholders\n- Dev: needs this\n\n## Status\n- **State:** active\n- **Created:** 2026-03-21\n`,
    }], tmpDir);
    const code = await runCommithook({ cwd: tmpDir });
    expect(code).toBe(1);
  });
});

describe('taproot init --with-hooks', () => {
  it('installs hook invoking taproot commithook', () => {
    const hookPath = join(tmpDir, '.git', 'hooks', 'pre-commit');
    runInit({ cwd: tmpDir, withHooks: true });
    expect(existsSync(hookPath)).toBe(true);
    const content = readFileSync(hookPath, 'utf-8');
    expect(content).toContain('@imix-js/taproot');
    expect(content).toContain('commithook');
    expect(content).not.toContain('validate-structure');
  });
});
