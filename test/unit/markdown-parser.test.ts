import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../../src/core/markdown-parser.js';

describe('parseMarkdown', () => {
  it('extracts sections by ## headings', () => {
    const content = `# Title\n\n## Goal\nsome goal text\n\n## Status\n- **State:** draft\n`;
    const doc = parseMarkdown('test.md', content);
    expect(doc.sections.has('goal')).toBe(true);
    expect(doc.sections.has('status')).toBe(true);
  });

  it('stores section keys in lowercase', () => {
    const content = `## Success Criteria\n- [ ] thing\n`;
    const doc = parseMarkdown('test.md', content);
    expect(doc.sections.has('success criteria')).toBe(true);
    expect(doc.sections.has('Success Criteria')).toBe(false);
  });

  it('captures body lines correctly', () => {
    const content = `## Goal\nline one\nline two\n\n## Other\nstuff\n`;
    const doc = parseMarkdown('test.md', content);
    const goal = doc.sections.get('goal');
    expect(goal?.bodyLines).toContain('line one');
    expect(goal?.bodyLines).toContain('line two');
  });

  it('records start line as 1-indexed heading line', () => {
    const content = `# Title\n\n## Goal\ntext\n`;
    const doc = parseMarkdown('test.md', content);
    const goal = doc.sections.get('goal');
    expect(goal?.startLine).toBe(3); // line 3 (1-indexed)
  });

  it('ignores ### and deeper headings (treats as body)', () => {
    const content = `## Alternate Flows\n### Sub Flow\nsome steps\n`;
    const doc = parseMarkdown('test.md', content);
    expect(doc.sections.has('alternate flows')).toBe(true);
    expect(doc.sections.has('sub flow')).toBe(false);
    const af = doc.sections.get('alternate flows');
    expect(af?.rawBody).toContain('### Sub Flow');
  });

  it('returns empty sections map for content with no ## headings', () => {
    const content = `# Title\nsome text\n`;
    const doc = parseMarkdown('test.md', content);
    expect(doc.sections.size).toBe(0);
  });

  it('preserves rawLines', () => {
    const content = `line1\nline2\nline3`;
    const doc = parseMarkdown('test.md', content);
    expect(doc.rawLines).toEqual(['line1', 'line2', 'line3']);
  });
});
