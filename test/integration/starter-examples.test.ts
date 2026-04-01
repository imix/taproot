import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import yaml from 'js-yaml';
import { applyTemplate, AVAILABLE_TEMPLATES, TEMPLATE_PROMPT_CHOICES } from '../../src/commands/init.js';
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

  // AC-3: CLI tool template has CLI-appropriate DoD conditions
  it('AC-3: cli-tool template settings.yaml has build and type-check DoD conditions', () => {
    applyTemplate('cli-tool', tmpDir);

    const settingsPath = join(tmpDir, 'taproot', 'settings.yaml');
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
      /Unknown template.*Available:.*webapp.*cli-tool/
    );
  });

  // C-1: throws when taproot/ already exists without --force
  it('throws when taproot/ already exists without --force', () => {
    mkdirSync(join(tmpDir, 'taproot'), { recursive: true });
    expect(() => applyTemplate('webapp', tmpDir, false)).toThrow(
      /taproot\/ already exists.*--force/
    );
  });

  it('overwrites existing taproot/ with --force', () => {
    mkdirSync(join(tmpDir, 'taproot'), { recursive: true });
    const settingsPath = join(tmpDir, 'taproot', 'settings.yaml');
    writeFileSync(settingsPath, 'version: 1\nroot: taproot/\n');

    applyTemplate('webapp', tmpDir, true);
    const updated = readFileSync(settingsPath, 'utf-8');
    expect(updated).not.toBe('version: 1\nroot: taproot/\n');
  });

  // AC-7: All template options visible before selection
  it('AC-7: prompt choices include all available templates with descriptions, No template first', () => {
    for (const template of AVAILABLE_TEMPLATES) {
      const match = TEMPLATE_PROMPT_CHOICES.find(c => c.value === template);
      expect(match).toBeDefined();
      expect(match?.name.length).toBeGreaterThan(0);
    }
    expect(TEMPLATE_PROMPT_CHOICES[0].value).toBe('');
    expect(TEMPLATE_PROMPT_CHOICES[0].name).toContain('No template');
    const choiceValues = TEMPLATE_PROMPT_CHOICES.map(c => c.value).filter(v => v !== '');
    expect(choiceValues).toEqual([...AVAILABLE_TEMPLATES]);
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
