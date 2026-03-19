import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { runCoverage, formatReport } from '../../src/commands/coverage.js';

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
