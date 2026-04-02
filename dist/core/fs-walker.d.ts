import type { FolderNode } from '../validators/types.js';
/** Directories excluded from hierarchy walks and link-file scans. */
export declare const DEFAULT_EXCLUDE: Set<string>;
export declare function walkHierarchy(rootPath: string, options?: {
    excludeDirs?: Set<string>;
}): FolderNode;
export declare function flattenTree(root: FolderNode): FolderNode[];
