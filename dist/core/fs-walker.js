import { readdirSync, statSync } from 'fs';
import { join, relative, basename } from 'path';
const MARKER_FILES = {
    'intent.md': 'intent',
    'usecase.md': 'behaviour',
    'impl.md': 'impl',
};
const DEFAULT_EXCLUDE = new Set(['_brainstorms', 'skills', '.git', 'node_modules', 'dist', 'global-truths']);
export function walkHierarchy(rootPath, options = {}) {
    const excludeDirs = options.excludeDirs ?? DEFAULT_EXCLUDE;
    return walkDir(rootPath, rootPath, null, 0, excludeDirs);
}
function walkDir(dirPath, rootPath, parent, depth, excludeDirs) {
    let entries;
    try {
        entries = readdirSync(dirPath);
    }
    catch {
        entries = [];
    }
    const markerFiles = [];
    const subdirs = [];
    for (const entry of entries) {
        if (MARKER_FILES[entry]) {
            markerFiles.push(entry);
        }
        try {
            const fullPath = join(dirPath, entry);
            if (statSync(fullPath).isDirectory() && !excludeDirs.has(entry)) {
                subdirs.push(entry);
            }
        }
        catch {
            // skip unreadable entries
        }
    }
    const node = {
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
export function flattenTree(root) {
    const result = [];
    const stack = [root];
    while (stack.length > 0) {
        const node = stack.pop();
        result.push(node);
        for (const child of [...node.children].reverse()) {
            stack.push(child);
        }
    }
    return result;
}
//# sourceMappingURL=fs-walker.js.map