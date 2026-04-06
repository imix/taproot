import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runNew } from '../../src/commands/new.js';

function makeProject(): string {
  const tmp = mkdtempSync(join(tmpdir(), 'taproot-new-'));
  mkdirSync(join(tmp, 'taproot', 'specs'), { recursive: true });
  writeFileSync(
    join(tmp, 'taproot', 'settings.yaml'),
    'version: 1\nroot: taproot/specs/\n',
    'utf-8',
  );
  return tmp;
}

function makeIntent(root: string, slug: string): string {
  const dir = join(root, 'taproot', 'specs', slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'intent.md'), `# Intent: ${slug}\n\n## Status\n- **State:** draft\n`, 'utf-8');
  return dir;
}

function makeBehaviour(intentDir: string, slug: string): string {
  const dir = join(intentDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'usecase.md'), `# Behaviour: ${slug}\n\n## Status\n- **State:** specified\n`, 'utf-8');
  return dir;
}

let tmpDir: string;

beforeEach(() => { tmpDir = makeProject(); });
afterEach(() => { rmSync(tmpDir, { recursive: true, force: true }); });

// AC-1: Creates intent stub at hierarchy root
describe('AC-1: taproot new intent', () => {
  it('creates intent.md at the hierarchy root', () => {
    const result = runNew({ type: 'intent', slug: 'user-authentication', cwd: tmpDir });
    const expected = join(tmpDir, 'taproot', 'specs', 'user-authentication', 'intent.md');
    expect(existsSync(expected)).toBe(true);
    expect(result.path).toBe(expected);
  });

  it('writes intent template with state draft', () => {
    runNew({ type: 'intent', slug: 'user-authentication', cwd: tmpDir });
    const content = readFileSync(
      join(tmpDir, 'taproot', 'specs', 'user-authentication', 'intent.md'),
      'utf-8',
    );
    expect(content).toContain('# Intent: User Authentication');
    expect(content).toContain('**State:** draft');
  });

  it('slug is converted to title case in heading', () => {
    runNew({ type: 'intent', slug: 'payment-processing', cwd: tmpDir });
    const content = readFileSync(
      join(tmpDir, 'taproot', 'specs', 'payment-processing', 'intent.md'),
      'utf-8',
    );
    expect(content).toContain('# Intent: Payment Processing');
  });
});

// AC-2: Creates behaviour stub under an existing intent
describe('AC-2: taproot new behaviour under intent', () => {
  it('creates usecase.md under intent directory', () => {
    const intentDir = makeIntent(tmpDir, 'user-authentication');
    const result = runNew({ type: 'behaviour', parent: intentDir, slug: 'password-login', cwd: tmpDir });
    const expected = join(intentDir, 'password-login', 'usecase.md');
    expect(existsSync(expected)).toBe(true);
    expect(result.path).toBe(expected);
  });

  it('writes behaviour template with state proposed', () => {
    const intentDir = makeIntent(tmpDir, 'user-authentication');
    runNew({ type: 'behaviour', parent: intentDir, slug: 'password-login', cwd: tmpDir });
    const content = readFileSync(join(intentDir, 'password-login', 'usecase.md'), 'utf-8');
    expect(content).toContain('# Behaviour: Password Login');
    expect(content).toContain('**State:** proposed');
  });
});

// AC-3: Creates impl stub under an existing behaviour
describe('AC-3: taproot new impl', () => {
  it('creates impl.md under behaviour directory', () => {
    const intentDir = makeIntent(tmpDir, 'user-authentication');
    const behaviourDir = makeBehaviour(intentDir, 'password-login');
    const result = runNew({ type: 'impl', parent: behaviourDir, slug: 'cli-command', cwd: tmpDir });
    const expected = join(behaviourDir, 'cli-command', 'impl.md');
    expect(existsSync(expected)).toBe(true);
    expect(result.path).toBe(expected);
  });

  it('writes impl template with state planned', () => {
    const intentDir = makeIntent(tmpDir, 'user-authentication');
    const behaviourDir = makeBehaviour(intentDir, 'password-login');
    runNew({ type: 'impl', parent: behaviourDir, slug: 'cli-command', cwd: tmpDir });
    const content = readFileSync(join(behaviourDir, 'cli-command', 'impl.md'), 'utf-8');
    expect(content).toContain('# Implementation: Cli Command');
    expect(content).toContain('**State:** planned');
  });
});

