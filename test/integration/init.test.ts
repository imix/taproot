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

  // AC-13: no .git directory → abort with error
  it('AC-13: throws if no .git directory exists', () => {
    rmSync(join(tmpDir, '.git'), { recursive: true, force: true });
    expect(() => runInit({ cwd: tmpDir })).toThrow(/git init/i);
    expect(existsSync(join(tmpDir, 'taproot'))).toBe(false);
    expect(existsSync(join(tmpDir, '.taproot'))).toBe(false);
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
});
