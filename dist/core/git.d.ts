export interface GitCommit {
    hash: string;
    subject: string;
    body: string;
    date: string;
}
export declare function isGitRepo(cwd: string): boolean;
export declare function getRepoRoot(cwd: string): string | null;
export declare function gitLog(options: {
    since?: string;
    cwd: string;
}): GitCommit[];
export declare function commitExists(hash: string, cwd: string): boolean;
/** Returns the date of the last commit that touched this file, or null. */
export declare function fileLastCommitDate(filePath: string, cwd: string): Date | null;
/** Returns the filesystem mtime of a file, or null if it doesn't exist. */
export declare function fileMtime(filePath: string): Date | null;
/**
 * Parse a commit looking for a taproot path reference.
 * Supports:
 *   Subject: taproot(some/path): message
 *   Body trailer: Taproot: some/path
 */
export declare function extractTaprootPath(commit: GitCommit, commitPattern: string, trailerKey: string): string | null;
