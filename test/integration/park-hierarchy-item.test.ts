import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { runCheckOrphans } from '../../src/commands/check-orphans.js';
import { runPlan } from '../../src/commands/plan.js';
import { runCoverage } from '../../src/commands/coverage.js';
import { validateFormat } from '../../src/validators/format-rules.js';
import { parseMarkdown } from '../../src/core/markdown-parser.js';
import { DEFAULT_CONFIG } from '../../src/core/config.js';

const fixture = (name: string) => resolve(__dirname, '../fixtures', name);

// ─── AC-1: deferred usecase.md not flagged by check-orphans --include-unimplemented ────

describe('AC-1: deferred behaviour not flagged as unimplemented', () => {
  it('does not raise UNIMPLEMENTED_BEHAVIOUR for a deferred usecase', async () => {
    const violations = await runCheckOrphans({
      path: fixture('deferred-items'),
      includeUnimplemented: true,
    });
    const unimpl = violations.filter(v => v.code === 'UNIMPLEMENTED_BEHAVIOUR');
    // parked-sso has state:deferred and no impls — should not be reported
    const ssoFlag = unimpl.some(v => v.filePath.includes('parked-sso'));
    expect(ssoFlag).toBe(false);
  });
});

// ─── AC-2: deferred impl.md with missing source file not flagged ──────────────

describe('AC-2: deferred impl not flagged for missing source file', () => {
  it('does not raise MISSING_SOURCE_FILE for a deferred impl', async () => {
    const violations = await runCheckOrphans({ path: fixture('deferred-items') });
    const missing = violations.filter(v => v.code === 'MISSING_SOURCE_FILE');
    // login/rest-api and billing/subscribe/stripe are deferred — their source files don't exist
    const loginFlag = missing.some(v => v.filePath.includes('login/rest-api'));
    const stripeFlag = missing.some(v => v.filePath.includes('subscribe/stripe'));
    expect(loginFlag).toBe(false);
    expect(stripeFlag).toBe(false);
  });

  it('does not raise MISSING_TEST_FILE for a deferred impl', async () => {
    const violations = await runCheckOrphans({ path: fixture('deferred-items') });
    const missing = violations.filter(v => v.code === 'MISSING_TEST_FILE');
    const loginFlag = missing.some(v => v.filePath.includes('login/rest-api'));
    expect(loginFlag).toBe(false);
  });

  it('raises no violations at all for the deferred-items fixture', async () => {
    const violations = await runCheckOrphans({
      path: fixture('deferred-items'),
      includeUnimplemented: true,
    });
    expect(violations).toHaveLength(0);
  });
});

// ─── AC-3: deferred behaviour excluded from plan candidates ───────────────────

describe('AC-3: deferred behaviour excluded from plan', () => {
  it('does not include deferred behaviour as a plan candidate', async () => {
    const report = await runPlan({ path: fixture('deferred-items') });
    const names = report.candidates.map(c => c.behaviourName);
    expect(names).not.toContain('parked-sso');
  });
});

// ─── AC-5: deferred rejected on intent.md ────────────────────────────────────

describe('AC-5: deferred is not valid on intent.md', () => {
  it('emits specific error when intent.md has State: deferred', () => {
    const content = `# Intent: Foo\n\n## Goal\nDo stuff.\n\n## Stakeholders\n- Dev\n\n## Success Criteria\n- Done\n\n## Status\n- **State:** deferred\n- **Created:** 2026-01-01\n- **Last reviewed:** 2026-01-01\n`;
    const doc = parseMarkdown('/fake/intent.md', content);
    const violations = validateFormat(doc, 'intent', DEFAULT_CONFIG);
    const stateViolation = violations.find(v => v.code === 'INVALID_STATUS_VALUE');
    expect(stateViolation).toBeDefined();
    expect(stateViolation?.message).toContain('deferred is not a valid state for intent.md');
    expect(stateViolation?.message).toContain('deprecated');
  });

  it('accepts deferred on usecase.md', () => {
    const content = `# Behaviour: Foo\n\n## Actor\nUser\n\n## Preconditions\n- exists\n\n## Main Flow\n1. does thing\n\n## Postconditions\n- done\n\n## Status\n- **State:** deferred\n- **Created:** 2026-01-01\n- **Last reviewed:** 2026-01-01\n`;
    const doc = parseMarkdown('/fake/usecase.md', content);
    const violations = validateFormat(doc, 'behaviour', DEFAULT_CONFIG);
    const stateViolation = violations.find(v => v.code === 'INVALID_STATUS_VALUE');
    expect(stateViolation).toBeUndefined();
  });

  it('accepts deferred on impl.md', () => {
    const content = `# Implementation: Foo\n\n## Behaviour\n../usecase.md\n\n## Design Decisions\n- x\n\n## Source Files\n- \`src/foo.ts\`\n\n## Commits\n- (none)\n\n## Tests\n- \`test/foo.test.ts\`\n\n## Status\n- **State:** deferred\n- **Created:** 2026-01-01\n- **Last verified:** 2026-01-01\n`;
    const doc = parseMarkdown('/fake/impl.md', content);
    const violations = validateFormat(doc, 'impl', DEFAULT_CONFIG);
    const stateViolation = violations.find(v => v.code === 'INVALID_STATUS_VALUE');
    expect(stateViolation).toBeUndefined();
  });
});

// ─── AC-6: un-parked impl resumes normal orphan checking ─────────────────────

describe('AC-6: un-parked impl resumes normal checking', () => {
  it('raises MISSING_SOURCE_FILE for needs-rework impl with missing source', async () => {
    // The valid-hierarchy fixture has impls referencing non-existent source files
    const violations = await runCheckOrphans({ path: fixture('valid-hierarchy') });
    const missing = violations.filter(v => v.code === 'MISSING_SOURCE_FILE');
    expect(missing.length).toBeGreaterThan(0);
  });
});

// ─── AC-7: specified behaviour with deferred impl stays as plan candidate ─────

describe('AC-7: specified behaviour with deferred-only impl remains a plan candidate', () => {
  it('includes login as a plan candidate even though its only impl is deferred', async () => {
    const report = await runPlan({ path: fixture('deferred-items') });
    const names = report.candidates.map(c => c.behaviourName);
    expect(names).toContain('login');
  });

  it('includes subscribe as a plan candidate even though its only impl is deferred', async () => {
    const report = await runPlan({ path: fixture('deferred-items') });
    const names = report.candidates.map(c => c.behaviourName);
    expect(names).toContain('subscribe');
  });
});

// ─── Coverage deferred totals ──────────────────────────────────────────────────

describe('coverage deferred totals', () => {
  it('counts deferred behaviours separately', async () => {
    const report = await runCoverage({ path: fixture('deferred-items') });
    expect(report.totals.deferredBehaviours).toBeGreaterThan(0);
  });

  it('counts deferred impls separately', async () => {
    const report = await runCoverage({ path: fixture('deferred-items') });
    expect(report.totals.deferredImpls).toBeGreaterThan(0);
  });

  it('does not count deferred items in regular implementation totals', async () => {
    const report = await runCoverage({ path: fixture('deferred-items') });
    // login/rest-api and subscribe/stripe are deferred — not in implementations total
    expect(report.totals.implementations).toBe(0);
    expect(report.totals.deferredImpls).toBe(2);
  });
});
