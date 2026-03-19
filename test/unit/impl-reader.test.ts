import { describe, it, expect } from 'vitest';
import { parseImplData } from '../../src/core/impl-reader.js';
import { parseMarkdown } from '../../src/core/markdown-parser.js';

function parse(content: string) {
  return parseMarkdown('impl.md', content);
}

const FULL_IMPL = `
# Implementation: Test

## Behaviour
../usecase.md

## Design Decisions
- Used X because Y

## Source Files
- \`src/auth/login.ts\` — login handler
- \`src/auth/session.ts\` — session management

## Commits
- \`abc1234567890abc1234567890abc123456789ab\` — Add login
- \`def5678\` — Fix session bug

## Tests
- \`test/auth/login.test.ts\` — covers main flow and errors

## Status
- **State:** complete
- **Created:** 2024-01-01
- **Last verified:** 2024-01-01

## Notes
none
`.trim();

describe('parseImplData', () => {
  it('extracts behaviour reference', () => {
    const data = parseImplData(parse(FULL_IMPL));
    expect(data.behaviourRef).toBe('../usecase.md');
  });

  it('extracts source file paths', () => {
    const data = parseImplData(parse(FULL_IMPL));
    expect(data.sourceFiles).toContain('src/auth/login.ts');
    expect(data.sourceFiles).toContain('src/auth/session.ts');
  });

  it('extracts commit hashes (full and short)', () => {
    const data = parseImplData(parse(FULL_IMPL));
    expect(data.commits).toContain('abc1234567890abc1234567890abc123456789ab');
    expect(data.commits).toContain('def5678');
  });

  it('extracts test file paths', () => {
    const data = parseImplData(parse(FULL_IMPL));
    expect(data.testFiles).toContain('test/auth/login.test.ts');
  });

  it('returns empty arrays when sections are missing', () => {
    const doc = parse('## Status\n- **State:** complete\n');
    const data = parseImplData(doc);
    expect(data.behaviourRef).toBeNull();
    expect(data.sourceFiles).toHaveLength(0);
    expect(data.commits).toHaveLength(0);
    expect(data.testFiles).toHaveLength(0);
  });

  it('returns null behaviourRef when Behaviour section is empty', () => {
    const doc = parse('## Behaviour\n\n## Status\n- **State:** complete\n');
    const data = parseImplData(doc);
    expect(data.behaviourRef).toBeNull();
  });

  it('does not include non-hash values in commits', () => {
    const doc = parse('## Commits\n- `not-a-hash` — thing\n- `abc123` — real\n');
    const data = parseImplData(doc);
    expect(data.commits).not.toContain('not-a-hash');
    expect(data.commits).toContain('abc123');
  });
});
