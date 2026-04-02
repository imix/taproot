import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(__dirname, '../..');
const PATTERNS_PATH = join(ROOT, 'docs/patterns.md');
const AGENT_PATTERNS_PATH = join(ROOT, 'taproot/agent/docs/patterns.md');
const IMPLEMENT_PATH = join(ROOT, 'skills/implement.md');
const COMMIT_PATH = join(ROOT, 'skills/commit.md');
const LINK_PATH = join(ROOT, 'skills/link.md');

describe('signal-cross-repo-change — pattern entry', () => {
  it('docs/patterns.md contains cross-repo change handoff section', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/[Cc]ross-repo.*change.*handoff|[Cc]ross-repo.*handoff/);
  });

  it('pattern describes blocking and non-blocking cases', () => {
    const content = readFileSync(PATTERNS_PATH, 'utf-8');
    expect(content).toMatch(/[Bb]locking/);
  });

  it('agent copy matches package source', () => {
    const source = readFileSync(PATTERNS_PATH, 'utf-8');
    const agent = readFileSync(AGENT_PATTERNS_PATH, 'utf-8');
    expect(source).toBe(agent);
  });
});

describe('signal-cross-repo-change — skill pointers', () => {
  it('implement.md references cross-repo handoff', () => {
    const content = readFileSync(IMPLEMENT_PATH, 'utf-8');
    expect(content).toMatch(/[Cc]ross-repo/);
  });

  it('commit.md references cross-repo handoff for linked truths', () => {
    const content = readFileSync(COMMIT_PATH, 'utf-8');
    expect(content).toMatch(/[Cc]ross-repo.*handoff|[Cc]ross-repo change/i);
  });

  it('link.md references cross-repo handoff', () => {
    const content = readFileSync(LINK_PATH, 'utf-8');
    expect(content).toMatch(/[Cc]ross-repo.*handoff|[Cc]ross-repo change/i);
  });
});
