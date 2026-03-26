import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadConfig } from '../../src/core/config.js';
import { buildConfigurationMd } from '../../src/core/configuration.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'taproot-autonomous-'));
}

function writeSettings(dir: string, content: string): void {
  mkdirSync(join(dir, '.taproot'), { recursive: true });
  writeFileSync(join(dir, '.taproot', 'settings.yaml'), content);
}

let tmpDir: string;

beforeEach(() => { tmpDir = makeTempDir(); });
afterEach(() => rmSync(tmpDir, { recursive: true }));

// ─── AC-6: explicit activation only ───────────────────────────────────────────

describe('AC-6: autonomous mode activation is explicit', () => {
  it('autonomous: true in settings.yaml sets autonomous on config', () => {
    writeSettings(tmpDir, 'version: 1\nroot: taproot/\nautonomous: true\n');
    const { config } = loadConfig(tmpDir);
    expect(config.autonomous).toBe(true);
  });

  it('settings.yaml without autonomous field leaves it undefined', () => {
    writeSettings(tmpDir, 'version: 1\nroot: taproot/\n');
    const { config } = loadConfig(tmpDir);
    expect(config.autonomous).toBeUndefined();
  });

  it('autonomous: false in settings.yaml is parsed as false', () => {
    writeSettings(tmpDir, 'version: 1\nroot: taproot/\nautonomous: false\n');
    const { config } = loadConfig(tmpDir);
    expect(config.autonomous).toBe(false);
  });

  it('default config has no autonomous field', () => {
    // No settings.yaml — default config used
    const { config } = loadConfig(tmpDir);
    expect(config.autonomous).toBeUndefined();
  });
});

// ─── CONFIGURATION.md generator includes autonomous ───────────────────────────

describe('CONFIGURATION.md generator', () => {
  it('includes autonomous section', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('## autonomous');
  });

  it('documents all three activation mechanisms', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('autonomous: true');
    expect(content).toContain('TAPROOT_AUTONOMOUS=1');
    expect(content).toContain('--autonomous');
  });

  it('describes default as false / interactive', () => {
    const content = buildConfigurationMd();
    expect(content).toContain('false');
  });
});
