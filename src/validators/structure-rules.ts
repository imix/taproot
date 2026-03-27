import { join } from 'path';
import { existsSync } from 'fs';
import type { FolderNode, Violation } from './types.js';
import { flattenTree } from '../core/fs-walker.js';

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function checkDuplicateMarkers(node: FolderNode): Violation[] {
  if (node.markerFiles.length <= 1) return [];
  return [{
    type: 'error',
    filePath: node.absolutePath,
    code: 'DUPLICATE_MARKERS',
    message: `Folder contains multiple marker files: ${node.markerFiles.join(', ')}`,
  }];
}

export function checkKebabCase(node: FolderNode): Violation[] {
  if (KEBAB_CASE.test(node.name)) return [];
  return [{
    type: 'error',
    filePath: node.absolutePath,
    code: 'INVALID_FOLDER_NAME',
    message: `Folder name "${node.name}" does not match kebab-case pattern (^[a-z0-9]+(-[a-z0-9]+)*$)`,
  }];
}

export function checkBehaviourParent(node: FolderNode): Violation[] {
  if (node.marker !== 'behaviour') return [];
  const parentMarker = node.parent?.marker ?? null;
  if (parentMarker === 'intent' || parentMarker === 'behaviour') return [];
  return [{
    type: 'error',
    filePath: join(node.absolutePath, 'usecase.md'),
    code: 'BEHAVIOUR_PARENT_INVALID',
    message: `Behaviour folder "${node.name}" must be a child of an intent or behaviour folder, but parent is ${parentMarker === null ? 'the root or an unmarked folder' : `a "${parentMarker}" folder`}`,
  }];
}

export function checkImplParent(node: FolderNode): Violation[] {
  if (node.marker !== 'impl') return [];
  if (node.parent?.marker === 'behaviour') return [];
  return [{
    type: 'error',
    filePath: join(node.absolutePath, 'impl.md'),
    code: 'IMPL_PARENT_INVALID',
    message: `Implementation folder "${node.name}" must be a child of a behaviour folder, but parent is ${node.parent?.marker === null ? 'an unmarked folder' : `a "${node.parent?.marker ?? 'root'}" folder`}`,
  }];
}

export function checkOrphanFolder(node: FolderNode): Violation[] {
  if (node.marker !== null) return [];
  if (node.hasDescendantWithMarker) return [];
  // The taproot root itself (depth 0) is allowed to be empty initially
  if (node.depth === 0) return [];
  return [{
    type: 'error',
    filePath: node.absolutePath,
    code: 'ORPHAN_FOLDER',
    message: `Folder "${node.name}" contains no marker file and has no descendant with a marker file`,
  }];
}

export function checkEmptyFolder(node: FolderNode): Violation[] {
  if (node.marker === null) return [];
  if (node.children.length > 0) return [];
  // impl folders are leaf nodes by design — not empty warnings
  if (node.marker === 'impl') return [];
  return [{
    type: 'warning',
    filePath: node.absolutePath,
    code: 'EMPTY_FOLDER',
    message: `${node.marker} folder "${node.name}" has no child folders`,
  }];
}

export function checkGlobalTruthsIntent(root: FolderNode): Violation[] {
  const globalTruthsIntentPath = join(root.absolutePath, 'global-truths', 'intent.md');
  if (!existsSync(globalTruthsIntentPath)) return [];
  return [{
    type: 'warning',
    filePath: globalTruthsIntentPath,
    code: 'GLOBAL_TRUTHS_INTENT_CONFLICT',
    message: '`global-truths/` is a taproot-managed truth store — `intent.md` does not belong here. ' +
      'Remove `global-truths/intent.md` (and any behaviours beneath it) and use truth files + ' +
      '`check-if-affected-by` entries in `.taproot/settings.yaml` to enforce them instead.',
  }];
}

export function validateStructure(
  root: FolderNode,
  options: { strict: boolean }
): Violation[] {
  const violations: Violation[] = [];
  const nodes = flattenTree(root);

  violations.push(...checkGlobalTruthsIntent(root));

  for (const node of nodes) {
    violations.push(...checkDuplicateMarkers(node));
    if (node !== root) violations.push(...checkKebabCase(node));
    violations.push(...checkBehaviourParent(node));
    violations.push(...checkImplParent(node));
    violations.push(...checkOrphanFolder(node));
    if (options.strict) violations.push(...checkEmptyFolder(node));
  }

  return violations;
}
