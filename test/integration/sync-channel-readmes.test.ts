import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const repoRoot = process.cwd();
const rootReadme = join(repoRoot, 'README.md');
const channelReadme = join(repoRoot, 'channels', 'vscode', 'README.md');
const syncScript = join(repoRoot, 'scripts', 'sync-channel-readmes.sh');

function currentRootSha(): string {
  const content = readFileSync(rootReadme);
  // Match sha256sum output format
  const { execSync: exec } = require('child_process');
  return exec(`sha256sum "${rootReadme}"`, { encoding: 'utf-8' }).split(' ')[0].trim();
}

function embeddedSha(): string | null {
  const content = readFileSync(channelReadme, 'utf-8');
  const match = content.match(/<!-- root-readme-sha: ([a-f0-9]+) -->/);
  return match ? match[1] : null;
}

// AC-8: README sync check blocks CI when root README drifts
describe('sync-channel-readmes.sh', () => {
  it('channels/vscode/README.md contains a root-readme-sha marker', () => {
    const sha = embeddedSha();
    expect(sha).not.toBeNull();
    expect(sha).toMatch(/^[a-f0-9]{64}$/);
  });

  it('embedded SHA matches current README.md (channel README is in sync)', () => {
    const embedded = embeddedSha();
    const current = currentRootSha();
    expect(embedded).toBe(current);
  });

  it('--check exits 0 when channel README is in sync', () => {
    expect(() => {
      execSync(`bash "${syncScript}" --check`, { encoding: 'utf-8' });
    }).not.toThrow();
  });

  it('sync script is executable', () => {
    expect(() => {
      execSync(`test -x "${syncScript}"`);
    }).not.toThrow();
  });
});
