import { spawnSync } from 'child_process';
import { statSync } from 'fs';
function git(args, cwd) {
    const result = spawnSync('git', args, { cwd, encoding: 'utf-8' });
    return {
        stdout: result.stdout?.trim() ?? '',
        ok: result.status === 0,
    };
}
export function isGitRepo(cwd) {
    return git(['rev-parse', '--git-dir'], cwd).ok;
}
export function getRepoRoot(cwd) {
    const r = git(['rev-parse', '--show-toplevel'], cwd);
    return r.ok ? r.stdout : null;
}
export function gitLog(options) {
    const args = ['log', '--format=%H%x00%s%x00%b%x00%aI%x00---COMMIT---'];
    if (options.since)
        args.push(`--since=${options.since}`);
    const { stdout, ok } = git(args, options.cwd);
    if (!ok || !stdout)
        return [];
    return stdout
        .split('---COMMIT---')
        .map(s => s.trim())
        .filter(Boolean)
        .map(block => {
        const parts = block.split('\x00');
        return {
            hash: (parts[0] ?? '').trim(),
            subject: (parts[1] ?? '').trim(),
            body: (parts[2] ?? '').trim(),
            date: (parts[3] ?? '').trim(),
        };
    })
        .filter(c => c.hash.length === 40);
}
export function commitExists(hash, cwd) {
    return git(['cat-file', '-e', `${hash}^{commit}`], cwd).ok;
}
/** Returns the date of the last commit that touched this file, or null. */
export function fileLastCommitDate(filePath, cwd) {
    const r = git(['log', '-1', '--format=%aI', '--', filePath], cwd);
    if (!r.ok || !r.stdout)
        return null;
    const d = new Date(r.stdout);
    return isNaN(d.getTime()) ? null : d;
}
/** Returns the filesystem mtime of a file, or null if it doesn't exist. */
export function fileMtime(filePath) {
    try {
        return statSync(filePath).mtime;
    }
    catch {
        return null;
    }
}
/**
 * Parse a commit looking for a taproot path reference.
 * Supports:
 *   Subject: taproot(some/path): message
 *   Body trailer: Taproot: some/path
 */
export function extractTaprootPath(commit, commitPattern, trailerKey) {
    const subjectRegex = new RegExp(commitPattern);
    const subjectMatch = subjectRegex.exec(commit.subject);
    if (subjectMatch?.[1])
        return subjectMatch[1].trim();
    const trailerRegex = new RegExp(`^${trailerKey}:\\s*(.+)$`, 'm');
    const trailerMatch = trailerRegex.exec(commit.body);
    if (trailerMatch?.[1])
        return trailerMatch[1].trim();
    return null;
}
//# sourceMappingURL=git.js.map