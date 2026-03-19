import { describe, it, expect } from 'vitest';
import {
  checkDuplicateMarkers,
  checkKebabCase,
  checkBehaviourParent,
  checkImplParent,
  checkOrphanFolder,
} from '../../src/validators/structure-rules.js';
import type { FolderNode } from '../../src/validators/types.js';

function buildNode(overrides: Partial<FolderNode> & { marker?: FolderNode['marker'] }): FolderNode {
  return {
    absolutePath: '/taproot/test-folder',
    relativePath: 'test-folder',
    name: 'test-folder',
    marker: null,
    markerFiles: [],
    children: [],
    parent: null,
    depth: 1,
    hasDescendantWithMarker: false,
    ...overrides,
  };
}

describe('checkDuplicateMarkers', () => {
  it('returns no violation for zero or one marker file', () => {
    expect(checkDuplicateMarkers(buildNode({ markerFiles: [] }))).toHaveLength(0);
    expect(checkDuplicateMarkers(buildNode({ markerFiles: ['intent.md'] }))).toHaveLength(0);
  });

  it('returns DUPLICATE_MARKERS violation for multiple marker files', () => {
    const v = checkDuplicateMarkers(buildNode({ markerFiles: ['intent.md', 'usecase.md'] }));
    expect(v).toHaveLength(1);
    expect(v[0]?.code).toBe('DUPLICATE_MARKERS');
  });
});

describe('checkKebabCase', () => {
  it('passes valid kebab-case names', () => {
    expect(checkKebabCase(buildNode({ name: 'user-onboarding' }))).toHaveLength(0);
    expect(checkKebabCase(buildNode({ name: 'abc' }))).toHaveLength(0);
    expect(checkKebabCase(buildNode({ name: 'a1-b2-c3' }))).toHaveLength(0);
  });

  it('fails CamelCase', () => {
    const v = checkKebabCase(buildNode({ name: 'UserOnboarding' }));
    expect(v[0]?.code).toBe('INVALID_FOLDER_NAME');
  });

  it('fails names with underscores', () => {
    const v = checkKebabCase(buildNode({ name: 'user_onboarding' }));
    expect(v[0]?.code).toBe('INVALID_FOLDER_NAME');
  });

  it('fails names with spaces', () => {
    const v = checkKebabCase(buildNode({ name: 'user onboarding' }));
    expect(v[0]?.code).toBe('INVALID_FOLDER_NAME');
  });
});

describe('checkBehaviourParent', () => {
  it('passes when parent is intent', () => {
    const parent = buildNode({ marker: 'intent' });
    const child = buildNode({ marker: 'behaviour', parent });
    expect(checkBehaviourParent(child)).toHaveLength(0);
  });

  it('passes when parent is behaviour (sub-behaviour)', () => {
    const parent = buildNode({ marker: 'behaviour' });
    const child = buildNode({ marker: 'behaviour', parent });
    expect(checkBehaviourParent(child)).toHaveLength(0);
  });

  it('fails when parent is impl', () => {
    const parent = buildNode({ marker: 'impl' });
    const child = buildNode({ marker: 'behaviour', parent });
    const v = checkBehaviourParent(child);
    expect(v[0]?.code).toBe('BEHAVIOUR_PARENT_INVALID');
  });

  it('fails when parent is null (root level)', () => {
    const child = buildNode({ marker: 'behaviour', parent: null });
    const v = checkBehaviourParent(child);
    expect(v[0]?.code).toBe('BEHAVIOUR_PARENT_INVALID');
  });

  it('returns nothing for non-behaviour nodes', () => {
    expect(checkBehaviourParent(buildNode({ marker: 'intent' }))).toHaveLength(0);
    expect(checkBehaviourParent(buildNode({ marker: 'impl' }))).toHaveLength(0);
    expect(checkBehaviourParent(buildNode({ marker: null }))).toHaveLength(0);
  });
});

describe('checkImplParent', () => {
  it('passes when parent is behaviour', () => {
    const parent = buildNode({ marker: 'behaviour' });
    const child = buildNode({ marker: 'impl', parent });
    expect(checkImplParent(child)).toHaveLength(0);
  });

  it('fails when parent is intent', () => {
    const parent = buildNode({ marker: 'intent' });
    const child = buildNode({ marker: 'impl', parent });
    const v = checkImplParent(child);
    expect(v[0]?.code).toBe('IMPL_PARENT_INVALID');
  });

  it('fails when parent is null', () => {
    const v = checkImplParent(buildNode({ marker: 'impl', parent: null }));
    expect(v[0]?.code).toBe('IMPL_PARENT_INVALID');
  });

  it('returns nothing for non-impl nodes', () => {
    expect(checkImplParent(buildNode({ marker: 'intent' }))).toHaveLength(0);
    expect(checkImplParent(buildNode({ marker: 'behaviour' }))).toHaveLength(0);
  });
});

describe('checkOrphanFolder', () => {
  it('returns no violation for marked folders', () => {
    expect(checkOrphanFolder(buildNode({ marker: 'intent' }))).toHaveLength(0);
  });

  it('returns no violation for unmarked folder with marked descendants', () => {
    const node = buildNode({ marker: null, hasDescendantWithMarker: true });
    expect(checkOrphanFolder(node)).toHaveLength(0);
  });

  it('returns ORPHAN_FOLDER for unmarked folder with no descendants', () => {
    const v = checkOrphanFolder(buildNode({ marker: null, hasDescendantWithMarker: false, depth: 1 }));
    expect(v[0]?.code).toBe('ORPHAN_FOLDER');
  });

  it('returns no violation for root (depth 0) even if empty', () => {
    const node = buildNode({ marker: null, hasDescendantWithMarker: false, depth: 0 });
    expect(checkOrphanFolder(node)).toHaveLength(0);
  });
});
