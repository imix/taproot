import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';

/** Dirs excluded from link-file scans (subset of fs-walker's DEFAULT_EXCLUDE — link files live inside specs/ and global-truths/) */
const LINK_SCAN_EXCLUDE = new Set(['.git', 'node_modules', 'dist', '.taproot', 'agent', 'skills']);

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
export function parseLinkFile(content: string): ParsedLinkFile {
  const field = (name: string): string | null => {
    const m = new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+)`).exec(content);
    return m ? m[1]!.trim() : null;
  };
  return {
    repo: field('Repo'),
    path: field('Path'),
    type: field('Type'),
  };
}

/**
 * Find all link files (link.md or *-link.md) under a directory tree.
 */
export function findLinkFiles(rootPath: string): string[] {
  const results: string[] = [];
  function walk(dir: string): void {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          if (!LINK_SCAN_EXCLUDE.has(entry)) walk(fullPath);
        } else if (entry === 'link.md' || entry.endsWith('-link.md')) {
          results.push(fullPath);
        }
      } catch {
        // skip unreadable
      }
    }
  }
  walk(rootPath);
  return results;
}

/**
 * Load .taproot/repos.yaml from the project root.
 * Returns null if the file does not exist.
 * Returns a map of repo URL → local absolute path.
 */
export function loadReposYaml(projectRoot: string): Map<string, string> | null {
  const reposPath = join(projectRoot, '.taproot', 'repos.yaml');
  if (!existsSync(reposPath)) return null;
  try {
    const content = readFileSync(reposPath, 'utf-8');
    const raw = yaml.load(content);
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return new Map();
    const map = new Map<string, string>();
    for (const [url, localPath] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof localPath === 'string') {
        // 'offline' is a sentinel — do not resolve as a filesystem path
        map.set(url.trim(), localPath.trim() === 'offline' ? 'offline' : resolve(projectRoot, localPath));
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

/**
 * Resolve a link target to an absolute local path.
 * Returns null if the repo URL is not mapped in repos.yaml.
 */
export function resolveLinkTarget(
  repo: string,
  targetPath: string,
  reposMap: Map<string, string>
): string | null {
  const repoRoot = reposMap.get(repo.trim());
  if (!repoRoot || repoRoot === 'offline') return null;
  return join(repoRoot, targetPath);
}

/** Returns true if the given repo URL is explicitly marked offline in the repos map. */
export function isOfflineRepo(repo: string, reposMap: Map<string, string>): boolean {
  return reposMap.get(repo.trim()) === 'offline';
}
