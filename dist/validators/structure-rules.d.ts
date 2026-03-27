import type { FolderNode, Violation } from './types.js';
export declare function checkDuplicateMarkers(node: FolderNode): Violation[];
export declare function checkKebabCase(node: FolderNode): Violation[];
export declare function checkBehaviourParent(node: FolderNode): Violation[];
export declare function checkImplParent(node: FolderNode): Violation[];
export declare function checkOrphanFolder(node: FolderNode): Violation[];
export declare function checkEmptyFolder(node: FolderNode): Violation[];
export declare function checkGlobalTruthsIntent(root: FolderNode): Violation[];
export declare function validateStructure(root: FolderNode, options: {
    strict: boolean;
}): Violation[];
