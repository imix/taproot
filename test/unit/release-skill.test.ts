import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parseMarkdown } from '../../src/core/markdown-parser.js';

const ROOT = resolve(__dirname, '../..');
const SKILL_PATH = resolve(ROOT, 'taproot/agent/skills/release.md');
const WORKFLOW_PATH = resolve(ROOT, '.github/workflows/release.yml');
const PREFLIGHT_PATH = resolve(ROOT, 'scripts/preflight.sh');

const REQUIRED_SKILL_SECTIONS = ['description', 'inputs', 'steps', 'output', 'cli dependencies', 'notes'];

// Individual checks live in scripts/preflight.sh — not required to be repeated verbatim in the skill
const REQUIRED_PREFLIGHT_CHECKS_IN_SCRIPT = [
  'git fetch origin',
  'npm test',
  'npm audit --audit-level=high',
  'npm run build',
  'validate-structure',
  'sync-check',
  'show-incomplete',
  'git status --porcelain',
  'git tag -l',
];

describe('release skill (taproot/agent/skills/release.md)', () => {
  it('exists at taproot/agent/skills/release.md', () => {
    expect(existsSync(SKILL_PATH), 'release.md not found at taproot/agent/skills/release.md').toBe(true);
  });

  it('is readable and non-empty', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content.trim().length).toBeGreaterThan(100);
  });

  it('has a # Skill: release heading', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toMatch(/^# Skill: release$/m);
  });

  it('has all required sections', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    const doc = parseMarkdown(SKILL_PATH, content);
    for (const section of REQUIRED_SKILL_SECTIONS) {
      expect(
        doc.sections.has(section),
        `release.md is missing "## ${section[0]!.toUpperCase() + section.slice(1)}" section`
      ).toBe(true);
    }
  });

  it('Steps section has numbered list items', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    const doc = parseMarkdown(SKILL_PATH, content);
    const steps = doc.sections.get('steps');
    expect(steps).toBeDefined();
    const hasNumberedItem = steps!.bodyLines.some(l => /^\d+\./.test(l.trim()));
    expect(hasNumberedItem, 'Steps section has no numbered list items').toBe(true);
  });

  it('delegates pre-flight to npm run preflight', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toContain('npm run preflight');
  });

  it('scripts/preflight.sh contains all required pre-flight checks', () => {
    const content = readFileSync(PREFLIGHT_PATH, 'utf-8');
    for (const check of REQUIRED_PREFLIGHT_CHECKS_IN_SCRIPT) {
      expect(content, `preflight.sh does not include check: ${check}`).toContain(check);
    }
  });

  it('accepts patch, minor, and major as valid bump types', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toContain('patch');
    expect(content).toContain('minor');
    expect(content).toContain('major');
  });

  it('documents abort behaviour for [Q] response', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toMatch(/\[Q\].*abort|abort.*\[Q\]/i);
  });

  it('references CHANGELOG.md creation and insertion', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toContain('CHANGELOG.md');
    expect(content).toContain('entries below');
  });

  it('documents push failure recovery path', () => {
    const content = readFileSync(SKILL_PATH, 'utf-8');
    expect(content).toContain('git push origin main');
    expect(content).toContain('git push origin v');
  });

  it('is not listed in SKILL_FILES (must not be distributed)', async () => {
    const { SKILL_FILES } = await import('../../src/commands/init.js');
    expect(SKILL_FILES).not.toContain('release.md');
  });
});

describe('release workflow (.github/workflows/release.yml)', () => {
  it('exists at .github/workflows/release.yml', () => {
    expect(existsSync(WORKFLOW_PATH), 'release.yml not found').toBe(true);
  });

  it('is readable and non-empty', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content.trim().length).toBeGreaterThan(100);
  });

  it('triggers on semver tag push', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain("'v[0-9]+.[0-9]+.[0-9]+'");
  });

  it('has a ci job', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toMatch(/^\s{2}ci:/m);
  });

  it('has a publish job', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toMatch(/^\s{2}publish:/m);
  });

  it('publish job needs ci', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('needs: ci');
  });

  it('publish job declares release environment', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('environment: release');
  });

  it('publish job has id-token: write permission for provenance', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('id-token: write');
  });

  it('publish job has contents: write permission for GitHub release', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('contents: write');
  });

  it('publishes with --provenance flag', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('--provenance');
  });

  it('uses NPM_TOKEN secret for publish authentication', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('secrets.NPM_TOKEN');
  });

  it('uses GITHUB_TOKEN for release creation', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('secrets.GITHUB_TOKEN');
  });

  it('creates a GitHub release with gh release create', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('gh release create');
  });

  it('ci job runs npm test, audit, and build', () => {
    const content = readFileSync(WORKFLOW_PATH, 'utf-8');
    expect(content).toContain('npm test');
    expect(content).toContain('npm audit --audit-level=high');
    expect(content).toContain('npm run build');
  });
});
