export interface LinkFile {
    /** Absolute path to the link.md file */
    filePath: string;
    /** GitHub repo URL (from **Repo:** field) */
    repo: string;
    /** Relative path to target spec within the source repo (from **Path:** field) */
    path: string;
    /** Link type: intent | behaviour | truth (from **Type:** field) */
    type: string;
}
export interface ParsedLinkFile {
    repo: string | null;
    path: string | null;
    type: string | null;
}
/**
 * Parse a link.md file and extract Repo, Path, Type fields.
 * Returns null values for any field not found.
 */
export declare function parseLinkFile(content: string): ParsedLinkFile;
/**
 * Find all link files (link.md or *-link.md) under a directory tree.
 */
export declare function findLinkFiles(rootPath: string): string[];
/**
 * Load .taproot/repos.yaml from the project root.
 * Returns null if the file does not exist.
 * Returns a map of repo URL → local absolute path.
 */
export declare function loadReposYaml(projectRoot: string): Map<string, string> | null;
/**
 * Resolve a link target to an absolute local path.
 * Returns null if the repo URL is not mapped in repos.yaml.
 */
export declare function resolveLinkTarget(repo: string, targetPath: string, reposMap: Map<string, string>): string | null;
/** Returns true if the given repo URL is explicitly marked offline in the repos map. */
export declare function isOfflineRepo(repo: string, reposMap: Map<string, string>): boolean;
