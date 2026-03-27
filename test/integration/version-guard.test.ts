import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runInit } from '../../src/commands/init.js';
import { runUpdate } from '../../src/commands/update.js';
import { checkProjectVersion } from '../../src/core/version-check.js';
import { wrapperScript, hookScriptContent } from '../../src/commands/init.js';

function captureStderr(fn: () => void): string {
  const chunks: string[] = [];
  const orig = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk: string | Uint8Array) => {
    chunks.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString());
    return true;
  };
  try { fn(); } finally { process.stderr.write = orig; }
  return chunks.join('');
}

describe('wrapperScript / hookScriptContent', () => {
  it('wrapperScript is executable sh and prefers PATH taproot', () => {
    const s = wrapperScript();
    expect(s).toMatch(/^#!\/bin\/sh/);
    expect(s).toContain('command -v taproot');
    expect(s).toContain('exec taproot "$@"');
  });

  it('wrapperScript falls back to npx with pinned version from settings.yaml', () => {
    const s = wrapperScript();
    expect(s).toContain('taproot_version');
    expect(s).toContain('npx --yes "@imix-js/taproot@$TAPROOT_VERSION"');
  });

  it('wrapperScript falls back to unpinned npx when no version found', () => {
    const s = wrapperScript();
    expect(s).toContain('npx --yes "@imix-js/taproot"');
  });

  it('hookScriptContent calls ./taproot/agent/bin/taproot commithook', () => {
    const h = hookScriptContent();
    expect(h).toMatch(/^#!\/bin\/sh/);
    expect(h).toContain('./taproot/agent/bin/taproot commithook');
    expect(h).not.toContain('npx');
  });
});

describe('taproot init — wrapper and settings', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-version-guard-test-'));
    mkdirSync(join(tmpDir, '.git'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates taproot/agent/bin/taproot wrapper script', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', 'agent', 'bin', 'taproot'))).toBe(true);
  });

  it('wrapper script is executable (mode includes 0o100)', async () => {
    runInit({ cwd: tmpDir });
    const { statSync } = await import('fs');
    const st = statSync(join(tmpDir, 'taproot', 'agent', 'bin', 'taproot'));
    expect(st.mode & 0o100).toBeTruthy();
  });

  it('writes taproot_version to settings.yaml', () => {
    runInit({ cwd: tmpDir });
    const content = readFileSync(join(tmpDir, 'taproot', 'settings.yaml'), 'utf-8');
    expect(content).toMatch(/taproot_version:/);
  });

  it('init with --with-hooks writes wrapper-based hook', () => {
    mkdirSync(join(tmpDir, '.git', 'hooks'), { recursive: true });
    runInit({ cwd: tmpDir, withHooks: true });
    const hookContent = readFileSync(join(tmpDir, '.git', 'hooks', 'pre-commit'), 'utf-8');
    expect(hookContent).toContain('taproot/agent/bin/taproot commithook');
    expect(hookContent).not.toContain('npx');
  });

  it('second init run reports wrapper exists', () => {
    runInit({ cwd: tmpDir });
    const msgs = runInit({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('taproot/agent/bin/taproot'))).toBe(false); // not re-created
  });
});

describe('taproot update — wrapper refresh and version bump', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-version-guard-update-test-'));
    mkdirSync(join(tmpDir, '.git'));
    runInit({ cwd: tmpDir });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('update refreshes taproot/agent/bin/taproot', async () => {
    // Overwrite wrapper with stale content
    writeFileSync(join(tmpDir, 'taproot', 'agent', 'bin', 'taproot'), '#!/bin/sh\necho stale\n');
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('taproot/agent/bin/taproot'))).toBe(true);
    const content = readFileSync(join(tmpDir, 'taproot', 'agent', 'bin', 'taproot'), 'utf-8');
    expect(content).toContain('command -v taproot');
  });

  it('update bumps taproot_version in settings.yaml', async () => {
    // Set an old version
    const settingsPath = join(tmpDir, 'taproot', 'settings.yaml');
    let content = readFileSync(settingsPath, 'utf-8');
    content = content.replace(/taproot_version:.*/, "taproot_version: '0.0.1'");
    writeFileSync(settingsPath, content);

    await runUpdate({ cwd: tmpDir });

    const updated = readFileSync(settingsPath, 'utf-8');
    expect(updated).not.toContain("taproot_version: '0.0.1'");
    expect(updated).toMatch(/taproot_version:/);
  });

  it('update migrates old npx hook to wrapper-based hook', async () => {
    const hookDir = join(tmpDir, '.git', 'hooks');
    mkdirSync(hookDir, { recursive: true });
    writeFileSync(
      join(hookDir, 'pre-commit'),
      '#!/bin/sh\nnpx @imix-js/taproot@0.5.0 commithook\n',
      { mode: 0o755 }
    );

    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('migrated') && m.includes('pre-commit'))).toBe(true);

    const hookContent = readFileSync(join(hookDir, 'pre-commit'), 'utf-8');
    expect(hookContent).toContain('taproot/agent/bin/taproot commithook');
    expect(hookContent).not.toContain('npx');
  });
});

describe('checkProjectVersion', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-version-check-test-'));
    mkdirSync(join(tmpDir, 'taproot'), { recursive: true });
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('is silent when no taproot/settings.yaml exists', () => {
    const stderr = captureStderr(() => checkProjectVersion(tmpDir));
    expect(stderr).toBe('');
  });

  it('is silent when taproot_version is absent from settings.yaml', () => {
    writeFileSync(join(tmpDir, 'taproot', 'settings.yaml'), 'version: 1\nroot: taproot/\n');
    const stderr = captureStderr(() => checkProjectVersion(tmpDir));
    expect(stderr).toBe('');
  });

  it('is silent when installed version matches project version', async () => {
    const { createRequire } = await import('module');
    const req = createRequire(import.meta.url);
    const { version } = req('../../package.json') as { version: string };
    writeFileSync(join(tmpDir, 'taproot', 'settings.yaml'), `version: 1\ntaproot_version: '${version}'\n`);
    const stderr = captureStderr(() => checkProjectVersion(tmpDir));
    expect(stderr).toBe('');
  });

  it('warns and suggests install when installed < project version', () => {
    writeFileSync(join(tmpDir, 'taproot', 'settings.yaml'), "version: 1\ntaproot_version: '999.0.0'\n");
    const stderr = captureStderr(() => checkProjectVersion(tmpDir));
    expect(stderr).toContain('999.0.0');
    expect(stderr).toContain('npm install');
  });

  it('warns and suggests taproot update when installed > project by minor', () => {
    writeFileSync(join(tmpDir, 'taproot', 'settings.yaml'), "version: 1\ntaproot_version: '0.0.1'\n");
    const stderr = captureStderr(() => checkProjectVersion(tmpDir));
    expect(stderr).toContain('taproot update');
  });
});
