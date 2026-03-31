import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';
/**
 * Parse a link.md file and extract Repo, Path, Type fields.
 * Returns null values for any field not found.
 */
export function parseLinkFile(content) {
    const field = (name) => {
        const m = new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+)`).exec(content);
        return m ? m[1].trim() : null;
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
export function findLinkFiles(rootPath) {
    const results = [];
    function walk(dir) {
        let entries;
        try {
            entries = readdirSync(dir);
        }
        catch {
            return;
        }
        for (const entry of entries) {
            const fullPath = join(dir, entry);
            try {
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    const excluded = new Set(['.git', 'node_modules', 'dist', '.taproot']);
                    if (!excluded.has(entry))
                        walk(fullPath);
                }
                else if (entry === 'link.md' || entry.endsWith('-link.md')) {
                    results.push(fullPath);
                }
            }
            catch {
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
export function loadReposYaml(projectRoot) {
    const reposPath = join(projectRoot, '.taproot', 'repos.yaml');
    if (!existsSync(reposPath))
        return null;
    try {
        const content = readFileSync(reposPath, 'utf-8');
        const raw = yaml.load(content);
        if (typeof raw !== 'object' || raw === null || Array.isArray(raw))
            return new Map();
        const map = new Map();
        for (const [url, localPath] of Object.entries(raw)) {
            if (typeof localPath === 'string') {
                map.set(url.trim(), resolve(projectRoot, localPath));
            }
        }
        return map;
    }
    catch {
        return new Map();
    }
}
/**
 * Resolve a link target to an absolute local path.
 * Returns null if the repo URL is not mapped in repos.yaml.
 */
export function resolveLinkTarget(repo, targetPath, reposMap) {
    const repoRoot = reposMap.get(repo.trim());
    if (!repoRoot)
        return null;
    return join(repoRoot, targetPath);
}
//# sourceMappingURL=link-parser.js.map