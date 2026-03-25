import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import yaml from 'js-yaml';
import { applyTemplate, AVAILABLE_TEMPLATES } from '../../src/commands/init.js';
import { runValidateStructure } from '../../src/commands/validate-structure.js';
import { runValidateFormat } from '../../src/commands/validate-format.js';

const EXAMPLES_DIR = resolve(__dirname, '../../examples');

describe('starter-examples — applyTemplate', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-template-test-'));
    mkdirSync(join(tmpDir, '.git'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  // AC-1: Webapp template produces an immediately implementable hierarchy
  it('AC-1: webapp template produces intents with specified behaviours', () => {
    applyTemplate('webapp', tmpDir);

    const taprootDir = join(tmpDir, 'taproot');
    expect(existsSync(taprootDir)).toBe(true);

    // At least 2 intent dirs
    const { readdirSync } = require('fs');
    const intentDirs = readdirSync(taprootDir, { withFileTypes: true })
      .filter((d: { isDirectory: () => boolean; name: string }) => d.isDirectory() && !d.name.startsWith('_'))
      .map((d: { name: string }) => d.name);
    expect(intentDirs.length).toBeGreaterThanOrEqual(2);

    // user-auth/sign-up/usecase.md exists and is in specified state
    const signUpUsecase = join(taprootDir, 'user-auth', 'sign-up', 'usecase.md');
    expect(existsSync(signUpUsecase)).toBe(true);
    const content = readFileSync(signUpUsecase, 'utf-8');
    expect(content).toContain('**State:** specified');
  });

  // AC-2: Book-authoring template configures domain vocabulary
  it('AC-2: book-authoring template settings.yaml has vocabulary overrides', () => {
    applyTemplate('book-authoring', tmpDir);

    const settingsPath = join(tmpDir, '.taproot', 'settings.yaml');
    expect(existsSync(settingsPath)).toBe(true);

    const settings = yaml.load(readFileSync(settingsPath, 'utf-8')) as Record<string, unknown>;
    expect(settings).toHaveProperty('vocabulary');
    const vocab = settings['vocabulary'] as Record<string, string>;
    expect(vocab['tests']).toBe('manuscript reviews');
    expect(vocab['source files']).toBe('chapters');
  });

  // AC-3: CLI tool template has CLI-appropriate DoD conditions
  it('AC-3: cli-tool template settings.yaml has build and type-check DoD conditions', () => {
    applyTemplate('cli-tool', tmpDir);

    const settingsPath = join(tmpDir, '.taproot', 'settings.yaml');
    expect(existsSync(settingsPath)).toBe(true);

    const settings = yaml.load(readFileSync(settingsPath, 'utf-8')) as Record<string, unknown>;
    expect(settings).toHaveProperty('definitionOfDone');
    const dod = settings['definitionOfDone'] as Array<Record<string, string> | string>;
    const dodStr = JSON.stringify(dod);
    expect(dodStr).toContain('npm test');
    expect(dodStr).toContain('tsc');
    expect(dodStr).toContain('build');
  });

  // AC-6: Unknown template name produces a helpful error
  it('AC-6: unknown template throws with available template names', () => {
    expect(() => applyTemplate('unknown-type', tmpDir)).toThrow(
      /Unknown template.*Available:.*webapp.*book-authoring.*cli-tool/
    );
  });

  // Template settings.yaml is not overwritten when it already exists (no --force)
  it('does not overwrite existing .taproot/settings.yaml without force', () => {
    mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
    const settingsPath = join(tmpDir, '.taproot', 'settings.yaml');
    const original = 'version: 1\nroot: taproot/\n';
    require('fs').writeFileSync(settingsPath, original);

    applyTemplate('webapp', tmpDir, false);
    expect(readFileSync(settingsPath, 'utf-8')).toBe(original);
  });

  it('overwrites existing .taproot/settings.yaml with --force', () => {
    mkdirSync(join(tmpDir, '.taproot'), { recursive: true });
    const settingsPath = join(tmpDir, '.taproot', 'settings.yaml');
    require('fs').writeFileSync(settingsPath, 'version: 1\nroot: taproot/\n');

    applyTemplate('webapp', tmpDir, true);
    const updated = readFileSync(settingsPath, 'utf-8');
    expect(updated).not.toBe('version: 1\nroot: taproot/\n');
  });
});

// AC-4: No-match fallback initialises cleanly — covered by existing init tests

// AC-5: All starters pass structural and format validation
describe('starter-examples — validation', () => {
  for (const template of AVAILABLE_TEMPLATES) {
    it(`AC-5: ${template} passes validate-structure`, async () => {
      const templateTaprootDir = join(EXAMPLES_DIR, template, 'taproot');
      const violations = await runValidateStructure({ path: templateTaprootDir });
      const errors = violations.filter(v => v.type === 'error');
      expect(errors).toHaveLength(0);
    });

    it(`AC-5: ${template} passes validate-format`, async () => {
      const templateTaprootDir = join(EXAMPLES_DIR, template, 'taproot');
      const violations = await runValidateFormat({ path: templateTaprootDir });
      const errors = violations.filter(v => v.type === 'error');
      expect(errors).toHaveLength(0);
    });
  }
});
