import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateAdapters } from '../../src/adapters/index.js';
import { runUpdate } from '../../src/commands/update.js';
import { buildConfigurationMd } from '../../src/core/configuration.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeTmpProject(cli?: string): string {
  const tmpDir = mkdtempSync(join(tmpdir(), 'taproot-cli-inv-'));
  mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
  const settings = cli
    ? `version: 1\nroot: taproot/\ncli: ${cli}\n`
    : `version: 1\nroot: taproot/\n`;
  writeFileSync(join(tmpDir, '.taproot', 'settings.yaml'), settings, 'utf-8');
  return tmpDir;
}

function readAdapter(tmpDir: string, agent: 'claude' | 'cursor' | 'copilot' | 'windsurf' | 'generic'): string {
  switch (agent) {
    case 'claude':   return readFileSync(join(tmpDir, '.claude', 'commands', 'tr-taproot.md'), 'utf-8');
    case 'cursor':   return readFileSync(join(tmpDir, '.cursor', 'rules', 'taproot.md'), 'utf-8');
    case 'copilot':  return readFileSync(join(tmpDir, '.github', 'copilot-instructions.md'), 'utf-8');
    case 'windsurf': return readFileSync(join(tmpDir, '.windsurfrules'), 'utf-8');
    case 'generic':  return readFileSync(join(tmpDir, 'AGENTS.md'), 'utf-8');
  }
}

// ─── AC-1: default invocation block (npx @imix-js/taproot) ───────────────────

describe('cli-invocation — AC-1: default npx prefix in all adapters', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTmpProject(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  const agents = ['claude', 'cursor', 'copilot', 'windsurf', 'generic'] as const;

  for (const agent of agents) {
    it(`${agent} adapter contains <!-- taproot:cli-invocation: npx @imix-js/taproot -->`, () => {
      generateAdapters(agent, tmpDir);
      const content = readAdapter(tmpDir, agent);
      expect(content).toContain('<!-- taproot:cli-invocation: npx @imix-js/taproot -->');
    });

    it(`${agent} adapter contains human-readable npx instruction`, () => {
      generateAdapters(agent, tmpDir);
      const content = readAdapter(tmpDir, agent);
      expect(content).toContain('npx @imix-js/taproot');
    });
  }
});

// ─── AC-2: custom cli: override is reflected in adapter ───────────────────────

describe('cli-invocation — AC-2: custom cli: override', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTmpProject('taproot'); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('claude adapter documents bare taproot when cli: taproot configured', () => {
    generateAdapters('claude', tmpDir);
    const content = readAdapter(tmpDir, 'claude');
    expect(content).toContain('<!-- taproot:cli-invocation: taproot -->');
    expect(content).toContain('replace bare `taproot` with: `taproot`');
  });

  it('generic adapter documents bare taproot when cli: taproot configured', () => {
    generateAdapters('generic', tmpDir);
    const content = readAdapter(tmpDir, 'generic');
    expect(content).toContain('<!-- taproot:cli-invocation: taproot -->');
  });
});

// ─── AC-3: taproot update is idempotent ───────────────────────────────────────

describe('cli-invocation — AC-3: taproot update is idempotent', () => {
  let tmpDir: string;

  beforeEach(() => { tmpDir = makeTmpProject(); });
  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('running generateAdapters twice produces identical claude adapter', () => {
    generateAdapters('claude', tmpDir);
    const first = readAdapter(tmpDir, 'claude');
    generateAdapters('claude', tmpDir);
    const second = readAdapter(tmpDir, 'claude');
    expect(first).toBe(second);
  });

  it('adapter contains exactly one invocation marker after two runs', () => {
    generateAdapters('copilot', tmpDir);
    generateAdapters('copilot', tmpDir);
    const content = readAdapter(tmpDir, 'copilot');
    const markerCount = (content.match(/<!-- taproot:cli-invocation:/g) ?? []).length;
    expect(markerCount).toBe(1);
  });
});

// ─── AC-5: taproot update rewrites block after cli: change ────────────────────

describe('cli-invocation — AC-5: update rewrites block after cli: change', () => {
  let tmpDir: string;

  afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

  it('adapter switches from npx to bare taproot after cli: taproot set and update run', async () => {
    tmpDir = makeTmpProject();
    generateAdapters('claude', tmpDir);
    expect(readAdapter(tmpDir, 'claude')).toContain('<!-- taproot:cli-invocation: npx @imix-js/taproot -->');

    // Developer changes cli: in settings.yaml
    writeFileSync(join(tmpDir, '.taproot', 'settings.yaml'), 'version: 1\nroot: taproot/\ncli: taproot\n', 'utf-8');
    await runUpdate({ cwd: tmpDir });

    const updated = readAdapter(tmpDir, 'claude');
    expect(updated).toContain('<!-- taproot:cli-invocation: taproot -->');
    expect(updated).not.toContain('<!-- taproot:cli-invocation: npx @imix-js/taproot -->');
  });
});

// ─── CONFIGURATION.md includes cli section ────────────────────────────────────

describe('cli-invocation — CONFIGURATION.md documents cli key', () => {
  it('buildConfigurationMd includes ## cli section', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('## cli');
    expect(content).toContain('npx @imix-js/taproot');
    expect(content).toContain('**Requires `taproot update`:** yes');
  });

  it('taproot update installs updated CONFIGURATION.md with cli section', async () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'taproot-cli-conf-'));
    try {
      generateAdapters('claude', tmpDir);
      await runUpdate({ cwd: tmpDir });
      const configMd = readFileSync(join(tmpDir, '.taproot', 'CONFIGURATION.md'), 'utf-8');
      expect(configMd).toContain('## cli');
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
