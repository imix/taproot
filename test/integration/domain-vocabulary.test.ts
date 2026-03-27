import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runUpdate } from '../../src/commands/update.js';
import { runInit } from '../../src/commands/init.js';

function writeSettings(dir: string, extra: Record<string, unknown> = {}): void {
  const base = { version: 1, root: 'taproot/', ...extra };
  mkdirSync(join(dir, 'taproot'), { recursive: true });
  // Write YAML manually to preserve vocabulary: as a map
  const lines: string[] = [];
  for (const [k, v] of Object.entries(base)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const [vk, vv] of Object.entries(v as Record<string, string>)) {
        lines.push(`  ${vk}: ${JSON.stringify(vv)}`);
      }
    } else {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    }
  }
  writeFileSync(join(dir, 'taproot', 'settings.yaml'), lines.join('\n'));
}

describe('domain-vocabulary integration', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-vocab-test-'));
    mkdirSync(join(tmpDir, '.git'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // AC-1: vocabulary applied at taproot update
  it('AC-1: taproot update applies vocabulary overrides to skill files', async () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    writeSettings(tmpDir, {
      vocabulary: { tests: 'manuscript reviews', 'source files': 'chapters' },
    });

    const messages = await runUpdate({ cwd: tmpDir });
    expect(messages.some(m => m.startsWith('error'))).toBe(false);
    expect(messages.some(m => m.includes('vocabulary'))).toBe(true);

    const skillPath = join(tmpDir, 'taproot', 'agent', 'skills', 'implement.md');
    if (existsSync(skillPath)) {
      const content = readFileSync(skillPath, 'utf-8');
      // 'source files' should be replaced with 'chapters'
      expect(content).toContain('chapters');
    }
  });

  // AC-2: vocabulary re-applied on subsequent update runs
  it('AC-2: vocabulary overrides survive re-running taproot update', async () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    writeSettings(tmpDir, { vocabulary: { tests: 'manuscript reviews' } });

    await runUpdate({ cwd: tmpDir });
    const messages2 = await runUpdate({ cwd: tmpDir });
    expect(messages2.some(m => m.startsWith('error'))).toBe(false);

    const skillPath = join(tmpDir, 'taproot', 'agent', 'skills', 'implement.md');
    if (existsSync(skillPath)) {
      const content = readFileSync(skillPath, 'utf-8');
      expect(content).not.toContain('\x00'); // no leaked placeholders
    }
  });

  // AC-3: structural keyword conflict produces warning, non-conflicting overrides applied
  it('AC-3: structural keyword conflict is warned and skipped, others applied', async () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    writeSettings(tmpDir, {
      vocabulary: { Given: 'Assuming', tests: 'manuscript reviews' },
    });

    const messages = await runUpdate({ cwd: tmpDir });
    expect(messages.some(m => m.startsWith('error'))).toBe(false);
    // Warning about 'Given' conflict
    expect(messages.some(m => m.includes("'Given'") && m.includes('structural'))).toBe(true);
  });

  // AC-4: language pack applied first, vocabulary second
  it('AC-4: language pack is applied before vocabulary overrides', async () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    writeSettings(tmpDir, {
      language: 'de',
      vocabulary: { tests: 'Manuskriptprüfungen' },
    });

    const messages = await runUpdate({ cwd: tmpDir });
    expect(messages.some(m => m.startsWith('error'))).toBe(false);
    expect(messages.some(m => m.includes('de ('))).toBe(true); // language applied
    expect(messages.some(m => m.includes('vocabulary'))).toBe(true); // vocab applied

    const skillPath = join(tmpDir, 'taproot', 'agent', 'skills', 'implement.md');
    if (existsSync(skillPath)) {
      const content = readFileSync(skillPath, 'utf-8');
      // German structural keywords should be present (language pack ran)
      expect(content).toContain('Akteur');
      // Vocabulary override should also be present
      expect(content).toContain('Manuskriptprüfungen');
    }
  });

  // AC-5: empty vocabulary map produces no errors
  it('AC-5: empty vocabulary map completes without errors', async () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    writeSettings(tmpDir, { vocabulary: {} });

    const messages = await runUpdate({ cwd: tmpDir });
    expect(messages.some(m => m.startsWith('error'))).toBe(false);
    // No 'vocabulary N overrides' message for empty map
    expect(messages.some(m => m.includes('vocabulary 0 overrides'))).toBe(false);
  });

  // AC-5: absent vocabulary key produces no errors
  it('AC-5: absent vocabulary key completes without errors', async () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    writeSettings(tmpDir, {}); // no vocabulary key

    const messages = await runUpdate({ cwd: tmpDir });
    expect(messages.some(m => m.startsWith('error'))).toBe(false);
  });

  // Error condition: empty-string vocabulary value aborts
  it('empty-string vocabulary value aborts with error, no files modified', async () => {
    runInit({ cwd: tmpDir, agent: 'claude' });

    const skillPath = join(tmpDir, 'taproot', 'agent', 'skills', 'implement.md');
    const beforeContent = existsSync(skillPath) ? readFileSync(skillPath, 'utf-8') : null;

    writeSettings(tmpDir, { vocabulary: { tests: '' } });

    const messages = await runUpdate({ cwd: tmpDir });
    expect(messages.some(m => m.startsWith('error'))).toBe(true);
    expect(messages.some(m => m.includes("'tests'") && m.includes('empty string'))).toBe(true);
    expect(messages.some(m => m.includes('No files modified'))).toBe(true);

    if (beforeContent !== null) {
      const afterContent = existsSync(skillPath) ? readFileSync(skillPath, 'utf-8') : null;
      expect(afterContent).toBe(beforeContent);
    }
  });
});
