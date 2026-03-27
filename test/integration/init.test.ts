import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { runInit } from '../../src/commands/init.js';

describe('taproot init', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'taproot-init-test-'));
    mkdirSync(join(tmpDir, '.git')); // taproot requires a git repo
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates taproot/ directory', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot'))).toBe(true);
  });

  // AC-2: Creates taproot/settings.yaml (new layout)
  it('AC-2: creates taproot/settings.yaml', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', 'settings.yaml'))).toBe(true);
  });

  // AC-3: Agent selection prompt installs skills into taproot/agent/skills/
  it('AC-3: creates taproot/agent/skills/ directory when claude agent is selected', async () => {
    const { runInit: ri } = await import('../../src/commands/init.js');
    ri({ cwd: tmpDir, agent: 'claude' });
    expect(existsSync(join(tmpDir, 'taproot', 'agent', 'skills'))).toBe(true);
  });

  it('does not create taproot/_brainstorms/ directory', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', '_brainstorms'))).toBe(false);
  });

  it('creates taproot/CONVENTIONS.md', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', 'CONVENTIONS.md'))).toBe(true);
  });

  // AC-6: Returns messages referencing taproot/ and taproot/settings.yaml
  it('AC-6: returns messages describing what was created', () => {
    const messages = runInit({ cwd: tmpDir });
    expect(messages.some(m => m.includes('taproot/'))).toBe(true);
    expect(messages.some(m => m.includes('taproot/settings.yaml'))).toBe(true);
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

  // AC-9: hook prompt safety rationale present in source
  it('AC-9: hook prompt message describes safety rationale', () => {
    const src = readFileSync(resolve(__dirname, '../../src/commands/init.ts'), 'utf-8');
    expect(src).toMatch(/prevents.*traceability|traceability.*prevents/i);
    expect(src).toMatch(/quality checks/i);
    expect(src).toMatch(/Strongly recommended/i);
  });

  // AC-10: declining hook (withHooks: false) skips installation and reports it
  it('AC-10: withHooks: false skips installation and notes it in output', () => {
    const messages = runInit({ cwd: tmpDir, withHooks: false });
    expect(existsSync(join(tmpDir, '.git', 'hooks', 'pre-commit'))).toBe(false);
    expect(messages.some(m => m.includes('skipped') && m.includes('pre-commit'))).toBe(true);
  });

  // AC-11: --agent flag (programmatic: agent: 'claude') installs adapter
  it('AC-11: agent option installs adapter without prompt', () => {
    runInit({ cwd: tmpDir, agent: 'claude' });
    expect(existsSync(join(tmpDir, 'taproot', 'agent', 'skills'))).toBe(true);
  });

  // AC-13: no .git directory → abort with error before any prompts
  it('AC-13: throws if no .git directory exists', () => {
    rmSync(join(tmpDir, '.git'), { recursive: true, force: true });
    expect(() => runInit({ cwd: tmpDir })).toThrow(/git init/i);
    expect(existsSync(join(tmpDir, 'taproot'))).toBe(false);
  });

  // AC-14: Creates taproot/specs/ subdirectory
  it('AC-14: creates taproot/specs/ as the hierarchy root', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', 'specs'))).toBe(true);
  });

  // AC-15: Creates taproot/agent/ subdirectory
  it('AC-15: creates taproot/agent/ for skills and configuration', () => {
    runInit({ cwd: tmpDir });
    expect(existsSync(join(tmpDir, 'taproot', 'agent'))).toBe(true);
  });

  // AC-7: single select shows all templates + No template before any choice is made
  it('AC-7: template prompt uses single select with No template as first option (source inspection)', () => {
    const src = readFileSync(resolve(__dirname, '../../src/commands/init.ts'), 'utf-8');
    // Single select must include 'No template' option with empty value
    expect(src).toMatch(/No template.*empty hierarchy/);
    // All three templates must appear in the same select block
    expect(src).toMatch(/webapp.*SaaS web application/);
    expect(src).toMatch(/book-authoring.*Book or content project/);
    expect(src).toMatch(/cli-tool.*Command-line tool/);
    // Must NOT use a confirm() gating question before the template select
    const actionStart = src.indexOf('.action(async (options');
    const confirmPos = src.indexOf("message: 'Start from a template?'", actionStart);
    // The old confirm() with boolean is gone — only the select remains
    expect(src).not.toContain("default: false,\n          });");
  });

  it('AC-13: git check in action handler precedes all prompts (source inspection)', () => {
    const src = readFileSync(resolve(__dirname, '../../src/commands/init.ts'), 'utf-8');
    const actionStart = src.indexOf('.action(async (options');
    expect(actionStart).toBeGreaterThan(-1);
    const gitCheckPos = src.indexOf("options.path, '.git'", actionStart);
    const promptPositions = [
      src.indexOf('await confirm(', actionStart),
      src.indexOf('await checkbox(', actionStart),
      src.indexOf('await select(', actionStart),
    ].filter(p => p !== -1);
    const firstPrompt = Math.min(...promptPositions);
    expect(gitCheckPos).toBeGreaterThan(-1); // git check exists in action handler
    expect(gitCheckPos).toBeLessThan(firstPrompt); // git check precedes all prompts
  });

  it('gemini agent installs skills into taproot/agent/skills/', () => {
    runInit({ cwd: tmpDir, agent: 'gemini' });
    expect(existsSync(join(tmpDir, 'taproot', 'agent', 'skills', 'ineed.md'))).toBe(true);
  });

  // AC-12: --with-hooks flag (programmatic: withHooks: true) installs hook without prompt
  it('AC-12: withHooks: true installs hook without prompt', () => {
    // Create a .git directory so hook can be installed
    mkdirSync(join(tmpDir, '.git', 'hooks'), { recursive: true });
    const messages = runInit({ cwd: tmpDir, withHooks: true });
    expect(existsSync(join(tmpDir, '.git', 'hooks', 'pre-commit'))).toBe(true);
    expect(messages.some(m => m.includes('pre-commit'))).toBe(true);
  });

  // AC-2: Tier 1 agent install output includes tier label
  it('AC-2: claude install output includes Tier 1 label', () => {
    const messages = runInit({ cwd: tmpDir, agent: 'claude' });
    expect(messages.some(m => m.includes('Tier 1'))).toBe(true);
    expect(messages.some(m => m.includes('fully supported'))).toBe(true);
  });

  // AC-3: Tier 2 agent install output includes tier label
  it('AC-3: gemini install output includes Tier 2 label', () => {
    const messages = runInit({ cwd: tmpDir, agent: 'gemini' });
    expect(messages.some(m => m.includes('Tier 2'))).toBe(true);
    expect(messages.some(m => m.includes('implemented & tested'))).toBe(true);
  });

  // AC-4: Tier 3 agent install output includes community note
  it('AC-4: cursor install output includes Tier 3 and community note', () => {
    const messages = runInit({ cwd: tmpDir, agent: 'cursor' });
    expect(messages.some(m => m.includes('Tier 3'))).toBe(true);
    expect(messages.some(m => /community.supported/i.test(m))).toBe(true);
  });

  // AC-6: default tier for unknown agent is Tier 3 — static map coverage
  it('AC-6: AGENT_TIERS assigns Tier 3 to community agents', async () => {
    const { AGENT_TIERS } = await import('../../src/adapters/index.js');
    expect(AGENT_TIERS['cursor']).toBe(3);
    expect(AGENT_TIERS['copilot']).toBe(3);
    expect(AGENT_TIERS['windsurf']).toBe(3);
    expect(AGENT_TIERS['generic']).toBe(3);
  });

  // --- Domain preset ACs ---

  // AC-2: Coding / default writes no vocabulary
  it('AC-2 (preset): coding preset writes no vocabulary key', () => {
    runInit({ cwd: tmpDir, preset: 'coding' });
    const config = readFileSync(join(tmpDir, 'taproot', 'settings.yaml'), 'utf-8');
    expect(config).not.toContain('vocabulary');
  });

  // AC-3: Blogging preset writes correct vocabulary
  it('AC-3 (preset): blogging preset writes source files: posts and tests: editorial reviews', () => {
    runInit({ cwd: tmpDir, preset: 'blogging' });
    const config = readFileSync(join(tmpDir, 'taproot', 'settings.yaml'), 'utf-8');
    expect(config).toContain('posts');
    expect(config).toContain('editorial reviews');
  });

  // AC-4: Book-authoring preset writes correct vocabulary
  it('AC-4 (preset): book-authoring preset writes source files: chapters and tests: manuscript reviews', () => {
    runInit({ cwd: tmpDir, preset: 'book-authoring' });
    const config = readFileSync(join(tmpDir, 'taproot', 'settings.yaml'), 'utf-8');
    expect(config).toContain('chapters');
    expect(config).toContain('manuscript reviews');
  });

  // AC-5: Technical-writing preset writes correct vocabulary
  it('AC-5 (preset): technical-writing preset writes source files: documents and tests: reviews', () => {
    runInit({ cwd: tmpDir, preset: 'technical-writing' });
    const config = readFileSync(join(tmpDir, 'taproot', 'settings.yaml'), 'utf-8');
    expect(config).toContain('documents');
  });

  // AC-7: Language selection writes language field
  it('AC-7 (preset): language option writes language field to settings.yaml', () => {
    runInit({ cwd: tmpDir, language: 'de' });
    const config = readFileSync(join(tmpDir, 'taproot', 'settings.yaml'), 'utf-8');
    expect(config).toContain('language: de');
  });

  // AC-8: taproot update reminder shown after non-default preset
  it('AC-8 (preset): non-default preset includes taproot update reminder in output', () => {
    const messages = runInit({ cwd: tmpDir, preset: 'blogging' });
    expect(messages.some(m => m.includes('taproot update'))).toBe(true);
  });

  // AC-10: --preset flag applies preset non-interactively (programmatic: preset option)
  it('AC-10 (preset): preset option applies preset without prompts', () => {
    runInit({ cwd: tmpDir, preset: 'blogging' });
    const config = readFileSync(join(tmpDir, 'taproot', 'settings.yaml'), 'utf-8');
    expect(config).toContain('posts');
  });

  // AC-11: Unknown --preset value throws with error listing valid names
  it('AC-11 (preset): unknown preset throws with list of valid presets', () => {
    expect(() => runInit({ cwd: tmpDir, preset: 'unknown-type' })).toThrow(/Unknown preset/);
    expect(() => runInit({ cwd: tmpDir, preset: 'unknown-type' })).toThrow(/blogging/);
  });

  // AC-12: Existing vocabulary block not overwritten on re-run
  it('AC-12 (preset): existing vocabulary block preserved on re-run', () => {
    runInit({ cwd: tmpDir, preset: 'blogging' });
    runInit({ cwd: tmpDir, preset: 'technical-writing' });
    // blogging vocabulary should still be there (not overwritten)
    const config = readFileSync(join(tmpDir, 'taproot', 'settings.yaml'), 'utf-8');
    expect(config).toContain('posts');
    expect(config).not.toContain('documents');
  });

  // AVAILABLE_PRESETS exports correctly
  it('DOMAIN_PRESETS exports all four presets', async () => {
    const { DOMAIN_PRESETS, AVAILABLE_PRESETS } = await import('../../src/commands/init.js');
    expect(AVAILABLE_PRESETS).toContain('coding');
    expect(AVAILABLE_PRESETS).toContain('blogging');
    expect(AVAILABLE_PRESETS).toContain('book-authoring');
    expect(AVAILABLE_PRESETS).toContain('technical-writing');
    expect(Object.keys(DOMAIN_PRESETS.blogging.vocabulary)).toContain('source files');
  });
});
