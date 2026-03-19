import { readdirSync, statSync } from 'fs';
import { join, relative, basename } from 'path';
import type { FolderNode, MarkerType } from '../validators/types.js';

const MARKER_FILES: Record<string, MarkerType> = {
  'intent.md': 'intent',
  'usecase.md': 'behaviour',
  'impl.md': 'impl',
};

const DEFAULT_EXCLUDE = new Set(['_brainstorms', 'skills', '.git', 'node_modules', 'dist']);

export function walkHierarchy(
  rootPath: string,
  options: { excludeDirs?: Set<string> } = {}
): FolderNode {
  const excludeDirs = options.excludeDirs ?? DEFAULT_EXCLUDE;
  return walkDir(rootPath, rootPath, null, 0, excludeDirs);
}

function walkDir(
  dirPath: string,
  rootPath: string,
  parent: FolderNode | null,
  depth: number,
  excludeDirs: Set<string>
): FolderNode {
  let entries: string[];
  try {
    entries = readdirSync(dirPath);
  } catch {
    entries = [];
  }

  const markerFiles: string[] = [];
  const subdirs: string[] = [];

  for (const entry of entries) {
    if (MARKER_FILES[entry]) {
      markerFiles.push(entry);
    }
    try {
      const fullPath = join(dirPath, entry);
      if (statSync(fullPath).isDirectory() && !excludeDirs.has(entry)) {
        subdirs.push(entry);
      }
    } catch {
      // skip unreadable entries
    }
  }

  const node: FolderNode = {
    absolutePath: dirPath,
    relativePath: relative(rootPath, dirPath) || '.',
    name: basename(dirPath),
    marker: null,
    markerFiles,
    children: [],
    parent,
    depth,
    hasDescendantWithMarker: false,
  };

  // Determine marker (first found wins; duplicates are reported as violations)
  if (markerFiles.length > 0) {
    node.marker = MARKER_FILES[markerFiles[0] ?? ''] ?? null;
  }

  // Recurse into subdirectories (post-order: children first)
  for (const subdir of subdirs.sort()) {
    const child = walkDir(join(dirPath, subdir), rootPath, node, depth + 1, excludeDirs);
    node.children.push(child);
    if (child.marker !== null || child.hasDescendantWithMarker) {
      node.hasDescendantWithMarker = true;
    }
  }

  return node;
}

export function flattenTree(root: FolderNode): FolderNode[] {
  const result: FolderNode[] = [];
  const stack: FolderNode[] = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    result.push(node);
    for (const child of [...node.children].reverse()) {
      stack.push(child);
    }
  }
  return result;
}
