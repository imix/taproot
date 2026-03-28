import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';

const ROOT = resolve(__dirname, '../..');
const workflowPath = join(ROOT, '.github', 'workflows', 'taproot-ci.yml');

// AC-1 through AC-9: .github/workflows/taproot-ci.yml exists and is correctly configured
describe('taproot CI workflow', () => {
  it('workflow file exists at .github/workflows/taproot-ci.yml', () => {
    expect(existsSync(workflowPath)).toBe(true);
  });

  const workflow = yaml.load(readFileSync(workflowPath, 'utf-8')) as Record<string, unknown>;
  const on = workflow['on'] as Record<string, unknown>;
  const jobs = workflow['jobs'] as Record<string, unknown>;
  const validateJob = jobs?.['validate'] as Record<string, unknown> | undefined;
  const steps = (validateJob?.['steps'] as Array<Record<string, unknown>>) ?? [];

  // AC-8: triggers on push to main
  it('AC-8: triggers on push to main branch', () => {
    const push = on?.['push'] as Record<string, unknown> | undefined;
    const branches = (push?.['branches'] as string[]) ?? [];
    expect(branches).toContain('main');
  });

  // AC-8: triggers on pull_request targeting main
  it('AC-8: triggers on pull_request targeting main', () => {
    const pr = on?.['pull_request'] as Record<string, unknown> | undefined;
    const branches = (pr?.['branches'] as string[]) ?? [];
    expect(branches).toContain('main');
  });

  // AC-9: Node.js version is pinned to 20
  it('AC-9: Node.js version is pinned to 20', () => {
    const setupNode = steps.find((s) => String(s['uses'] ?? '').startsWith('actions/setup-node'));
    const nodeVersion = String((setupNode?.['with'] as Record<string, unknown>)?.['node-version'] ?? '');
    expect(nodeVersion).toBe('20');
  });

  // AC-2: build step runs before validation
  it('AC-2: has a build step', () => {
    const buildStep = steps.find((s) => String(s['run'] ?? '').includes('npm run build'));
    expect(buildStep).toBeDefined();
  });

  // AC-3: validate-structure step
  it('AC-3: has a validate-structure step', () => {
    const step = steps.find((s) => String(s['run'] ?? '').includes('validate-structure'));
    expect(step).toBeDefined();
  });

  // AC-4: validate-format step
  it('AC-4: has a validate-format step', () => {
    const step = steps.find((s) => String(s['run'] ?? '').includes('validate-format'));
    expect(step).toBeDefined();
  });

  // AC-5: check-orphans step
  it('AC-5: has a check-orphans step', () => {
    const step = steps.find((s) => String(s['run'] ?? '').includes('check-orphans'));
    expect(step).toBeDefined();
  });

  // AC-6: npm audit with high severity gate
  it('AC-6: has a security audit step with --audit-level=high', () => {
    const step = steps.find((s) => String(s['run'] ?? '').includes('npm audit'));
    expect(step).toBeDefined();
    expect(String(step?.['run'])).toContain('--audit-level=high');
  });

  // AC-7: npm test step
  it('AC-7: has a test step', () => {
    const step = steps.find((s) => String(s['run'] ?? '').includes('npm test'));
    expect(step).toBeDefined();
  });

  // Build must appear before validate steps
  it('AC-2: build step appears before validation steps', () => {
    const buildIdx = steps.findIndex((s) => String(s['run'] ?? '').includes('npm run build'));
    const validateIdx = steps.findIndex((s) => String(s['run'] ?? '').includes('validate-structure'));
    expect(buildIdx).toBeGreaterThanOrEqual(0);
    expect(validateIdx).toBeGreaterThan(buildIdx);
  });
});
