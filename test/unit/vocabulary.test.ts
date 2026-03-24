import { describe, it, expect } from 'vitest';
import { applyVocabulary } from '../../src/core/language.js';

describe('applyVocabulary', () => {
  const structuralKeys = ['Actor', 'Goal', 'Status', 'Given', 'When', 'Then', 'Main Flow', 'Acceptance Criteria'];

  it('replaces a token with the configured override', () => {
    const { result, warnings } = applyVocabulary(
      'Write tests and review source files',
      { tests: 'manuscript reviews', 'source files': 'chapters' },
      structuralKeys,
    );
    expect(result).toBe('Write manuscript reviews and review chapters');
    expect(warnings).toHaveLength(0);
  });

  it('is single-pass — substituted text is not re-scanned', () => {
    // 'tests' → 'manuscript reviews'; if re-scanned, 'reviews' → 'approvals' would trigger
    const { result } = applyVocabulary(
      'run tests here',
      { tests: 'manuscript reviews', reviews: 'approvals' },
      structuralKeys,
    );
    // 'tests' → 'manuscript reviews' (first pass placeholder)
    // 'reviews' in 'manuscript reviews' must NOT be re-matched
    expect(result).toBe('run manuscript reviews here');
  });

  it('is declaration-order — not length-sorted', () => {
    // 'source' is processed before 'source files' due to declaration order
    const content = 'edit source files now';
    const { result } = applyVocabulary(
      content,
      { source: 'chapter', 'source files': 'documents' },
      structuralKeys,
    );
    // 'source' replaced first → 'edit chapter files now'
    // then 'source files' no longer matches → 'edit chapter files now'
    expect(result).toBe('edit chapter files now');
  });

  it('warns and skips keys that conflict with structural keywords (case-insensitive)', () => {
    const { result, warnings } = applyVocabulary(
      'check the Status field',
      { Status: 'Phase', tests: 'reviews' },
      structuralKeys,
    );
    // 'Status' conflict → skipped; 'tests' not in content → unchanged
    expect(result).toBe('check the Status field');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("'Status'");
    expect(warnings[0]).toContain('structural keyword');
  });

  it('skips conflicting key but applies non-conflicting overrides', () => {
    const { result, warnings } = applyVocabulary(
      'check Given tests',
      { Given: 'Provided', tests: 'reviews' },
      structuralKeys,
    );
    expect(result).toBe('check Given reviews');
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("'Given'");
  });

  it('returns content unchanged for empty vocab object', () => {
    const content = 'run tests here';
    const { result, warnings } = applyVocabulary(content, {}, structuralKeys);
    expect(result).toBe(content);
    expect(warnings).toHaveLength(0);
  });

  it('is case-sensitive — does not match different case', () => {
    const { result } = applyVocabulary(
      'Run Tests and tests',
      { tests: 'reviews' },
      structuralKeys,
    );
    // 'Tests' (capital T) should not be replaced; 'tests' should be
    expect(result).toBe('Run Tests and reviews');
  });

  it('handles multiple occurrences of the same key', () => {
    const { result } = applyVocabulary(
      'tests tests tests',
      { tests: 'reviews' },
      structuralKeys,
    );
    expect(result).toBe('reviews reviews reviews');
  });

  it('returns content unchanged when no vocab key appears in content', () => {
    const content = 'no matching tokens here';
    const { result } = applyVocabulary(content, { tests: 'reviews' }, structuralKeys);
    expect(result).toBe(content);
  });

  it('handles empty structural keys list (no language pack)', () => {
    const { result, warnings } = applyVocabulary(
      'check the Status field',
      { Status: 'Phase' },
      [],
    );
    // No structural keys → no conflicts → Status is replaced
    expect(result).toBe('check the Phase field');
    expect(warnings).toHaveLength(0);
  });
});
