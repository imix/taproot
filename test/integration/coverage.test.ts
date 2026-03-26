import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { runCoverage, formatReport, collectIncomplete } from '../../src/commands/coverage.js';

const fixture = (name: string) => resolve(__dirname, '../fixtures', name);

describe('coverage — valid hierarchy', () => {
  it('returns correct intent count', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    expect(report.totals.intents).toBe(1);
  });

  it('returns correct behaviour count', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    // register-account and choose-plan
    expect(report.totals.behaviours).toBe(2);
  });

  it('returns correct implementation count', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    // email-validation, password-policy, stripe-integration, trial-activation
    expect(report.totals.implementations).toBe(4);
  });

  it('reflects correct complete impl count', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    // all 4 are in "complete" state
    expect(report.totals.completeImpls).toBe(4);
  });

  it('reflects correct tested impl count', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    // email-validation, password-policy, trial-activation have tests; stripe-integration does not
    expect(report.totals.testedImpls).toBe(3);
  });

  it('captures intent state', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const intent = report.intents[0]!;
    expect(intent.state).toBe('active');
    expect(intent.name).toBe('user-onboarding');
  });
});

describe('coverage — format output', () => {
  it('produces valid JSON', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const json = formatReport(report, 'json');
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed).toHaveProperty('totals');
    expect(parsed).toHaveProperty('intents');
  });

  it('tree format contains intent name', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const tree = formatReport(report, 'tree');
    expect(tree).toContain('user-onboarding');
    expect(tree).toContain('[active]');
  });

  it('tree format shows ⚠ for impls without tests', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const tree = formatReport(report, 'tree');
    expect(tree).toContain('⚠');
  });

  it('markdown format contains # heading', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const md = formatReport(report, 'markdown');
    expect(md).toContain('# Taproot Coverage Report');
    expect(md).toContain('user-onboarding');
  });
});

describe('coverage — collectIncomplete', () => {
  it('returns empty array when all impls are complete', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    expect(collectIncomplete(report)).toHaveLength(0);
  });

  it('returns incomplete impl when state is in-progress', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    // Mutate one impl to in-progress to test detection
    const impl = report.intents[0]!.behaviours[0]!.implementations[0]!;
    const originalState = impl.state;
    impl.state = 'in-progress';
    const result = collectIncomplete(report);
    expect(result).toHaveLength(1);
    expect(result[0]!.state).toBe('in-progress');
    expect(result[0]!.path).toBe(impl.path);
    impl.state = originalState;
  });

  it('returns incomplete impl when state is needs-rework', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const impl = report.intents[0]!.behaviours[0]!.implementations[0]!;
    impl.state = 'needs-rework';
    const result = collectIncomplete(report);
    expect(result).toHaveLength(1);
    expect(result[0]!.state).toBe('needs-rework');
    impl.state = 'complete';
  });

  it('excludes deferred impls', async () => {
    const report = await runCoverage({ path: fixture('valid-hierarchy') });
    const impl = report.intents[0]!.behaviours[0]!.implementations[0]!;
    impl.state = 'deferred';
    expect(collectIncomplete(report)).toHaveLength(0);
    impl.state = 'complete';
  });
});
