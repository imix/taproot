import { readFileSync, writeFileSync } from 'fs';
import { join, relative, resolve } from 'path';
import { loadConfig } from '../core/config.js';
import { walkHierarchy, flattenTree } from '../core/fs-walker.js';
import { parseMarkdown } from '../core/markdown-parser.js';
import { parseImplData } from '../core/impl-reader.js';
import { gitLog, extractTaprootPath, isGitRepo, getRepoRoot } from '../core/git.js';
export function registerLinkCommits(program) {
    program
        .command('link-commits')
        .description('Update impl.md files with commit references from git history')
        .option('--since <date|hash>', 'Only scan commits after this date or hash')
        .option('--dry-run', 'Preview changes without writing')
        .option('--path <path>', 'Root path (overrides config)')
        .action(async (options) => {
        const results = await runLinkCommits({
            since: options.since,
            dryRun: options.dryRun ?? false,
            path: options.path,
        });
        if (results.length === 0) {
            process.stdout.write('No new commits to link.\n');
        }
        else {
            for (const r of results) {
                const verb = options.dryRun ? 'would add' : 'added';
                process.stdout.write(`${r.implPath}: ${verb} ${r.addedHashes.join(', ')}\n`);
            }
        }
    });
}
export async function runLinkCommits(options) {
    const { config, configDir } = loadConfig(options.cwd);
    const rootPath = options.path ? resolve(options.path) : config.root;
    const cwd = options.cwd ?? process.cwd();
    if (!isGitRepo(cwd)) {
        throw new Error('Not inside a git repository. link-commits requires git.');
    }
    const repoRoot = getRepoRoot(cwd) ?? cwd;
    // Build map: taproot-relative path → impl node
    const tree = walkHierarchy(rootPath);
    const implNodes = flattenTree(tree).filter((n) => n.marker === 'impl');
    // Read existing commits for each impl
    const implIndex = new Map();
    for (const node of implNodes) {
        const filePath = join(node.absolutePath, 'impl.md');
        try {
            const content = readFileSync(filePath, 'utf-8');
            const doc = parseMarkdown(filePath, content);
            const data = parseImplData(doc);
            // Index by relative path from repo root (normalized, no trailing slash)
            const relFromRoot = relative(repoRoot, node.absolutePath).replace(/\\/g, '/');
            implIndex.set(relFromRoot, { node, existingHashes: new Set(data.commits) });
        }
        catch {
            // skip unreadable impl.md
        }
    }
    // Also index by relative path from taproot root for flexible matching
    const implIndexFromTaproot = new Map(); // taproot-relative → repoRoot-relative
    for (const node of implNodes) {
        const relFromTaproot = node.relativePath.replace(/\\/g, '/');
        const relFromRoot = relative(repoRoot, node.absolutePath).replace(/\\/g, '/');
        implIndexFromTaproot.set(relFromTaproot, relFromRoot);
    }
    // Scan git log
    const commits = gitLog({ since: options.since, cwd: repoRoot });
    // Collect new commits per impl
    const pendingAdditions = new Map(); // repoRoot-relative → new hashes
    for (const commit of commits) {
        const taprootPath = extractTaprootPath(commit, config.commitPattern, config.commitTrailer);
        if (!taprootPath)
            continue;
        // Try matching as repoRoot-relative path first, then taproot-relative
        let key = taprootPath;
        if (!implIndex.has(key)) {
            const mapped = implIndexFromTaproot.get(key);
            if (mapped)
                key = mapped;
        }
        const entry = implIndex.get(key);
        if (!entry)
            continue;
        if (entry.existingHashes.has(commit.hash) || entry.existingHashes.has(commit.hash.slice(0, 7)))
            continue;
        const list = pendingAdditions.get(key) ?? [];
        list.push(commit.hash);
        pendingAdditions.set(key, list);
    }
    const results = [];
    for (const [key, hashes] of pendingAdditions) {
        const entry = implIndex.get(key);
        if (!entry)
            continue;
        const filePath = join(entry.node.absolutePath, 'impl.md');
        results.push({ implPath: filePath, addedHashes: hashes });
        if (!options.dryRun) {
            const content = readFileSync(filePath, 'utf-8');
            const updated = appendCommitsToImplMd(content, hashes);
            writeFileSync(filePath, updated, 'utf-8');
        }
    }
    return results;
}
function appendCommitsToImplMd(content, hashes) {
    const lines = content.split('\n');
    const commitsHeading = lines.findIndex(l => /^##\s+Commits\s*$/.test(l));
    if (commitsHeading === -1) {
        // Append Commits section at end
        const additions = hashes.map(h => `- \`${h}\` — (auto-linked by taproot link-commits)`);
        return content.trimEnd() + '\n\n## Commits\n' + additions.join('\n') + '\n';
    }
    // Find last non-empty line in the Commits section (before next ## or EOF)
    let insertAt = commitsHeading + 1;
    for (let i = commitsHeading + 1; i < lines.length; i++) {
        const line = lines[i] ?? '';
        if (/^##\s/.test(line))
            break;
        if (line.trim())
            insertAt = i + 1;
    }
    const newLines = hashes.map(h => `- \`${h}\` — (auto-linked by taproot link-commits)`);
    lines.splice(insertAt, 0, ...newLines);
    return lines.join('\n');
}
//# sourceMappingURL=link-commits.js.map