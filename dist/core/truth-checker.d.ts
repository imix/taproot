export type TruthScope = 'intent' | 'behaviour' | 'impl';
export type DocLevel = 'intent' | 'behaviour' | 'impl';
export interface TruthFile {
    relPath: string;
    scope: TruthScope;
    ambiguous: boolean;
    unreadable: boolean;
    content: string;
    /** True if this truth was resolved from a cross-repo link file */
    linked?: boolean;
    /** For linked truths: the link file path (relative to cwd) */
    linkPath?: string;
    /** For linked truths that could not be resolved */
    unresolvable?: boolean;
}
/**
 * Determine scope from a path relative to the global-truths directory.
 * Sub-folder takes precedence over suffix when they conflict (most restrictive wins).
 */
export declare function resolveTruthScope(relFromGT: string): {
    scope: TruthScope;
    ambiguous: boolean;
};
/** Does a truth at scope X apply to a document at level Y? */
export declare function scopeAppliesTo(truthScope: TruthScope, docLevel: DocLevel): boolean;
/** Returns the absolute path to global-truths/, or null if it doesn't exist. */
export declare function globalTruthsDir(cwd: string): string | null;
/** Get hierarchy level of a file based on its filename. */
export declare function docLevelFromFilename(filename: string): DocLevel | null;
/** Collect all truth files applicable to the given document level. Skips README.md. */
export declare function collectApplicableTruths(cwd: string, docLevel: DocLevel): TruthFile[];
/**
 * Write a truth-check session marker after the agent has approved the truth check.
 * Called by `taproot truth-sign`.
 */
export declare function writeTruthSession(cwd: string, stagedDocs: Array<{
    path: string;
    content: string;
}>, truths: TruthFile[]): void;
export interface SessionValidation {
    valid: boolean;
    reason: string;
}
/**
 * Validate that a truth-check session exists and matches the current staging state.
 * Called by the pre-commit hook.
 */
export declare function validateTruthSession(cwd: string, stagedDocs: Array<{
    path: string;
    content: string;
}>, truths: TruthFile[]): SessionValidation;