// AC-4: Creates sub-behaviour stub under an existing behaviour
describe('AC-4: taproot new behaviour under behaviour (sub-behaviour)', () => {
  it('creates usecase.md under behaviour directory', () => {
    const intentDir = makeIntent(tmpDir, 'user-authentication');
    const behaviourDir = makeBehaviour(intentDir, 'password-login');
    const result = runNew({ type: 'behaviour', parent: behaviourDir, slug: 'credential-validation', cwd: tmpDir });
    const expected = join(behaviourDir, 'credential-validation', 'usecase.md');
    expect(existsSync(expected)).toBe(true);
    expect(result.path).toBe(expected);
  });

  it('writes behaviour template with state proposed for sub-behaviour', () => {
    const intentDir = makeIntent(tmpDir, 'user-authentication');
    const behaviourDir = makeBehaviour(intentDir, 'password-login');
    runNew({ type: 'behaviour', parent: behaviourDir, slug: 'credential-validation', cwd: tmpDir });
    const content = readFileSync(join(behaviourDir, 'credential-validation', 'usecase.md'), 'utf-8');
    expect(content).toContain('**State:** proposed');
  });
});

// AC-6: Reports error when target already exists
describe('AC-6: error when target already exists', () => {
  it('throws when intent slug already exists', () => {
    makeIntent(tmpDir, 'user-authentication');
    expect(() =>
      runNew({ type: 'intent', slug: 'user-authentication', cwd: tmpDir })
    ).toThrow(/Already exists/);
  });

  it('does not overwrite the existing file', () => {
    const intentDir = makeIntent(tmpDir, 'user-authentication');
    const original = readFileSync(join(intentDir, 'intent.md'), 'utf-8');
    try {
      runNew({ type: 'intent', slug: 'user-authentication', cwd: tmpDir });
    } catch {
      // expected
    }
    const after = readFileSync(join(intentDir, 'intent.md'), 'utf-8');
    expect(after).toBe(original);
  });
});

// AC-7: Reports error when parent path not found
describe('AC-7: error when parent path not found', () => {
  it('throws when parent directory does not exist', () => {
    expect(() =>
      runNew({ type: 'behaviour', parent: join(tmpDir, 'taproot', 'specs', 'nonexistent'), slug: 'my-behaviour', cwd: tmpDir })
    ).toThrow(/Parent not found/);
  });

  it('throws for impl when parent directory does not exist', () => {
    expect(() =>
      runNew({ type: 'impl', parent: join(tmpDir, 'taproot', 'specs', 'nonexistent'), slug: 'my-impl', cwd: tmpDir })
    ).toThrow(/Parent not found/);
  });
});

// AC-8: Reports error for wrong parent type for impl
describe('AC-8: error for wrong parent type (impl under intent)', () => {
  it('throws type mismatch when impl parent has only intent.md', () => {
    const intentDir = makeIntent(tmpDir, 'user-authentication');
    expect(() =>
      runNew({ type: 'impl', parent: intentDir, slug: 'cli-command', cwd: tmpDir })
    ).toThrow(/Type mismatch/);
  });

  it('error message mentions that impl must be placed under a behaviour', () => {
    const intentDir = makeIntent(tmpDir, 'user-authentication');
    let message = '';
    try {
      runNew({ type: 'impl', parent: intentDir, slug: 'cli-command', cwd: tmpDir });
    } catch (err) {
      message = err instanceof Error ? err.message : String(err);
    }
    expect(message).toContain('behaviour');
  });
});

// AC-9: Template file passes structural validation
describe('AC-9: created files contain required sections', () => {
  it('intent.md contains ## Status section', () => {
    runNew({ type: 'intent', slug: 'my-intent', cwd: tmpDir });
    const content = readFileSync(join(tmpDir, 'taproot', 'specs', 'my-intent', 'intent.md'), 'utf-8');
    expect(content).toContain('## Status');
  });

  it('usecase.md contains ## Actor and ## Status sections', () => {
    const intentDir = makeIntent(tmpDir, 'my-intent');
    runNew({ type: 'behaviour', parent: intentDir, slug: 'my-behaviour', cwd: tmpDir });
    const content = readFileSync(join(intentDir, 'my-behaviour', 'usecase.md'), 'utf-8');
    expect(content).toContain('## Actor');
    expect(content).toContain('## Status');
  });

  it('impl.md contains ## Behaviour and ## Status sections', () => {
    const intentDir = makeIntent(tmpDir, 'my-intent');
    const behaviourDir = makeBehaviour(intentDir, 'my-behaviour');
    runNew({ type: 'impl', parent: behaviourDir, slug: 'my-impl', cwd: tmpDir });
    const content = readFileSync(join(behaviourDir, 'my-impl', 'impl.md'), 'utf-8');
    expect(content).toContain('## Behaviour');
    expect(content).toContain('## Status');
  });
});

// message format
describe('result message', () => {
  it('includes the created file path', () => {
    const result = runNew({ type: 'intent', slug: 'my-intent', cwd: tmpDir });
    expect(result.message).toContain('my-intent');
    expect(result.message).toContain('intent.md');
  });
});
