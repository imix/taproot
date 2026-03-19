import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runInit } from '../../src/commands/init.js';

describe('taproot init', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-init-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates taproot/ directory', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot'))).toBe(true);
  });

  it('creates .taproot.yaml', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, '.taproot.yaml'))).toBe(true);
  });

  it('creates taproot/skills/ directory', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', 'skills'))).toBe(true);
  });

  it('creates taproot/_brainstorms/ directory', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', '_brainstorms'))).toBe(true);
  });

  it('creates taproot/CONVENTIONS.md', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', 'CONVENTIONS.md'))).toBe(true);
  });

  it('returns messages describing what was created', () => {
    const messages = runInit({ cwd: tmpDir });
    expect(messages.some(m => m.includes('taproot/'))).toBe(true);
    expect(messages.some(m => m.includes('.taproot.yaml'))).toBe(true);
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
});
