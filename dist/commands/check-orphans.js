import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { loadConfig } from '../core/config.js';
import { walkHierarchy, flattenTree } from '../core/fs-walker.js';
import { parseMarkdown } from '../core/markdown-parser.js';
import { parseImplData } from '../core/impl-reader.js';
import { commitExists, isGitRepo, getRepoRoot } from '../core/git.js';
import { renderViolations, exitCode } from '../core/reporter.js';
import { findLinkFiles, loadReposYaml, parseLinkFile, resolveLinkTarget } from '../core/link-parser.js';
export function registerCheckOrphans(program) {
    program
        .command('check-orphans')
        .description('Find disconnected nodes and broken references in the hierarchy')
        .option('--path <path>', 'Root path (overrides config)')
        .option('--include-unimplemented', 'Also report behaviours with no implementations')
        .action(async (options) => {
        const violations = await runCheckOrphans({
            path: options.path,
            includeUnimplemented: options.includeUnimplemented ?? false,
        });
        process.stdout.write(renderViolations(violations));
        process.exit(exitCode(violations));
    });
}
export async function runCheckOrphans(options) {
    const { config, configDir } = loadConfig(options.cwd);
    const rootPath = options.path ? resolve(options.path) : config.root;
    const cwd = options.cwd ?? process.cwd();
    const repoRoot = isGitRepo(cwd) ? (getRepoRoot(cwd) ?? cwd) : null;
    const projectRoot = repoRoot ?? cwd;
    const tree = walkHierarchy(rootPath);
    const nodes = flattenTree(tree);
    const violations = [];
    for (const node of nodes) {
        if (node.marker === 'impl') {
            violations.push(...checkImplReferences(node, repoRoot));
        }
        if (node.marker === 'behaviour' && options.includeUnimplemented) {
            violations.push(...checkUnimplementedBehaviour(node));
        }
    }
    violations.push(...checkLinkTargets(rootPath, projectRoot));
    return violations;
}
export function checkLinkTargets(rootPath, projectRoot, visited = new Set()) {
    // TAPROOT_OFFLINE skips all link resolution
    if (process.env['TAPROOT_OFFLINE'] === '1') {
        const linkFiles = findLinkFiles(rootPath);
        if (linkFiles.length > 0) {
            return [{
                    type: 'warning',
                    filePath: rootPath,
                    code: 'LINK_VALIDATION_SKIPPED',
                    message: `Link validation skipped (TAPROOT_OFFLINE=1) — ${linkFiles.length} link file(s) not checked`,
                }];
        }
        return [];
    }
    const linkFiles = findLinkFiles(rootPath);
    if (linkFiles.length === 0)
        return [];
    const reposMap = loadReposYaml(projectRoot);
    const violations = [];
    for (const linkFilePath of linkFiles) {
        let content;
        try {
            content = readFileSync(linkFilePath, 'utf-8');
        }
        catch {
            violations.push({ type: 'error', filePath: linkFilePath, code: 'LINK_UNREADABLE', message: 'Could not read link file' });
            continue;
        }
        const parsed = parseLinkFile(content);
        if (!parsed.repo || !parsed.path || !parsed.type) {
            violations.push({
                type: 'error',
                filePath: linkFilePath,
                code: 'LINK_INVALID_FORMAT',
                message: `Link file is missing required fields: ${[!parsed.repo && 'Repo', !parsed.path && 'Path', !parsed.type && 'Type'].filter(Boolean).join(', ')}`,
            });
            continue;
        }
        if (reposMap === null) {
            violations.push({
                type: 'error',
                filePath: linkFilePath,
                code: 'LINK_TARGET_UNRESOLVABLE',
                message: `Cannot resolve link — .taproot/repos.yaml not found. Create this file locally to map repo URLs to local filesystem paths. It must not be committed.`,
            });
            continue;
        }
        const resolvedPath = resolveLinkTarget(parsed.repo, parsed.path, reposMap);
        if (resolvedPath === null) {
            violations.push({
                type: 'error',
                filePath: linkFilePath,
                code: 'LINK_TARGET_UNRESOLVABLE',
                message: `Link target unresolvable — "${parsed.repo}" has no entry in .taproot/repos.yaml`,
            });
            continue;
        }
        // Cycle detection
        if (visited.has(resolvedPath)) {
            violations.push({
                type: 'error',
                filePath: linkFilePath,
                code: 'LINK_CIRCULAR',
                message: `Circular link detected — "${resolvedPath}" has already been visited in this chain`,
            });
            continue;
        }
        if (!existsSync(resolvedPath)) {
            violations.push({
                type: 'error',
                filePath: linkFilePath,
                code: 'LINK_TARGET_MISSING',
                message: `Orphan link: target "${resolvedPath}" not found on disk`,
            });
            continue;
        }
        // Follow one level of transitive links from the source repo (cycle detection)
        const newVisited = new Set(visited);
        newVisited.add(resolvedPath);
        const sourceRepoRoot = reposMap.get(parsed.repo.trim());
        if (sourceRepoRoot && existsSync(sourceRepoRoot)) {
            const transitive = checkLinkTargets(sourceRepoRoot, sourceRepoRoot, newVisited);
            // Only propagate circular violations (not other orphan errors from the source repo)
            violations.push(...transitive.filter(v => v.code === 'LINK_CIRCULAR').map(v => ({
                ...v,
                filePath: linkFilePath,
                message: `Circular link via source repo: ${v.message}`,
            })));
        }
    }
    return violations;
}
function checkImplReferences(node, repoRoot) {
    const filePath = join(node.absolutePath, 'impl.md');
    let content;
    try {
        content = readFileSync(filePath, 'utf-8');
    }
    catch {
        return [{
                type: 'error',
                filePath,
                code: 'UNREADABLE_IMPL',
                message: `Could not read impl.md`,
            }];
    }
    const doc = parseMarkdown(filePath, content);
    const data = parseImplData(doc);
    const violations = [];
    // Skip all reference checks for deferred impls
    const statusSection = doc.sections.get('status');
    const stateMatch = statusSection ? /\*\*State:\*\*\s*(\S+)/.exec(statusSection.rawBody) : null;
    if (stateMatch?.[1]?.trim() === 'deferred')
        return [];
    // Check behaviour reference
    if (data.behaviourRef) {
        const resolvedRef = resolve(dirname(filePath), data.behaviourRef);
        if (!existsSync(resolvedRef)) {
            const behaviourSection = doc.sections.get('behaviour');
            violations.push({
                type: 'error',
                filePath,
                line: behaviourSection?.startLine,
                code: 'BROKEN_BEHAVIOUR_REF',
                message: `Behaviour reference "${data.behaviourRef}" does not exist`,
            });
        }
    }
    // Check source files exist
    for (const srcFile of data.sourceFiles) {
        const resolved = resolveProjectPath(srcFile, repoRoot, node.absolutePath);
        if (resolved && !existsSync(resolved)) {
            violations.push({
                type: 'error',
                filePath,
                code: 'MISSING_SOURCE_FILE',
                message: `Source file "${srcFile}" does not exist on disk`,
            });
        }
    }
    // Check test files exist
    for (const testFile of data.testFiles) {
        const resolved = resolveProjectPath(testFile, repoRoot, node.absolutePath);
        if (resolved && !existsSync(resolved)) {
            violations.push({
                type: 'warning',
                filePath,
                code: 'MISSING_TEST_FILE',
                message: `Test file "${testFile}" does not exist on disk`,
            });
        }
    }
    // Check commit hashes exist in git history
    if (repoRoot) {
        for (const hash of data.commits) {
            if (!commitExists(hash, repoRoot)) {
                violations.push({
                    type: 'warning',
                    filePath,
                    code: 'COMMIT_NOT_FOUND',
                    message: `Commit "${hash}" does not exist in git history`,
                });
            }
        }
    }
    return violations;
}
function readBehaviourState(node) {
    try {
        const content = readFileSync(join(node.absolutePath, 'usecase.md'), 'utf-8');
        const doc = parseMarkdown(join(node.absolutePath, 'usecase.md'), content);
        const match = /\*\*State:\*\*\s*(\S+)/.exec(doc.sections.get('status')?.rawBody ?? '');
        return match?.[1]?.trim() ?? 'unknown';
    }
    catch {
        return 'unknown';
    }
}
function checkUnimplementedBehaviour(node) {
    const hasImplChild = node.children.some(c => c.marker === 'impl');
    if (hasImplChild)
        return [];
    if (readBehaviourState(node) === 'deferred')
        return [];
    return [{
            type: 'warning',
            filePath: join(node.absolutePath, 'usecase.md'),
            code: 'UNIMPLEMENTED_BEHAVIOUR',
            message: `Behaviour "${node.name}" has no implementation folders`,
        }];
}
/**
 * Try to resolve a project-relative path.
 * Paths starting with src/, test/, etc. are resolved from repo root.
 * Relative paths (../foo) are resolved from the impl folder.
 */
/**
 * Try to resolve a project-relative path.
 * Relative paths (../foo, ./foo) resolve from the impl folder.
 * Other paths (src/foo.ts) resolve from repo root, falling back to cwd.
 */
function resolveProjectPath(filePath, repoRoot, implDir) {
    if (filePath.startsWith('./') || filePath.startsWith('../')) {
        return resolve(implDir, filePath);
    }
    return resolve(repoRoot ?? process.cwd(), filePath);
}
//# sourceMappingURL=check-orphans.js.map