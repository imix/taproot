import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { runPlan, formatPlan } from '../../src/commands/plan.js';

const fixture = (name: string) => resolve(__dirname, '../fixtures', name);

describe('plan — candidate detection', () => {
  it('finds unimplemented specified behaviour as AFK candidate', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const afk = report.candidates.filter(c => c.classification === 'afk');
    expect(afk.some(c => c.behaviourName === 'login')).toBe(true);
  });

  it('finds unimplemented proposed behaviour as HITL candidate', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const hitl = report.candidates.filter(c => c.classification === 'hitl');
    expect(hitl.some(c => c.behaviourName === 'logout')).toBe(true);
  });

  it('finds in-progress impl behaviour as AFK candidate', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const afk = report.candidates.filter(c => c.classification === 'afk');
    const subscribe = afk.find(c => c.behaviourName === 'subscribe');
    expect(subscribe).toBeDefined();
    expect(subscribe?.inProgressImpls).toBe(1);
  });

  it('does not include fully-implemented behaviours', async () => {
    const report = await runPlan({ path: fixture('valid-hierarchy') });
    // valid-hierarchy has all complete impls
    expect(report.allImplemented).toBe(true);
    expect(report.candidates).toHaveLength(0);
  });

  it('includes intent goal on each candidate', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const login = report.candidates.find(c => c.behaviourName === 'login');
    expect(login?.intentGoal).toContain('securely access');
  });
});

describe('plan — classification', () => {
  it('AFK candidates have classification afk', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const login = report.candidates.find(c => c.behaviourName === 'login');
    expect(login?.classification).toBe('afk');
    expect(login?.specState).toBe('specified');
  });

  it('HITL candidates have classification hitl', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const logout = report.candidates.find(c => c.behaviourName === 'logout');
    expect(logout?.classification).toBe('hitl');
    expect(logout?.specState).toBe('proposed');
  });

  it('AFK candidates sort before HITL candidates', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const classifications = report.candidates.map(c => c.classification);
    const firstHitl = classifications.indexOf('hitl');
    const lastAfk = classifications.lastIndexOf('afk');
    if (firstHitl !== -1 && lastAfk !== -1) {
      expect(lastAfk).toBeLessThan(firstHitl);
    }
  });
});

describe('plan — format output', () => {
  it('tree format lists AFK section when candidates exist', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const output = formatPlan(report, 'tree');
    expect(output).toContain('AFK');
    expect(output).toContain('HITL');
  });

  it('tree format shows /tr-implement hint for AFK candidates', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const output = formatPlan(report, 'tree');
    expect(output).toContain('/tr-implement');
  });

  it('tree format shows all-implemented message when no candidates', async () => {
    const report = await runPlan({ path: fixture('valid-hierarchy') });
    const output = formatPlan(report, 'tree');
    expect(output).toContain('All behaviours are implemented');
  });

  it('json format is valid JSON with candidates array', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const json = formatPlan(report, 'json');
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed).toHaveProperty('candidates');
    expect(Array.isArray(parsed.candidates)).toBe(true);
  });

  it('json format includes classification field', async () => {
    const report = await runPlan({ path: fixture('plan-candidates') });
    const json = formatPlan(report, 'json');
    const parsed = JSON.parse(json);
    expect(parsed.candidates[0]).toHaveProperty('classification');
  });
});
