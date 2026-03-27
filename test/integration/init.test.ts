import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { runInit } from '../../src/commands/init.js';

describe('taproot init', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-init-test-'));
    mkdirSync(join(tmpDir, '.git')); // taproot requires a git repo
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates taproot/ directory', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot'))).toBe(true);
  });

  it('creates .taproot/settings.yaml', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, '.taproot', 'settings.yaml'))).toBe(true);
  });

  it('creates .taproot/skills/ directory when claude agent is selected', async () => {
    const { runInit: ri } = await import('../../src/commands/init.js');
    ri({ cwd: tmpDir, agent: 'claude' });
    expect(existsSync(join(tmpDir, '.taproot', 'skills'))).toBe(true);
  });

  it('does not create taproot/_brainstorms/ directory', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', '_brainstorms'))).toBe(false);
  });

  it('creates taproot/CONVENTIONS.md', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', 'CONVENTIONS.md'))).toBe(true);
  });

  it('returns messages describing what was created', () => {
    const messages = runInit({ cwd: tmpDir });
    expect(messages.some(m => m.includes('taproot/'))).toBe(true);
    expect(messages.some(m => m.includes('.taproot/settings.yaml'))).toBe(true);
  });

  it('is idempotent — running twice does not fail', () => {
    runInit({ cwd: tmpDir });
    expect(() => runInit({ cwd: tmpDir })).not.toThrow();
  });

  it('reports "exists" on second run instead of "created"', () => {
    runInit({ cwd: tmpDir });
    const messages = runInit({ cwd: tmpDir });
    expect(messages.some(m => m.includes('exists'))).toBe(true);
  });

  // AC-9: hook prompt safety rationale present in source
  it('AC-9: hook prompt message describes safety rationale', () => {
    const src = readFileSync(resolve(__dirname, '../../src/commands/init.ts'), 'utf-8');
    expect(src).toMatch(/prevents.*traceability|traceability.*prevents/i);
    expect(src).toMatch(/quality checks/i);
    expect(src).toMatch(/Strongly recommended/i);
  });

  // AC-10: declining hook (withHooks: false) skips installation and reports it
  it('AC-10: withHooks: false skips installation and notes it in output', () => {
    const messages = runInit({ cwd: tmpDir, withHooks: false });
    expect(existsSync(join(tmpDir, '.git', 'hooks', 'pre-commit'))).toBe(false);
    expect(messages.some(m => m.includes('skipped') && m.includes('pre-commit'))).toBe(true);
  });

  // AC-11: --agent flag (programmatic: agent: 'claude') skips prompt, installs adapter
  it('AC-11: agent option installs adapter without prompt', () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    expect(existsSync(join(tmpDir, '.taproot', 'skills'))).toBe(true);
  });

  // AC-13: no .git directory → abort with error before any prompts
  it('AC-13: throws if no .git directory exists', () => {
    rmSync(join(tmpDir, '.git'), { recursive: true, force: true });
    expect(() => runInit({ cwd: tmpDir })).toThrow(/git init/i);
    expect(existsSync(join(tmpDir, 'taproot'))).toBe(false);
    expect(existsSync(join(tmpDir, '.taproot'))).toBe(false);
  });

  it('AC-13: git check in action handler precedes all prompts (source inspection)', () => {
    const src = readFileSync(resolve(__dirname, '../../src/commands/init.ts'), 'utf-8');
    const actionStart = src.indexOf('.action(async (options');
    expect(actionStart).toBeGreaterThan(-1);
    const gitCheckPos = src.indexOf("options.path, '.git'", actionStart);
    const promptPositions = [
      src.indexOf('await confirm(', actionStart),
      src.indexOf('await checkbox(', actionStart),
      src.indexOf('await select(', actionStart),
    ].filter(p => p !== -1);
    const firstPrompt = Math.min(...promptPositions);
    expect(gitCheckPos).toBeGreaterThan(-1); // git check exists in action handler
    expect(gitCheckPos).toBeLessThan(firstPrompt); // git check precedes all prompts
  });

  it('gemini agent installs skills into .taproot/skills/', () => {
    runInit({ cwd: tmpDir, agent: 'gemini' });
    expect(existsSync(join(tmpDir, '.taproot', 'skills', 'ineed.md'))).toBe(true);
  });

  // AC-12: --with-hooks flag (programmatic: withHooks: true) installs hook without prompt
  it('AC-12: withHooks: true installs hook without prompt', () => {
    // Create a .git directory so hook can be installed
    mkdirSync(join(tmpDir, '.git', 'hooks'), { recursive: true });
    const messages = runInit({ cwd: tmpDir, withHooks: true });
    expect(existsSync(join(tmpDir, '.git', 'hooks', 'pre-commit'))).toBe(true);
    expect(messages.some(m => m.includes('pre-commit'))).toBe(true);
  });

  // AC-2: Tier 1 agent install output includes tier label
  it('AC-2: claude install output includes Tier 1 label', () => {
    const messages = runInit({ cwd: tmpDir, agent: 'claude' });
    expect(messages.some(m => m.includes('Tier 1'))).toBe(true);
    expect(messages.some(m => m.includes('fully supported'))).toBe(true);
  });

  // AC-3: Tier 2 agent install output includes tier label
  it('AC-3: gemini install output includes Tier 2 label', () => {
    const messages = runInit({ cwd: tmpDir, agent: 'gemini' });
    expect(messages.some(m => m.includes('Tier 2'))).toBe(true);
    expect(messages.some(m => m.includes('implemented & tested'))).toBe(true);
  });

  // AC-4: Tier 3 agent install output includes community note
  it('AC-4: cursor install output includes Tier 3 and community note', () => {
    const messages = runInit({ cwd: tmpDir, agent: 'cursor' });
    expect(messages.some(m => m.includes('Tier 3'))).toBe(true);
    expect(messages.some(m => /community.supported/i.test(m))).toBe(true);
  });

  // AC-6: default tier for unknown agent is Tier 3 — static map coverage
  it('AC-6: AGENT_TIERS assigns Tier 3 to community agents', async () => {
    const { AGENT_TIERS } = await import('../../src/adapters/index.js');
    expect(AGENT_TIERS['cursor']).toBe(3);
    expect(AGENT_TIERS['copilot']).toBe(3);
    expect(AGENT_TIERS['windsurf']).toBe(3);
    expect(AGENT_TIERS['generic']).toBe(3);
  });
});
