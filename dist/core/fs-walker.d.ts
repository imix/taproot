import type { FolderNode } from '../validators/types.js';
export declare function walkHierarchy(rootPath: string, options?: {
    excludeDirs?: Set<string>;
}): FolderNode;
export declare function flattenTree(root: FolderNode): FolderNode[];
