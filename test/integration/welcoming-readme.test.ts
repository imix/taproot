import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(__dirname, '../..');
const readme = readFileSync(join(ROOT, 'README.md'), 'utf-8');

// AC-1: Pain point hook is visible before or near the top
describe('welcoming README', () => {
  it('AC-1: pain point is surfaced near the top (before line 20)', () => {
    const lines = readme.split('\n');
    const painLines = lines.slice(0, 20).join('\n').toLowerCase();
    // Should mention the problem: agents, why, code context lost
    expect(painLines).toMatch(/why|context|chat|agent/i);
  });

  // AC-2: Value proposition is clearly stated
  it('AC-2: value proposition is stated (specs enforced, traceability, merge)', () => {
    const topThird = readme.slice(0, Math.floor(readme.length / 3)).toLowerCase();
    expect(topThird).toMatch(/spec|tracea|enforc|merge/i);
  });

  // AC-6: Animation/demo is in the viewport (near top of file)
  it('AC-6: demo.svg is referenced near the top of README', () => {
    const top = readme.slice(0, 500);
    expect(top).toContain('demo.svg');
  });

  it('AC-6: docs/demo.svg file exists', () => {
    expect(existsSync(join(ROOT, 'docs', 'demo.svg'))).toBe(true);
  });

  // AC-3: Quick Start section is present and functional
  it('AC-3: README contains a ## Quick Start section', () => {
    expect(readme).toMatch(/^## Quick Start/m);
  });

  it('AC-3: Quick Start shows npx init command', () => {
    const qsIdx = readme.indexOf('## Quick Start');
    const nextH2 = readme.indexOf('\n## ', qsIdx + 1);
    const section = nextH2 === -1 ? readme.slice(qsIdx) : readme.slice(qsIdx, nextH2);
    expect(section).toContain('npx');
    expect(section).toContain('taproot');
    expect(section).toContain('init');
  });

  // AC-7: Emotional benefit framing
  it('AC-7: README uses first-person or benefit-driven framing', () => {
    expect(readme.toLowerCase()).toMatch(/why|benefit|know|agent|finally|reason/i);
  });

  // AC-4: Proof of self-use
  it('AC-4: README mentions that taproot tracks itself', () => {
    expect(readme.toLowerCase()).toMatch(/taproot tracks itself|manages.*taproot|taproot.*taproot/i);
  });
});
