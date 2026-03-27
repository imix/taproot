import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';
import { buildConfigurationMd } from '../../src/core/configuration.js';
import { generateAdapters } from '../../src/adapters/index.js';
import { runUpdate } from '../../src/commands/update.js';

// ─── buildConfigurationMd content ─────────────────────────────────────────────

describe('buildConfigurationMd', () => {
  it('contains a Configuration Quick Reference heading', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('# Taproot Configuration Reference');
  });

  it('documents the language option', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('## language');
    expect(content).toContain('language:');
  });

  it('documents the vocabulary option', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('## vocabulary');
    expect(content).toContain('vocabulary:');
  });

  it('documents the definitionOfDone option', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('## definitionOfDone');
    expect(content).toContain('definitionOfDone:');
  });

  it('documents the definitionOfReady option', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('## definitionOfReady');
  });

  it('indicates language and vocabulary require taproot update', () => {
    const content = buildConfigurationMd();
    const langSection = content.slice(content.indexOf('## language'), content.indexOf('## vocabulary'));
    expect(langSection).toContain('Requires');
    expect(langSection).toContain('yes');

    const vocabSection = content.slice(content.indexOf('## vocabulary'), content.indexOf('## definitionOfDone'));
    expect(vocabSection).toContain('Requires');
    expect(vocabSection).toContain('yes');
  });

  it('indicates definitionOfDone does NOT require taproot update', () => {
    const content = buildConfigurationMd();
    const dodSection = content.slice(content.indexOf('## definitionOfDone'), content.indexOf('## definitionOfReady'));
    expect(dodSection).toContain('Requires');
    expect(dodSection).toContain('no');
    expect(dodSection).toContain('runtime');
  });

  it('includes a pointer to .taproot/CONFIGURATION.md in the generated content', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('taproot update');
  });

  it('lists supported language codes', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('de');
    expect(content).toContain('fr');
  });
});

// ─── taproot update installs CONFIGURATION.md (AC-6, AC-7) ────────────────────

describe('taproot update — CONFIGURATION.md installation', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-configmd-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('AC-6: installs .taproot/CONFIGURATION.md when absent', async () => {
    generateAdapters('claude', tmpDir);
    await runUpdate({ cwd: tmpDir });
    const configMdPath = join(tmpDir, '.taproot', 'CONFIGURATION.md');
    expect(existsSync(configMdPath)).toBe(true);
    const content = readFileSync(configMdPath, 'utf-8');
    expect(content).toContain('## language');
    expect(content).toContain('## vocabulary');
    expect(content).toContain('## definitionOfDone');
  });

  it('AC-6: reports CONFIGURATION.md as created in update messages', async () => {
    generateAdapters('claude', tmpDir);
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('CONFIGURATION.md') && m.includes('created'))).toBe(true);
  });

  it('AC-7: refreshes CONFIGURATION.md when it already exists', async () => {
    generateAdapters('claude', tmpDir);
    // First run — creates it
    await runUpdate({ cwd: tmpDir });
    // Second run — refreshes it
    const msgs = await runUpdate({ cwd: tmpDir });
    expect(msgs.some(m => m.includes('CONFIGURATION.md') && m.includes('updated'))).toBe(true);
  });

  it('AC-6: CONFIGURATION.md documents all settings.yaml options with examples', async () => {
    generateAdapters('cursor', tmpDir);
    await runUpdate({ cwd: tmpDir });
    const content = readFileSync(join(tmpDir, '.taproot', 'CONFIGURATION.md'), 'utf-8');
    expect(content).toContain('## language');
    expect(content).toContain('## vocabulary');
    expect(content).toContain('## definitionOfDone');
    expect(content).toContain('## definitionOfReady');
    // Must include examples
    expect(content).toContain('```yaml');
  });
});

// ─── taproot --help footer (AC-2) ─────────────────────────────────────────────

describe('taproot --help footer (AC-2)', () => {
  it('AC-2: taproot --help output references taproot/settings.yaml and CONFIGURATION.md', () => {
    const cliBin = resolve(__dirname, '../../dist/cli.js');
    const result = spawnSync(process.execPath, [cliBin, '--help'], { encoding: 'utf-8' });
    const output = result.stdout + result.stderr;
    expect(output).toContain('taproot/settings.yaml');
    expect(output).toContain('CONFIGURATION.md');
  });
});
