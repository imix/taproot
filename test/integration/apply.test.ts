import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runApply } from '../../src/commands/apply.js';

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'taproot-apply-'));
}

function setup(dir: string): void {
  mkdirSync(join(dir, '.taproot'), { recursive: true });
  mkdirSync(join(dir, 'taproot', 'intent', 'behaviour'), { recursive: true });
  writeFileSync(join(dir, '.taproot', 'settings.yaml'), 'version: 1\nroot: taproot/\n');
}

/** Write a fake agent script that uses $TAPROOT_APPLY_FILE set by taproot apply */
function writeFakeAgent(dir: string, name: string, exitCode: number, transform: 'append' | 'noop'): string {
  const scriptPath = join(dir, name);
  const body = transform === 'append'
    ? `echo "# modified" >> "$TAPROOT_APPLY_FILE"\n`
    : `# no-op\n`;
  writeFileSync(scriptPath, `#!/bin/sh\n${body}exit ${exitCode}\n`);
  chmodSync(scriptPath, 0o755);
  return scriptPath;
}

describe('runApply', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    setup(tmpDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('AC-1: records modified when agent changes the file', () => {
    const file1 = join(tmpDir, 'taproot', 'intent', 'behaviour', 'a.md');
    const file2 = join(tmpDir, 'taproot', 'intent', 'behaviour', 'b.md');
    writeFileSync(file1, '# original');
    writeFileSync(file2, '# original');

    const filelist = join(tmpDir, 'filelist.txt');
    const prompt = join(tmpDir, 'prompt.txt');
    writeFileSync(filelist, 'taproot/intent/behaviour/a.md\ntaproot/intent/behaviour/b.md\n');
    writeFileSync(prompt, 'append a line');

    const agent = writeFakeAgent(tmpDir, 'fake-agent', 0, 'append');
    const results = runApply({ filelistPath: 'filelist.txt', promptPath: 'prompt.txt', cwd: tmpDir, agentCli: agent });

    expect(results).toHaveLength(2);
    expect(results.every(r => r.status === 'modified')).toBe(true);
    expect(readFileSync(file1, 'utf-8')).toContain('# modified');
  });

  it('AC-2: records skipped when agent leaves file unchanged', () => {
    const file1 = join(tmpDir, 'taproot', 'intent', 'behaviour', 'a.md');
    writeFileSync(file1, '# original');

    const filelist = join(tmpDir, 'filelist.txt');
    const prompt = join(tmpDir, 'prompt.txt');
    writeFileSync(filelist, 'taproot/intent/behaviour/a.md\n');
    writeFileSync(prompt, 'do nothing');

    const agent = writeFakeAgent(tmpDir, 'fake-agent', 0, 'noop');
    const results = runApply({ filelistPath: 'filelist.txt', promptPath: 'prompt.txt', cwd: tmpDir, agentCli: agent });

    expect(results).toHaveLength(1);
    expect(results[0]!.status).toBe('skipped');
    expect(readFileSync(file1, 'utf-8')).toBe('# original');
  });

  it('AC-3: aborts before processing when path is outside taproot/', () => {
    const filelist = join(tmpDir, 'filelist.txt');
    const prompt = join(tmpDir, 'prompt.txt');
    writeFileSync(filelist, '../outside.md\n');
    writeFileSync(prompt, 'do something');

    expect(() => runApply({ filelistPath: 'filelist.txt', promptPath: 'prompt.txt', cwd: tmpDir }))
      .toThrow('outside taproot/');
  });

  it('AC-3: aborts when path does not exist', () => {
    const filelist = join(tmpDir, 'filelist.txt');
    const prompt = join(tmpDir, 'prompt.txt');
    writeFileSync(filelist, 'taproot/does/not/exist.md\n');
    writeFileSync(prompt, 'do something');

    expect(() => runApply({ filelistPath: 'filelist.txt', promptPath: 'prompt.txt', cwd: tmpDir }))
      .toThrow('not found');
  });

  it('AC-4: records error and restores file when agent exits non-zero', () => {
    const file1 = join(tmpDir, 'taproot', 'intent', 'behaviour', 'a.md');
    const file2 = join(tmpDir, 'taproot', 'intent', 'behaviour', 'b.md');
    writeFileSync(file1, '# original a');
    writeFileSync(file2, '# original b');

    const filelist = join(tmpDir, 'filelist.txt');
    const prompt = join(tmpDir, 'prompt.txt');
    writeFileSync(filelist, 'taproot/intent/behaviour/a.md\ntaproot/intent/behaviour/b.md\n');
    writeFileSync(prompt, 'do something');

    // Agent fails on first file, succeeds (noop) on second
    const failAgent = join(tmpDir, 'fail-agent');
    writeFileSync(failAgent, `#!/bin/sh\nexit 1\n`);
    chmodSync(failAgent, 0o755);

    const results = runApply({ filelistPath: 'filelist.txt', promptPath: 'prompt.txt', cwd: tmpDir, agentCli: failAgent });

    expect(results).toHaveLength(2);
    expect(results.every(r => r.status === 'error')).toBe(true);
    // Files restored to snapshot
    expect(readFileSync(file1, 'utf-8')).toBe('# original a');
    expect(readFileSync(file2, 'utf-8')).toBe('# original b');
  });

  it('ignores blank lines and comments in filelist', () => {
    const filelist = join(tmpDir, 'filelist.txt');
    const prompt = join(tmpDir, 'prompt.txt');
    writeFileSync(filelist, '# comment\n\n   \n');
    writeFileSync(prompt, 'do something');

    const results = runApply({ filelistPath: 'filelist.txt', promptPath: 'prompt.txt', cwd: tmpDir });
    expect(results).toHaveLength(0);
  });

  it('throws when filelist file does not exist', () => {
    const prompt = join(tmpDir, 'prompt.txt');
    writeFileSync(prompt, 'do something');

    expect(() => runApply({ filelistPath: 'missing.txt', promptPath: 'prompt.txt', cwd: tmpDir }))
      .toThrow('Filelist not found');
  });

  it('throws when prompt file does not exist', () => {
    const filelist = join(tmpDir, 'filelist.txt');
    writeFileSync(filelist, '');

    expect(() => runApply({ filelistPath: 'filelist.txt', promptPath: 'missing.txt', cwd: tmpDir }))
      .toThrow('Prompt file not found');
  });
});
