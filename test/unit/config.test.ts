import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { loadConfig, DEFAULT_CONFIG } from '../../src/core/config.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'taproot-config-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// AC-3: missing config file → returns defaults
describe('loadConfig — missing settings.yaml', () => {
  it('returns default config when no settings.yaml exists', () => {
    const { config } = loadConfig(tmpDir);
    expect(config.version).toBe(DEFAULT_CONFIG.version);
    expect(config.commitTrailer).toBe(DEFAULT_CONFIG.commitTrailer);
    expect(config.agents).toEqual(DEFAULT_CONFIG.agents);
  });

  it('resolves root relative to cwd when no config file found', () => {
    const { config } = loadConfig(tmpDir);
    expect(config.root).toContain(tmpDir);
  });

  it('returns cwd as configDir when no config file found', () => {
    const { configDir } = loadConfig(tmpDir);
    expect(configDir).toBe(tmpDir);
  });
});

// AC-2: partial config deep-merges with defaults
describe('loadConfig — partial settings.yaml', () => {
  it('merges partial config with defaults', () => {
    mkdirSync(join(tmpDir, 'taproot'));
    writeFileSync(
      join(tmpDir, 'taproot', 'settings.yaml'),
      'version: 1\ncommitTrailer: MyProject\n'
    );
    const { config } = loadConfig(tmpDir);
    expect(config.commitTrailer).toBe('MyProject');
    // Defaults preserved
    expect(config.agents).toEqual(DEFAULT_CONFIG.agents);
    expect(config.validation.requireDates).toBe(DEFAULT_CONFIG.validation.requireDates);
  });

  it('overrides root when specified', () => {
    mkdirSync(join(tmpDir, 'taproot'));
    writeFileSync(
      join(tmpDir, 'taproot', 'settings.yaml'),
      'version: 1\nroot: custom/specs/\n'
    );
    const { config } = loadConfig(tmpDir);
    expect(config.root).toContain('custom/specs');
  });
});

// AC-4: invalid YAML → clear error message
describe('loadConfig — invalid YAML', () => {
  it('throws an error with file path when YAML is invalid', () => {
    mkdirSync(join(tmpDir, 'taproot'));
    writeFileSync(join(tmpDir, 'taproot', 'settings.yaml'), '{ invalid yaml: [unclosed');
    expect(() => loadConfig(tmpDir)).toThrowError(/Failed to parse/);
  });
});

// Config discovery: walks up directory tree
describe('loadConfig — directory tree traversal', () => {
  it('finds settings.yaml in a parent directory', () => {
    mkdirSync(join(tmpDir, 'taproot'));
    writeFileSync(
      join(tmpDir, 'taproot', 'settings.yaml'),
      'version: 1\ncommitTrailer: ParentProject\n'
    );
    const nested = join(tmpDir, 'src', 'deep', 'module');
    mkdirSync(nested, { recursive: true });
    const { config } = loadConfig(nested);
    expect(config.commitTrailer).toBe('ParentProject');
  });
});
