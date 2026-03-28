import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';

const ROOT = resolve(__dirname, '../..');
const settingsPath = join(ROOT, 'taproot', 'settings.yaml');
const settings = yaml.load(readFileSync(settingsPath, 'utf-8')) as Record<string, unknown>;
const dod = (settings.definitionOfDone as unknown[]) ?? [];

// AC-3: DoD enforces agent-agnostic language compliance on every implementation commit
describe('agent-agnostic language — settings wiring', () => {
  it('taproot/settings.yaml has check-if-affected-by: agent-integration/agent-agnostic-language in definitionOfDone', () => {
    const hasCondition = dod.some((entry) => {
      if (typeof entry === 'string') {
        return entry === 'check-if-affected-by: agent-integration/agent-agnostic-language';
      }
      if (typeof entry === 'object' && entry !== null) {
        const e = entry as Record<string, unknown>;
        return e['check-if-affected-by'] === 'agent-integration/agent-agnostic-language';
      }
      return false;
    });
    expect(hasCondition).toBe(true);
  });

  it('definitionOfDone is a non-empty array', () => {
    expect(Array.isArray(dod)).toBe(true);
    expect(dod.length).toBeGreaterThan(0);
  });
});
